import {
  Organization,
  Store,
  Profile,
  SalesDaily,
  Customer,
  ClientelingTask,
  ClientelingInteraction,
  Appointment,
  AiInsight,
} from '@/types';

export const DEMO_ORGANIZATION: Organization = {
  id: '00000000-0000-0000-0000-000000000001',
  name: '[DEMO] Maison de Luxe Group',
  slug: 'demo-maison-de-luxe',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  created_at: '2026-01-01T00:00:00Z',
};

export const DEMO_STORES: Store[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    code: 'ST-PI-01',
    name: '[DEMO] Plaza Indonesia - Flagship',
    location: 'Level 1, Plaza Indonesia, Jakarta Pusat',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    code: 'ST-PP-02',
    name: '[DEMO] Pacific Place - Boutique',
    location: 'Ground Floor, Pacific Place, SCBD Jakarta',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    code: 'ST-SC-03',
    name: '[DEMO] Senayan City - Lounge',
    location: 'Level 1, Senayan City, Jakarta Selatan',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const DEMO_PROFILES: Profile[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Budi Santoso',
    email: 'budi.santoso@maisondeluxe.demo',
    role: 'area_manager',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Diana Putri',
    email: 'diana.putri@maisondeluxe.demo',
    role: 'store_manager',
    store_id: '10000000-0000-0000-0000-000000000001',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Siti Rahma',
    email: 'siti.rahma@maisondeluxe.demo',
    role: 'sales_associate',
    store_id: '10000000-0000-0000-0000-000000000001',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Kevin Wijaya',
    email: 'kevin.wijaya@maisondeluxe.demo',
    role: 'sales_associate',
    store_id: '10000000-0000-0000-0000-000000000001',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Michael Chen',
    email: 'michael.chen@maisondeluxe.demo',
    role: 'store_manager',
    store_id: '10000000-0000-0000-0000-000000000002',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Generate 30 days of realistic DSR data for October 2026 for each store
export function generateDemoDsrData(): SalesDaily[] {
  const records: SalesDaily[] = [];
  const baseTargetPI = 75_000_000;
  const baseTargetPP = 60_000_000;
  const baseTargetSC = 45_000_000;

  for (let day = 1; day <= 14; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const date = `2026-10-${dayStr}`;

    // Plaza Indonesia (Achievement ~92%)
    const piActual = Math.round((baseTargetPI * (0.85 + (day % 4) * 0.05)) / 1000) * 1000;
    const piTx = Math.max(2, Math.round(piActual / 22_000_000));
    records.push({
      id: `dsr-pi-${day}`,
      organization_id: DEMO_ORGANIZATION.id,
      store_id: DEMO_STORES[0].id,
      sales_date: date,
      net_sales: piActual,
      target_amount: baseTargetPI,
      transaction_count: piTx,
      units_sold: Math.round(piTx * 1.6),
      created_at: `${date}T22:00:00Z`,
    });

    // Pacific Place (Achievement ~105% - Exceeding target)
    const ppActual = Math.round((baseTargetPP * (0.95 + (day % 3) * 0.08)) / 1000) * 1000;
    const ppTx = Math.max(2, Math.round(ppActual / 25_000_000));
    records.push({
      id: `dsr-pp-${day}`,
      organization_id: DEMO_ORGANIZATION.id,
      store_id: DEMO_STORES[1].id,
      sales_date: date,
      net_sales: ppActual,
      target_amount: baseTargetPP,
      transaction_count: ppTx,
      units_sold: Math.round(ppTx * 1.8),
      created_at: `${date}T22:00:00Z`,
    });

    // Senayan City (Achievement ~78% - Needs Attention)
    const scActual = Math.round((baseTargetSC * (0.70 + (day % 3) * 0.06)) / 1000) * 1000;
    const scTx = Math.max(1, Math.round(scActual / 18_000_000));
    records.push({
      id: `dsr-sc-${day}`,
      organization_id: DEMO_ORGANIZATION.id,
      store_id: DEMO_STORES[2].id,
      sales_date: date,
      net_sales: scActual,
      target_amount: baseTargetSC,
      transaction_count: scTx,
      units_sold: Math.round(scTx * 1.2),
      created_at: `${date}T22:00:00Z`,
    });
  }

  return records;
}

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-001',
    full_name: '[DEMO] Ibu Clarissa Soeryadjaya',
    phone: '+628111223344',
    birthday: '1988-10-18', // Upcoming in 5 days
    consent_status: 'opted_in',
    consent_source: 'In-store registration',
    consent_updated_at: '2026-01-15T10:00:00Z',
    do_not_contact: false,
    tier: 'VIP',
    total_spend: 380_000_000,
    last_purchase_date: '2026-08-20',
    created_at: '2025-05-10T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-002',
    full_name: '[DEMO] Ibu Michelle Tan',
    phone: '+628129876543',
    birthday: '1992-10-22', // Upcoming in 9 days
    consent_status: 'opted_in',
    consent_source: 'VIP Salon preview',
    consent_updated_at: '2026-02-10T10:00:00Z',
    do_not_contact: false,
    tier: 'Platinum',
    total_spend: 195_000_000,
    last_purchase_date: '2026-09-05',
    created_at: '2025-08-14T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-003',
    full_name: '[DEMO] Bapak Richard Halim',
    phone: '+628135544332',
    birthday: '1984-11-05',
    consent_status: 'opted_in',
    consent_source: 'Private order',
    consent_updated_at: '2026-03-01T10:00:00Z',
    do_not_contact: false,
    tier: 'VIP',
    total_spend: 420_000_000,
    last_purchase_date: '2026-07-12',
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-004',
    full_name: '[DEMO] Ibu Felicia Anggoro',
    phone: '+628156677889',
    birthday: '1995-10-15', // Upcoming in 2 days
    consent_status: 'opted_in',
    consent_source: 'Website concierge',
    consent_updated_at: '2026-04-12T10:00:00Z',
    do_not_contact: false,
    tier: 'Gold',
    total_spend: 85_000_000,
    last_purchase_date: '2026-09-28',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-005',
    full_name: '[DEMO] Ibu Cindy Hartono',
    phone: '+628178899001',
    birthday: '1990-04-12',
    consent_status: 'opted_out', // Opted-out: MUST NOT BE CONTACTED
    consent_source: 'Customer request',
    consent_updated_at: '2026-05-01T10:00:00Z',
    do_not_contact: true,
    tier: 'Platinum',
    total_spend: 140_000_000,
    last_purchase_date: '2026-04-20',
    created_at: '2025-06-18T00:00:00Z',
  },
];

