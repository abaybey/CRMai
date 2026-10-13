-- ====================================================================
-- RETAIL INTELLIGENCE OS - DEMO SEED DATA
-- Organization: Maison de Luxe Group (Luxury Bags, Shoes & Accessories)
-- ALL DATA LABELED DEMO
-- ====================================================================

-- 1. DEMO ORGANIZATION
INSERT INTO organizations (id, name, slug, timezone, currency)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '[DEMO] Maison de Luxe Group',
    'demo-maison-de-luxe',
    'Asia/Jakarta',
    'IDR'
) ON CONFLICT (slug) DO NOTHING;

-- 2. DEMO STORES
INSERT INTO stores (id, organization_id, code, name, location, active)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ST-PI-01', '[DEMO] Plaza Indonesia - Flagship', 'Level 1, Plaza Indonesia, Jakarta', true),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ST-PP-02', '[DEMO] Pacific Place - Boutique', 'Ground Floor, Pacific Place, SCBD Jakarta', true),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ST-SC-03', '[DEMO] Senayan City - Accessories Lounge', 'Level 1, Senayan City, Jakarta', true)
ON CONFLICT (organization_id, code) DO NOTHING;

-- 3. DEMO PROFILES
INSERT INTO profiles (id, organization_id, full_name, email, role, active)
VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '[DEMO] Budi Santoso', 'budi.santoso@maisondeluxe.demo', 'area_manager', true),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '[DEMO] Diana Putri', 'diana.putri@maisondeluxe.demo', 'store_manager', true),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '[DEMO] Siti Rahma', 'siti.rahma@maisondeluxe.demo', 'sales_associate', true),
    ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '[DEMO] Kevin Wijaya', 'kevin.wijaya@maisondeluxe.demo', 'sales_associate', true)
ON CONFLICT (email) DO NOTHING;

-- 4. STORE MEMBERS
INSERT INTO store_members (store_id, profile_id, assignment_start, active)
VALUES
    ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', NOW(), true),
    ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', NOW(), true),
    ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', NOW(), true)
ON CONFLICT DO NOTHING;

-- 5. DEMO CUSTOMERS
INSERT INTO customers (id, organization_id, customer_ref, full_name, phone, birthday, consent_status, tier, do_not_contact)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'CUST-001', '[DEMO] Ibu Clarissa Soeryadjaya', '+628111223344', '1988-10-18', 'opted_in', 'VIP', false),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'CUST-002', '[DEMO] Ibu Michelle Tan', '+628129876543', '1992-10-22', 'opted_in', 'Platinum', false),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'CUST-003', '[DEMO] Bapak Richard Halim', '+628135544332', '1984-11-05', 'opted_in', 'VIP', false),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'CUST-004', '[DEMO] Ibu Felicia Anggoro', '+628156677889', '1995-10-15', 'opted_in', 'Gold', false),
    ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'CUST-005', '[DEMO] Ibu Cindy Hartono', '+628178899001', '1990-04-12', 'opted_out', 'Platinum', true)
ON CONFLICT (organization_id, customer_ref) DO NOTHING;

-- 6. CUSTOMER ASSIGNMENTS (Siti Rahma handles Clarissa & Michelle; Kevin handles Richard & Felicia)
INSERT INTO customer_assignments (organization_id, customer_id, staff_id, store_id, assigned_by, active)
VALUES
    ('00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', true),
    ('00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', true),
    ('00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', true),
    ('00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', true)
ON CONFLICT DO NOTHING;

-- 7. DEMO CLIENTELING TASKS
INSERT INTO clienteling_tasks (id, organization_id, store_id, customer_id, assigned_staff_id, created_by, task_type, priority, due_at, status, recommended_action, notes)
VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'birthday_greeting', 'urgent', NOW() + INTERVAL '2 days', 'pending', 'Kirimkan ucapan ulang tahun hangat dan tawarkan private champagne viewing untuk koleksi Autumn/Winter.', 'Customer menyukai tas kulit calfskin warna burgundy.'),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'vip_new_arrival', 'high', NOW() + INTERVAL '1 days', 'pending', 'Undang untuk melihat pre-launch footwear capsule collection ukuran 38.', 'Pernah menanyakan ketersediaan heels edisi terbatas.'),
    ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'inactive_reactivation', 'medium', NOW() + INTERVAL '3 days', 'pending', 'Lakukan sentuhan sopan dengan menginformasikan layanan perawatan kulit eksklusif.', 'Belum berkunjung selama 90 hari terakhir.')
ON CONFLICT DO NOTHING;

-- 8. DEMO APPOINTMENTS
INSERT INTO appointments (id, organization_id, store_id, customer_id, staff_id, scheduled_at, status, notes)
VALUES
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', NOW() + INTERVAL '1 day 4 hours', 'scheduled', 'Private salon fitting untuk 2 item Autumn/Winter hand bags.')
ON CONFLICT DO NOTHING;
