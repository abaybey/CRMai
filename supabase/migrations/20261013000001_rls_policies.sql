-- ====================================================================
-- RETAIL INTELLIGENCE OS - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20261013000001_rls_policies.sql
-- ====================================================================

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() AND active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid() AND active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_assigned_store_ids()
RETURNS SETOF UUID AS $$
  SELECT store_id FROM store_members WHERE profile_id = auth.uid() AND active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clienteling_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clienteling_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. ORGANIZATIONS POLICIES
CREATE POLICY "Users can only read their own organization"
ON organizations FOR SELECT
USING (id = auth_org_id());

-- 4. STORES POLICIES
CREATE POLICY "Users can read stores in their organization"
ON stores FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager')
    OR id IN (SELECT auth_assigned_store_ids())
  )
);

CREATE POLICY "Admins can manage stores"
ON stores FOR ALL
USING (organization_id = auth_org_id() AND auth_user_role() = 'org_admin');

-- 5. PROFILES POLICIES
CREATE POLICY "Users can read profiles in their organization"
ON profiles FOR SELECT
USING (organization_id = auth_org_id());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles"
ON profiles FOR ALL
USING (organization_id = auth_org_id() AND auth_user_role() = 'org_admin');

-- 6. SALES DAILY POLICIES
CREATE POLICY "Sales Daily read access based on role"
ON sales_daily FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager')
    OR store_id IN (SELECT auth_assigned_store_ids())
  )
);

CREATE POLICY "Managers and Admins can insert/update sales daily"
ON sales_daily FOR ALL
USING (
  organization_id = auth_org_id()
  AND auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
);

-- 7. CUSTOMERS POLICIES
-- Area & Store Managers see all customers in their store/org
-- Sales Associate can ONLY see customers assigned to them or unassigned in their store if permitted
CREATE POLICY "Customers read access scoped by assignment"
ON customers FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
    OR id IN (
      SELECT customer_id FROM customer_assignments
      WHERE staff_id = auth.uid() AND active = true
    )
  )
);

CREATE POLICY "Managers and Admins can manage customers"
ON customers FOR ALL
USING (
  organization_id = auth_org_id()
  AND auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
);

-- 8. CUSTOMER ASSIGNMENTS POLICIES
CREATE POLICY "View customer assignments"
ON customer_assignments FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
    OR staff_id = auth.uid()
  )
);

CREATE POLICY "Manage customer assignments"
ON customer_assignments FOR ALL
USING (
  organization_id = auth_org_id()
  AND auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
);

-- 9. CLIENTELING TASKS POLICIES
CREATE POLICY "View clienteling tasks"
ON clienteling_tasks FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager')
    OR (auth_user_role() = 'store_manager' AND store_id IN (SELECT auth_assigned_store_ids()))
    OR assigned_staff_id = auth.uid()
  )
);

CREATE POLICY "Staff can update their own assigned tasks"
ON clienteling_tasks FOR UPDATE
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
    OR assigned_staff_id = auth.uid()
  )
);

CREATE POLICY "Managers can insert clienteling tasks"
ON clienteling_tasks FOR INSERT
WITH CHECK (
  organization_id = auth_org_id()
  AND auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
);

-- 10. CLIENTELING INTERACTIONS POLICIES
CREATE POLICY "View clienteling interactions"
ON clienteling_interactions FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
    OR staff_id = auth.uid()
  )
);

CREATE POLICY "Staff can log interactions"
ON clienteling_interactions FOR INSERT
WITH CHECK (
  organization_id = auth_org_id()
  AND (staff_id = auth.uid() OR auth_user_role() IN ('org_admin', 'store_manager'))
);

-- 11. APPOINTMENTS POLICIES
CREATE POLICY "Appointments read access"
ON appointments FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager')
    OR (auth_user_role() = 'store_manager' AND store_id IN (SELECT auth_assigned_store_ids()))
    OR staff_id = auth.uid()
  )
);

CREATE POLICY "Manage appointments"
ON appointments FOR ALL
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
    OR staff_id = auth.uid()
  )
);

-- 12. IMPORT JOBS & ROWS POLICIES
CREATE POLICY "Manage import jobs"
ON import_jobs FOR ALL
USING (
  organization_id = auth_org_id()
  AND auth_user_role() IN ('org_admin', 'area_manager', 'store_manager')
);

CREATE POLICY "Read import rows"
ON import_rows FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM import_jobs j
    WHERE j.id = import_rows.import_job_id
    AND j.organization_id = auth_org_id()
  )
);

-- 13. AI INSIGHTS POLICIES
CREATE POLICY "View AI Insights"
ON ai_insights FOR SELECT
USING (
  organization_id = auth_org_id()
  AND (
    auth_user_role() IN ('org_admin', 'area_manager')
    OR (auth_user_role() = 'store_manager' AND scope_id IN (SELECT id::text FROM stores WHERE id IN (SELECT auth_assigned_store_ids())))
    OR (auth_user_role() = 'sales_associate' AND scope_id = auth.uid()::text)
  )
);

-- 14. AUDIT LOGS POLICIES
CREATE POLICY "Audit logs read by admins and area managers only"
ON audit_logs FOR SELECT
USING (
  organization_id = auth_org_id()
  AND auth_user_role() IN ('org_admin', 'area_manager')
);