export const DEMO_TASKS: ClientelingTask[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: DEMO_STORES[0].id,
    customer_id: '30000000-0000-0000-0000-000000000001',
    assigned_staff_id: '20000000-0000-0000-0000-000000000003', // Siti Rahma
    created_by: '20000000-0000-0000-0000-000000000002',
    task_type: 'birthday_greeting',
    priority: 'urgent',
    due_at: '2026-10-16T10:00:00Z',
    status: 'pending',
    recommended_action: 'Kirimkan ucapan selamat ulang tahun hangat, tawarkan private salon preview Autumn/Winter.',
    notes: 'Ibu Clarissa sangat menggemari calfskin bags warna burgundy.',
    created_at: '2026-10-12T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: DEMO_STORES[0].id,
    customer_id: '30000000-0000-0000-0000-000000000002',
    assigned_staff_id: '20000000-0000-0000-0000-000000000003', // Siti Rahma
    created_by: '20000000-0000-0000-0000-000000000002',
    task_type: 'vip_new_arrival',
    priority: 'high',
    due_at: '2026-10-15T14:00:00Z',
    status: 'pending',
    recommended_action: 'Undang untuk melihat footwear capsule collection ukuran 38 yang baru tiba.',
    notes: 'Pernah reservasi heels edisi terbatas.',
    created_at: '2026-10-13T09:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: DEMO_STORES[0].id,
    customer_id: '30000000-0000-0000-0000-000000000004',
    assigned_staff_id: '20000000-0000-0000-0000-000000000004', // Kevin Wijaya
    created_by: '20000000-0000-0000-0000-000000000002',
    task_type: 'birthday_greeting',
    priority: 'urgent',
    due_at: '2026-10-15T11:00:00Z',
    status: 'pending',
    recommended_action: 'Kirimkan birthday privilege gift card digital dan undangan private styling.',
    notes: 'Ulang tahun tanggal 15 Oktober.',
    created_at: '2026-10-13T10:00:00Z',
  },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: DEMO_STORES[0].id,
    customer_id: '30000000-0000-0000-0000-000000000001',
    staff_id: '20000000-0000-0000-0000-000000000003',
    scheduled_at: '2026-10-14T15:00:00Z',
    status: 'scheduled',
    notes: 'Private salon preview: Autumn/Winter Exotic Handbags collection.',
    created_at: '2026-10-12T10:00:00Z',
  },
];

