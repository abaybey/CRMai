-- ====================================================================
-- RETAIL INTELLIGENCE OS - LUXURY FASHION RETAIL SCHEMA
-- Migration: 20261013000000_init_schema.sql
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STORES
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stores_org_code UNIQUE (organization_id, code)
);

-- 4. PROFILES (Tied to Supabase auth.users or internal auth)
CREATE TYPE user_role AS ENUM ('org_admin', 'area_manager', 'store_manager', 'sales_associate');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'sales_associate',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. STORE MEMBERS (Assignment history of staff to stores)
CREATE TABLE IF NOT EXISTS store_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assignment_end TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. IMPORT JOBS (Tracking DSR/Customer uploads)
CREATE TYPE import_job_status AS ENUM ('processing', 'completed', 'failed', 'partial');

CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    status import_job_status NOT NULL DEFAULT 'processing',
    row_count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    mapping_config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. IMPORT ROWS (Detailed audit of each row in an import job)
CREATE TABLE IF NOT EXISTS import_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    sanitized_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SALES DAILY (DSR daily aggregated store sales)
-- Uses NUMERIC(15, 2) to prevent floating-point inaccuracies
CREATE TABLE IF NOT EXISTS sales_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sales_date DATE NOT NULL,
    net_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
    target_amount NUMERIC(15, 2),
    transaction_count INT,
    units_sold INT,
    source_import_id UUID REFERENCES import_jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sales_daily_org_store_date UNIQUE (organization_id, store_id, sales_date)
);

-- 9. CUSTOMERS (Master customer directory with luxury tier & consent tracking)
CREATE TYPE consent_status_type AS ENUM ('opted_in', 'opted_out', 'pending');

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_ref VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    birthday DATE,
    consent_status consent_status_type NOT NULL DEFAULT 'opted_in',
    consent_source VARCHAR(100),
    consent_updated_at TIMESTAMPTZ,
    do_not_contact BOOLEAN NOT NULL DEFAULT false,
    tier VARCHAR(50) DEFAULT 'Regular',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_customers_org_ref UNIQUE (organization_id, customer_ref)
);

-- 10. TRANSACTIONS (Optional individual transaction records)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    transaction_ref VARCHAR(100) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    transaction_date TIMESTAMPTZ NOT NULL,
    net_amount NUMERIC(15, 2) NOT NULL,
    units INT NOT NULL DEFAULT 1,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    source_import_id UUID REFERENCES import_jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_transactions_org_ref UNIQUE (organization_id, transaction_ref)
);

-- 11. CUSTOMER ASSIGNMENTS (One active SA per customer)
CREATE TABLE IF NOT EXISTS customer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create partial unique index to guarantee only ONE active assignment per customer
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_customer_assignment 
ON customer_assignments(customer_id) 
WHERE active = true;

-- 12. CLIENTELING TASKS (Actionable follow-up tasks for SA)
CREATE TYPE clienteling_task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'snoozed');
CREATE TYPE clienteling_task_priority AS ENUM ('urgent', 'high', 'medium', 'low');

CREATE TABLE IF NOT EXISTS clienteling_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    assigned_staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    task_type VARCHAR(50) NOT NULL,
    priority clienteling_task_priority NOT NULL DEFAULT 'medium',
    due_at TIMESTAMPTZ NOT NULL,
    status clienteling_task_status NOT NULL DEFAULT 'pending',
    recommended_action TEXT NOT NULL,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    outcome TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CLIENTELING INTERACTIONS (Logs of touches, calls, WhatsApp, in-store visits)
CREATE TABLE IF NOT EXISTS clienteling_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES clienteling_tasks(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    interaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    outcome VARCHAR(50) NOT NULL,
    notes TEXT,
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. APPOINTMENTS (Luxury private styling and boutique previews)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    outcome TEXT,
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AI INSIGHTS (Deterministic-evidence backed AI management insights)
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scope_type VARCHAR(50) NOT NULL,
    scope_id VARCHAR(100) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    evidence JSONB NOT NULL,
    possible_explanations JSONB,
    recommended_actions JSONB NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    limitations JSONB,
    model_version VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 16. AUDIT LOGS (Security & compliance trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_stores_org ON stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_store_members_lookup ON store_members(store_id, profile_id, active);
CREATE INDEX IF NOT EXISTS idx_sales_daily_org_store_date ON sales_daily(organization_id, store_id, sales_date);
CREATE INDEX IF NOT EXISTS idx_customers_org_phone ON customers(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON customers(organization_id, birthday);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(organization_id, store_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_tasks_staff_status_due ON clienteling_tasks(assigned_staff_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON clienteling_interactions(customer_id, interaction_date);
CREATE INDEX IF NOT EXISTS idx_appointments_store_date ON appointments(store_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_scope ON ai_insights(organization_id, scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON audit_logs(organization_id, created_at);
