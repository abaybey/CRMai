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
    code: 'ST-PS-03',
    name: '[DEMO] Plaza Senayan - Boutique',
    location: 'Level 1, Plaza Senayan, Jakarta Pusat',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    organization_id: DEMO_ORGANIZATION.id,
    code: 'ST-SC-04',
    name: '[DEMO] Senayan City - Boutique',
    location: 'Level 1, Senayan City, Jakarta Selatan',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    organization_id: DEMO_ORGANIZATION.id,
    code: 'ST-PIM-05',
    name: '[DEMO] Pondok Indah Mall - Boutique',
    location: 'Ground Floor, PIM 2, Jakarta Selatan',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    organization_id: DEMO_ORGANIZATION.id,
    code: 'ST-KOKAS-06',
    name: '[DEMO] Kota Kasablanka - Boutique',
    location: 'Ground Floor, Kota Kasablanka, Jakarta',
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
    store_id: '10000000-0000-0000-0000-000000000003', // Plaza Senayan
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Muhamad Ridwan Saputra',
    email: 'rdwansaputra@gmail.com',
    role: 'sales_associate',
    store_id: '10000000-0000-0000-0000-000000000003', // Plaza Senayan
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Keisha Suhendra',
    email: 'keisha.suhendra@maisondeluxe.demo',
    role: 'sales_associate',
    store_id: '10000000-0000-0000-0000-000000000003', // Plaza Senayan
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    organization_id: DEMO_ORGANIZATION.id,
    full_name: '[DEMO] Farah Khansa Nabilah',
    email: 'farah.khansa@maisondeluxe.demo',
    role: 'sales_associate',
    store_id: '10000000-0000-0000-0000-000000000003', // Plaza Senayan
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Generate 14 days of October 2026 DSR data matching the real luxury DSR figures from contohdsr
export function generateDemoDsrData(): SalesDaily[] {
  const records: SalesDaily[] = [];

  // Actual daily net sales pattern extracted directly from TB Sales Closing Update (October sheet)
  const piDailySales = [
    72440000, 51700000, 64600000, 164000000, 34100000, 51900000, 24200000,
    26200000, 56510000, 134510000, 67910000, 53750000, 29040000, 48200000,
  ];

  const psDailySales = [
    90555000, 49750000, 72630000, 194250000, 82690000, 70540000, 13865000,
    30680000, 53450000, 151600000, 84200000, 61500000, 39500000, 54200000,
  ];

  const scDailySales = [
    35260000, 30620000, 58870000, 98490000, 48990000, 13400000, 62530000,
    21500000, 41200000, 89500000, 38400000, 44200000, 18900000, 32100000,
  ];

  for (let day = 1; day <= 14; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const date = `2026-10-${dayStr}`;

    // Plaza Indonesia (Target ~65M/day)
    const piActual = piDailySales[day - 1] || 50000000;
    const piTx = Math.max(2, Math.round(piActual / 18000000));
    records.push({
      id: `dsr-pi-${day}`,
      organization_id: DEMO_ORGANIZATION.id,
      store_id: DEMO_STORES[0].id,
      sales_date: date,
      net_sales: piActual,
      target_amount: 65000000,
      transaction_count: piTx,
      units_sold: Math.round(piTx * 1.6),
      walk_in_sales: Math.round(piActual * 0.55),
      clienteling_sales: Math.round(piActual * 0.35),
      appointment_sales: Math.round(piActual * 0.1),
      created_at: `${date}T22:00:00Z`,
    });

    // Plaza Senayan (Target ~75M/day)
    const psActual = psDailySales[day - 1] || 60000000;
    const psTx = Math.max(3, Math.round(psActual / 16500000));
    records.push({
      id: `dsr-ps-${day}`,
      organization_id: DEMO_ORGANIZATION.id,
      store_id: DEMO_STORES[2].id,
      sales_date: date,
      net_sales: psActual,
      target_amount: 75000000,
      transaction_count: psTx,
      units_sold: Math.round(psTx * 1.7),
      walk_in_sales: Math.round(psActual * 0.5),
      clienteling_sales: Math.round(psActual * 0.4),
      appointment_sales: Math.round(psActual * 0.1),
      created_at: `${date}T22:00:00Z`,
    });

    // Senayan City (Target ~45M/day)
    const scActual = scDailySales[day - 1] || 35000000;
    const scTx = Math.max(2, Math.round(scActual / 17000000));
    records.push({
      id: `dsr-sc-${day}`,
      organization_id: DEMO_ORGANIZATION.id,
      store_id: DEMO_STORES[3].id,
      sales_date: date,
      net_sales: scActual,
      target_amount: 45000000,
      transaction_count: scTx,
      units_sold: Math.round(scTx * 1.3),
      walk_in_sales: Math.round(scActual * 0.65),
      clienteling_sales: Math.round(scActual * 0.25),
      appointment_sales: Math.round(scActual * 0.1),
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
    birthday: '1988-10-18', // In 4 days
    consent_status: 'opted_in',
    consent_source: 'Plaza Senayan Boutique registration',
    consent_updated_at: '2026-01-15T10:00:00Z',
    do_not_contact: false,
    tier: 'VIP',
    total_spend: 380_000_000,
    last_purchase_date: '2026-09-28',
    created_at: '2025-05-10T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-002',
    full_name: '[DEMO] Ibu Nurul Nurul',
    phone: '+628129876543',
    birthday: '1992-10-22',
    consent_status: 'opted_in',
    consent_source: 'VIP Salon preview (Plaza Senayan)',
    consent_updated_at: '2026-02-10T10:00:00Z',
    do_not_contact: false,
    tier: 'Platinum',
    total_spend: 195_000_000,
    last_purchase_date: '2026-09-01',
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
    last_purchase_date: '2026-08-12',
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    organization_id: DEMO_ORGANIZATION.id,
    customer_ref: 'CUST-004',
    full_name: '[DEMO] Ibu Felicia Anggoro',
    phone: '+628156677889',
    birthday: '1995-10-15', // In 1 day
    consent_status: 'opted_in',
    consent_source: 'Plaza Senayan concierge',
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
    consent_status: 'opted_out',
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
    store_id: '10000000-0000-0000-0000-000000000003', // Plaza Senayan
    customer_id: '30000000-0000-0000-0000-000000000001',
    assigned_staff_id: '20000000-0000-0000-0000-000000000003', // Muhamad Ridwan Saputra
    created_by: '20000000-0000-0000-0000-000000000002',
    task_type: 'birthday_greeting',
    priority: 'urgent',
    due_at: '2026-10-16T10:00:00Z',
    status: 'pending',
    recommended_action: 'Kirimkan ucapan selamat ulang tahun personal dan tawarkan private preview koleksi Eleanor Loafer & Reva Ballet terbaru.',
    notes: 'Ibu Clarissa menyukai ballet shoes ukuran 38 dan Charlie Quilted Shoulder Bag.',
    created_at: '2026-10-12T08:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: '10000000-0000-0000-0000-000000000003',
    customer_id: '30000000-0000-0000-0000-000000000002',
    assigned_staff_id: '20000000-0000-0000-0000-000000000003', // Muhamad Ridwan Saputra
    created_by: '20000000-0000-0000-0000-000000000002',
    task_type: 'vip_new_arrival',
    priority: 'high',
    due_at: '2026-10-15T14:00:00Z',
    status: 'pending',
    recommended_action: 'Undang untuk melihat Reva Heel Ballet 25MM dan Icon Ring yang baru tiba di Plaza Senayan.',
    notes: 'Pembelian terakhir: Reva Heel Ballet.',
    created_at: '2026-10-13T09:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: '10000000-0000-0000-0000-000000000003',
    customer_id: '30000000-0000-0000-0000-000000000004',
    assigned_staff_id: '20000000-0000-0000-0000-000000000004', // Keisha Suhendra
    created_by: '20000000-0000-0000-0000-000000000002',
    task_type: 'birthday_greeting',
    priority: 'urgent',
    due_at: '2026-10-15T11:00:00Z',
    status: 'pending',
    recommended_action: 'Kirimkan ucapan ulang tahun hangat dan undang ke Plaza Senayan untuk complimentary accessory care.',
    notes: 'Ulang tahun tanggal 15 Oktober.',
    created_at: '2026-10-13T10:00:00Z',
  },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    store_id: '10000000-0000-0000-0000-000000000003',
    customer_id: '30000000-0000-0000-0000-000000000001',
    staff_id: '20000000-0000-0000-0000-000000000003',
    scheduled_at: '2026-10-14T15:00:00Z',
    status: 'scheduled',
    notes: 'Private salon preview: Eleanor Loafer & Charlie Quilted Bag collection.',
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
    notes: 'Ibu Clarissa merespons positif terkait koleksi Eleanor Loafer.',
    created_at: '2026-09-20T11:35:00Z',
  },
];

export const DEMO_AI_INSIGHTS: AiInsight[] = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    scope_type: 'store',
    scope_id: '10000000-0000-0000-0000-000000000004', // Senayan City
    insight_type: 'achievement_gap',
    title: 'Senayan City: Kesenjangan Target 22% & Peluang Akselerasi UPT',
    summary: 'Pencapaian penjualan Senayan City berada di level 78.4% dengan gap Rp 136.000.000 MTD. Rata-rata unit produk per transaksi (UPT 1.3) menunjukkan dominasi transaksi single-item.',
    period_start: '2026-10-01',
    period_end: '2026-10-14',
    evidence: [
      {
        metric: 'sales_achievement',
        actual: 78.4,
        comparison: 94.2,
        target: 100,
        unit: 'percent',
        context: 'Performa Senayan City vs Plaza Senayan & Plaza Indonesia',
      },
      {
        metric: 'upt',
        actual: 1.3,
        comparison: 1.7,
        unit: 'units',
        context: 'Units Per Transaction Senayan City vs Benchmark',
      },
      {
        metric: 'sales_gap',
        actual: 136000000,
        unit: 'currency_idr',
        context: 'Akumulasi kekurangan target MTD',
      },
    ],
    possible_explanations: [
      'Peluang cross-selling aksesori pendamping (card case, scarf, bracelet) belum optimal saat transaksi alas kaki atau tas utama.',
    ],
    recommended_actions: [
      'Fokuskan briefing Store Manager ke SA pada teknik penawaran luxury add-ons (card case, jewelry) di counter kasir.',
      'Jadwalkan aktivasi personal outreach untuk tamu VIP yang belum berkunjung dalam 45 hari.',
    ],
    priority: 'high',
    limitations: [
      'Data traffic fisik gerai tidak tersedia dalam DSR sehingga tingkat konversi gerai tidak dapat disimpulkan.',
    ],
    model_version: 'RetailIntel-Deterministic-v1',
    status: 'active',
    generated_at: '2026-10-14T06:00:00Z',
  },
];