export const DEMO_INTERACTIONS: ClientelingInteraction[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    customer_id: '30000000-0000-0000-0000-000000000001',
    staff_id: '20000000-0000-0000-0000-000000000003',
    channel: 'whatsapp',
    interaction_type: 'outreach',
    interaction_date: '2026-09-20T11:30:00Z',
    outcome: 'positive',
    notes: 'Ibu Clarissa merespons hangat dan tertarik untuk janji temu minggu depan.',
    created_at: '2026-09-20T11:35:00Z',
  },
];

export const DEMO_AI_INSIGHTS: AiInsight[] = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    scope_type: 'store',
    scope_id: DEMO_STORES[2].id, // Senayan City
    insight_type: 'achievement_gap',
    title: 'Senayan City: Kesenjangan Target 22% & UPT Rendah (1.2)',
    summary: 'Pencapaian penjualan Senayan City berada di level 78.4% dengan gap Rp 136.000.000 pada MTD Oktober. Rendahnya UPT (1.2 vs benchmark 1.8) mengindikasikan transaksi single-item dominan.',
    period_start: '2026-10-01',
    period_end: '2026-10-14',
    evidence: [
      {
        metric: 'sales_achievement',
        actual: 78.4,
        comparison: 92.1,
        target: 100,
        unit: 'percent',
        context: 'Performa Senayan City vs Rata-rata Brand',
      },
      {
        metric: 'upt',
        actual: 1.2,
        comparison: 1.8,
        unit: 'units',
        context: 'Units Per Transaction Senayan City vs Pacific Place',
      },
      {
        metric: 'sales_gap',
        actual: 136000000,
        unit: 'currency_idr',
        context: 'Akumulasi kekurangan target MTD',
      },
    ],
    possible_explanations: [
      'Staf belum konsisten menawarkan bundling pelengkap (seperti card holder, scarf sutra, atau shoe care kit) saat pembelian tas utama.',
      'Aksesori footwear ukuran populer mengalami stock-out parsial di gerai Senayan City.',
    ],
    recommended_actions: [
      'Jadwalkan sesi coaching Store Manager terkait teknik cross-selling aksesori pendamping di counter kasir.',
      'Luncurkan kampanye clienteling reaktivasi untuk 18 customer VIP Senayan City yang belum berkunjung dalam 60 hari.',
    ],
    priority: 'high',
    limitations: [
      'Data traffic visitor belum terintegrasi; analisis didasarkan murni pada agregat DSR transaksi tersimpan.',
    ],
    model_version: 'RetailIntel-Deterministic-v1',
    status: 'active',
    generated_at: '2026-10-14T06:00:00Z',
  },
];
