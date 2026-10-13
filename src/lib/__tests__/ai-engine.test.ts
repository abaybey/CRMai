import { describe, it, expect } from 'vitest';
import {
  buildStoreEvidence,
  generateLuxuryWhatsAppDraft,
  AiInsightResponseSchema,
} from '../ai-engine';
import { Customer, KpiSummary, Store } from '@/types';

describe('AI Engine & WhatsApp Generator', () => {
  const mockStore: Store = {
    id: 'store-1',
    organization_id: 'org-1',
    code: 'ST-01',
    name: 'Plaza Indonesia Boutique',
    active: true,
    created_at: '2026-01-01',
  };

  const mockKpiLagging: KpiSummary = {
    actualSales: 70_000_000,
    targetSales: 100_000_000,
    salesAchievement: 70,
    salesGap: 30_000_000,
    transactionCount: 7,
    unitsSold: 8,
    atv: 10_000_000,
    upt: 1.14,
    averageDailySales: 5_000_000,
    daysElapsed: 14,
    totalDaysInPeriod: 30,
    growthVsPrevious: -12,
    forecastSales: 150_000_000,
    forecastGap: 50_000_000,
    forecastMethod: 'Run-Rate Baseline',
  };

  describe('buildStoreEvidence', () => {
    it('produces an AI insight that conforms to the Zod schema and Section L spec', () => {
      const insight = buildStoreEvidence(mockStore, mockKpiLagging, '2026-10-01', '2026-10-14');

      // Verify with Zod schema directly
      const validated = AiInsightResponseSchema.parse(insight);
      expect(validated.scope_type).toBe('store');
      expect(validated.scope_id).toBe('store-1');
      expect(validated.priority).toBe('high');
      expect(validated.evidence.length).toBeGreaterThanOrEqual(3);
      expect(validated.recommended_actions.length).toBeGreaterThan(0);
      expect(validated.limitations?.length).toBeGreaterThan(0);

      // Verify no hallucinations or unstated assumptions
      expect(validated.limitations?.[0]).toContain('DSR transaksi tersimpan');
    });
  });

  describe('generateLuxuryWhatsAppDraft', () => {
    const validCustomer: Customer = {
      id: 'cust-1',
      organization_id: 'org-1',
      customer_ref: 'CUST-001',
      full_name: 'Ibu Clarissa',
      phone: '+628111223344',
      consent_status: 'opted_in',
      do_not_contact: false,
      tier: 'VIP',
      created_at: '2026-01-01',
    };

    const optOutCustomer: Customer = {
      ...validCustomer,
      id: 'cust-2',
      consent_status: 'opted_out',
      do_not_contact: true,
    };

    it('blocks outreach when customer has opted out or do_not_contact is true', () => {
      const result = generateLuxuryWhatsAppDraft({
        customer: optOutCustomer,
        staffName: 'Siti Rahma',
        storeName: 'Plaza Indonesia',
        templateType: 'birthday_greeting',
      });

      expect(result.allowed).toBe(false);
      expect(result.blockReason).toContain('Do Not Contact');
      expect(result.messageText).toBe('');
      expect(result.whatsappUrl).toBeUndefined();
    });

    it('generates a personalized luxury concierge message when customer opted in', () => {
      const result = generateLuxuryWhatsAppDraft({
        customer: validCustomer,
        staffName: 'Siti Rahma',
        storeName: 'Plaza Indonesia',
        templateType: 'birthday_greeting',
      });

      expect(result.allowed).toBe(true);
      expect(result.messageText).toContain('Ibu Clarissa');
      expect(result.messageText).toContain('Siti Rahma');
      expect(result.messageText).toContain('Plaza Indonesia');
      expect(result.messageText).toContain('private styling santai');
      expect(result.whatsappUrl).toContain('https://api.whatsapp.com/send?phone=628111223344');
    });

    it('creates polite new collection outreach without fictive price claims', () => {
      const result = generateLuxuryWhatsAppDraft({
        customer: validCustomer,
        staffName: 'Kevin Wijaya',
        storeName: 'Plaza Indonesia',
        templateType: 'vip_new_arrival',
        customContext: 'Koleksi Burgundy Leather Bag',
      });

      expect(result.allowed).toBe(true);
      expect(result.messageText).toContain('Koleksi Burgundy Leather Bag');
      expect(result.messageText).toContain('capsule collection edisi terbatas');
    });
  });
});
