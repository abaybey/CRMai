import { describe, it, expect, beforeEach } from 'vitest';
import { retailDataStore } from '../data-store';
import { generateLuxuryWhatsAppDraft } from '../ai-engine';
import { sanitizeCellValue } from '../import-engine';

describe('Security & Multi-Tenant Authorization Tests', () => {
  beforeEach(() => {
    retailDataStore.resetDemoData();
  });

  describe('Customer Data Scoping & Role Isolation', () => {
    it('restricts Sales Associate to ONLY assigned customers', () => {
      // Switch profile to Siti Rahma (SA)
      retailDataStore.setCurrentProfile('20000000-0000-0000-0000-000000000003');

      const customers = retailDataStore.getCustomers();
      expect(customers.length).toBe(2);

      // Siti should only see CUST-001 and CUST-002
      const refs = customers.map(c => c.customer_ref);
      expect(refs).toContain('CUST-001');
      expect(refs).toContain('CUST-002');
      expect(refs).not.toContain('CUST-003'); // Belongs to Kevin Wijaya
      expect(refs).not.toContain('CUST-004'); // Belongs to Kevin Wijaya
    });

    it('prevents Sales Associate from viewing customers belonging to another SA', () => {
      // Switch profile to Kevin Wijaya (SA)
      retailDataStore.setCurrentProfile('20000000-0000-0000-0000-000000000004');

      const customers = retailDataStore.getCustomers();
      const refs = customers.map(c => c.customer_ref);
      expect(refs).toContain('CUST-003');
      expect(refs).toContain('CUST-004');
      expect(refs).not.toContain('CUST-001');
      expect(refs).not.toContain('CUST-002');
    });

    it('allows Area Manager to view all customers across branches', () => {
      // Switch profile to Budi Santoso (Area Manager)
      retailDataStore.setCurrentProfile('20000000-0000-0000-0000-000000000001');

      const customers = retailDataStore.getCustomers();
      expect(customers.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Store-Level Scope Isolation', () => {
    it('restricts Store Manager store list to their assigned boutique', () => {
      // Diana Putri manages Plaza Indonesia
      retailDataStore.setCurrentProfile('20000000-0000-0000-0000-000000000002');

      const stores = retailDataStore.getStores();
      expect(stores.length).toBe(1);
      expect(stores[0].code).toBe('ST-PI-01');
    });

    it('allows Area Manager to query and switch across all stores', () => {
      retailDataStore.setCurrentProfile('20000000-0000-0000-0000-000000000001');

      const stores = retailDataStore.getStores();
      expect(stores.length).toBe(3);
    });
  });

  describe('Privacy & Regulatory Compliance (UU PDP & GDPR)', () => {
    it('strictly forbids generating communication drafts for opted-out customers', () => {
      const optedOutCustomer = {
        id: 'cust-x',
        organization_id: 'org-1',
        customer_ref: 'CUST-OPT-OUT',
        full_name: 'Ibu Rahasia',
        phone: '+628123456789',
        consent_status: 'opted_out' as const,
        do_not_contact: true,
        created_at: '2026-01-01',
      };

      const result = generateLuxuryWhatsAppDraft({
        customer: optedOutCustomer,
        staffName: 'Siti Rahma',
        storeName: 'Plaza Indonesia',
        templateType: 'birthday_greeting',
      });

      expect(result.allowed).toBe(false);
      expect(result.messageText).toBe('');
      expect(result.blockReason).toBeDefined();
    });
  });

  describe('Spreadsheet Security: Formula Injection Neutralization', () => {
    it('defends against CSV Injection when handling user uploaded files', () => {
      const maliciousPayloads = [
        '=cmd|/c calc.exe!A0',
        '+10+20',
        '-50+99',
        '@SUM(1+1)*cmd',
      ];

      maliciousPayloads.forEach(payload => {
        const sanitized = sanitizeCellValue(payload);
        expect(typeof sanitized).toBe('string');
        expect((sanitized as string).startsWith("'")).toBe(true);
      });
    });
  });
});
