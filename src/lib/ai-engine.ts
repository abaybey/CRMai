import { z } from 'zod';
import { AiInsight, Customer, KpiSummary, Store } from '@/types';

// Zod Schema for Evidence
export const AiEvidenceSchema = z.object({
  metric: z.string(),
  actual: z.number(),
  comparison: z.number().nullable().optional(),
  target: z.number().nullable().optional(),
  unit: z.enum(['percent', 'currency_idr', 'count', 'units']),
  context: z.string().optional(),
});

// Zod Schema for Structured AI Insight
export const AiInsightResponseSchema = z.object({
  title: z.string().min(5),
  summary: z.string().min(10),
  scope_type: z.enum(['store', 'area', 'staff']),
  scope_id: z.string(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  evidence: z.array(AiEvidenceSchema).min(1),
  possible_explanations: z.array(z.string()).default([]),
  recommended_actions: z.array(z.string()).min(1),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  limitations: z.array(z.string()).default([]),
});

export type ValidatedAiInsight = z.infer<typeof AiInsightResponseSchema>;

/**
 * Builds deterministic evidence for a store's performance.
 */
export function buildStoreEvidence(
  store: Store,
  kpi: KpiSummary,
  periodStart: string,
  periodEnd: string
): AiInsight {
  const evidenceList: z.infer<typeof AiEvidenceSchema>[] = [];

  if (kpi.salesAchievement !== null) {
    evidenceList.push({
      metric: 'sales_achievement',
      actual: Math.round(kpi.salesAchievement * 10) / 10,
      target: 100,
      unit: 'percent',
      context: 'Pencapaian penjualan terhadap target periode berjalan',
    });
  }

  if (kpi.salesGap !== null) {
    evidenceList.push({
      metric: 'sales_gap',
      actual: kpi.salesGap,
      unit: 'currency_idr',
      context: kpi.salesGap > 0 ? 'Kekurangan omzet terhadap target' : 'Surplus omzet di atas target',
    });
  }

  if (kpi.upt !== null) {
    evidenceList.push({
      metric: 'upt',
      actual: Math.round(kpi.upt * 100) / 100,
      comparison: 1.6, // Retail luxury standard baseline
      unit: 'units',
      context: 'Rata-rata unit produk per transaksi (UPT)',
    });
  }

  if (kpi.atv !== null) {
    evidenceList.push({
      metric: 'atv',
      actual: Math.round(kpi.atv),
      unit: 'currency_idr',
      context: 'Nilai rata-rata per transaksi (Average Transaction Value)',
    });
  }

  // Heuristic rule-based reasoning based purely on verified evidence
  const possibleExplanations: string[] = [];
  const recommendedActions: string[] = [];
  let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
  let title = `${store.name}: Performa Periode Stabil`;
  let summary = `Pencapaian target toko mencapai ${kpi.salesAchievement ? kpi.salesAchievement.toFixed(1) + '%' : 'N/A'}.`;

  if (kpi.salesAchievement !== null && kpi.salesAchievement < 80) {
    priority = 'high';
    title = `${store.name}: Defisit Target Penjualan (${kpi.salesAchievement.toFixed(1)}%)`;
    summary = `Toko mengalami keterlambatan target penjualan sebesar Rp ${(kpi.salesGap || 0).toLocaleString('id-ID')} dengan run-rate MTD yang membutuhkan akselerasi clienteling aktif.`;

    if (kpi.upt !== null && kpi.upt < 1.4) {
      possibleExplanations.push(
        'Rasio UPT rendah (1.2 - 1.3) mengindikasikan sebagian besar transaksi hanya berupa pembelian single-item tanpa cross-selling produk pendamping.'
      );
      recommendedActions.push(
        'Fokuskan coaching Store Manager ke SA pada teknik penawaran luxury add-ons (leather wallet, silk twilly, shoe protection kit) di kasir.'
      );
    }

    possibleExplanations.push(
      'Frekuensi kunjungan customer VIP dan recurring appointment masih di bawah target bulanan.'
    );
    recommendedActions.push(
      'Jadwalkan aktivasi personal follow-up untuk 15 customer VIP teratas yang belum dikontak dalam 45 hari.'
    );
  } else if (kpi.salesAchievement !== null && kpi.salesAchievement >= 100) {
    priority = 'low';
    title = `${store.name}: Melampaui Target (${kpi.salesAchievement.toFixed(1)}%)`;
    summary = `Toko sukses melampaui target periode dengan surplus omzet sebesar Rp ${Math.abs(kpi.salesGap || 0).toLocaleString('id-ID')}.`;
    recommendedActions.push(
      'Pertahankan momentum dengan mengamankan VIP private appointments untuk preview koleksi high-value berikutnya.'
    );
  } else {
    // Moderate performance (80% - 99.9%)
    priority = 'medium';
    title = `${store.name}: Performa Mendekati Target (${kpi.salesAchievement ? kpi.salesAchievement.toFixed(1) + '%' : 'N/A'})`;
    summary = `Pencapaian penjualan berada dalam trajektori stabil namun memerlukan dorongan cross-selling di sisa periode berjalan.`;
    recommendedActions.push(
      'Tingkatkan aktivitas outreach clienteling untuk tamu berulang guna menutup gap sisa target MTD.'
    );
    recommendedActions.push(
      'Pantau ketersediaan stok aksesoris pelengkap untuk memaksimalkan UPT saat peak traffic weekend.'
    );
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('Lakukan pemantauan harian DSR dan koordinasikan briefing pagi bersama staf.');
  }

  const limitations = [
    'Analisis dihasilkan dari data DSR transaksi tersimpan.',
    'Data visitor foot-traffic fisik tidak tersedia dalam DSR sehingga tingkat konversi gerai tidak dapat disimpulkan.',
  ];

  const insight: AiInsight = {
    id: `insight-${store.id}-${periodEnd}`,
    organization_id: store.organization_id,
    scope_type: 'store',
    scope_id: store.id,
    insight_type: kpi.salesAchievement !== null && kpi.salesAchievement < 80 ? 'achievement_gap' : 'clienteling_boost',
    title,
    summary,
    period_start: periodStart,
    period_end: periodEnd,
    evidence: evidenceList,
    possible_explanations: possibleExplanations,
    recommended_actions: recommendedActions,
    priority,
    limitations,
    model_version: 'RetailIntel-Deterministic-Engine-v1',
    status: 'active',
    generated_at: `${periodEnd}T06:00:00Z`,
  };

  // Validate with Zod before returning to ensure deterministic data contract
  AiInsightResponseSchema.parse(insight);

  return insight;
}

export interface WhatsAppDraftRequest {
  customer: Customer;
  staffName: string;
  storeName: string;
  templateType:
    | 'birthday_greeting'
    | 'vip_new_arrival'
    | 'inactive_reactivation'
    | 'appointment_followup'
    | 'post_visit_followup';
  customContext?: string;
}

export interface WhatsAppDraftResult {
  allowed: boolean;
  blockReason?: string;
  messageText: string;
  whatsappUrl?: string;
}

/**
 * Generates an elegant, high-touch luxury concierge WhatsApp message.
 * Strictly respects GDPR/UU PDP consent status and do_not_contact flags.
 */
export function generateLuxuryWhatsAppDraft(req: WhatsAppDraftRequest): WhatsAppDraftResult {
  const { customer, staffName, storeName, templateType, customContext } = req;

  // Strict Compliance Verification
  if (customer.do_not_contact) {
    return {
      allowed: false,
      blockReason: 'Pelanggan memiliki status "Do Not Contact" (opt-out). Pesan tidak boleh dikirimkan.',
      messageText: '',
    };
  }

  if (customer.consent_status === 'opted_out') {
    return {
      allowed: false,
      blockReason: 'Pelanggan telah mencabut izin komunikasi (opted-out). Hormati privasi pelanggan.',
      messageText: '',
    };
  }

  const customerGreeting = customer.full_name.replace('[DEMO] ', '');
  let message = '';

  switch (templateType) {
    case 'birthday_greeting':
      message =
        `Selamat pagi/siang ${customerGreeting},\n\n` +
        `Saya ${staffName} dari ${storeName}. Dari lubuk hati kami, kami mengucapkan selamat menyambut hari ulang tahun yang penuh kebahagiaan dan berkah.\n\n` +
        `Sebagai apresiasi atas kesetiaan Ibu/Bapak bersama kami, kami telah menyiapkan private birthday privilege spesial serta koleksi kurasi terbaru di boutique kami.\n\n` +
        `Apabila berkenan, kami dengan senang hati menyambut kehadiran Ibu/Bapak untuk sesi private styling santai dengan hidangan teh hangat. Mohon kabari kami waktu terbaik yang nyaman bagi Ibu/Bapak.\n\n` +
        `Salam hangat,\n${staffName}\n${storeName}`;
      break;

    case 'vip_new_arrival':
      message =
        `Selamat pagi/siang ${customerGreeting},\n\n` +
        `Semoga kabar Ibu/Bapak senantiasa sehat dan menyenangkan. Saya ${staffName} dari ${storeName}.\n\n` +
        `Mengingat preferensi istimewa Ibu/Bapak terhadap koleksi premium kami, kami baru saja menerima capsule collection edisi terbatas Autumn/Winter langsung dari Paris.\n\n` +
        (customContext ? `Catatan koleksi: ${customContext}\n\n` : '') +
        `Sebelum dibuka untuk publik, kami ingin memberikan kesempatan preview eksklusif untuk Ibu/Bapak terlebih dahulu. Apakah ada waktu luang di minggu ini untuk kami siapkan private salon viewing?\n\n` +
        `Terima kasih dan salam hangat,\n${staffName}\n${storeName}`;
      break;

    case 'inactive_reactivation':
      message =
        `Selamat pagi/siang ${customerGreeting},\n\n` +
        `Saya ${staffName} dari ${storeName}. Semoga Ibu/Bapak dalam keadaan baik dan sehat selalu.\n\n` +
        `Sudah cukup lama sejak kunjungan terakhir Ibu/Bakat di boutique kami, dan kami sangat merindukan kehadiran Ibu/Bapak.\n\n` +
        `Kami ingin mengabarkan layanan complimentary leather & accessory care khusus untuk produk yang pernah Ibu/Bapak miliki, sekaligus memperlihatkan pilihan scarf dan aksesori pelengkap terbaru.\n\n` +
        `Pintu boutique kami selalu terbuka hangat menyambut Ibu/Bapak kembali.\n\n` +
        `Salam hangat,\n${staffName}\n${storeName}`;
      break;

    case 'appointment_followup':
      message =
        `Selamat pagi/siang ${customerGreeting},\n\n` +
        `Saya ${staffName} dari ${storeName}.\n\n` +
        `Menindaklanjuti rencana janji temu kita, kami telah menyiapkan private room dan kurasi item istimewa khusus untuk Ibu/Bapak.\n\n` +
        `Kami menantikan kehadiran Ibu/Bapak. Jika ada penyesuaian jadwal atau preferensi khusus yang ingin disiapkan terlebih dahulu, jangan ragu untuk mengabari saya.\n\n` +
        `Salam hangat,\n${staffName}\n${storeName}`;
      break;

    case 'post_visit_followup':
      message =
        `Selamat pagi/siang ${customerGreeting},\n\n` +
        `Terima kasih banyak atas waktu berharga Ibu/Bapak telah berkunjung ke ${storeName} kemarin. Merupakan kehormatan bagi saya pribadi dapat melayani Ibu/Bapak.\n\n` +
        `Semoga koleksi yang dipilih membawa kebahagiaan dan melengkapi gaya istimewa Ibu/Bapak. Jika memerlukan perawatan atau panduan styling produk tersebut, saya selalu siap membantu kapan pun.\n\n` +
        `Salam hangat,\n${staffName}\n${storeName}`;
      break;
  }

  // Construct Safe WhatsApp URL if phone exists
  let whatsappUrl: string | undefined;
  if (customer.phone) {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  }

  return {
    allowed: true,
    messageText: message,
    whatsappUrl,
  };
}
