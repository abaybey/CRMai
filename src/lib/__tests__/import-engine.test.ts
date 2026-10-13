import { describe, it, expect } from 'vitest';
import {
  parseLocalizedNumber,
  parseFlexibleDate,
  sanitizeCellValue,
  autoSuggestMapping,
  validateStoreDailyRows,
  generateErrorReportCsv,
  normalizeBoutiqueCode,
  detectAndParseDsrWorkbook,
} from '../import-engine';

describe('Import Engine Unit Tests', () => {
  describe('parseLocalizedNumber', () => {
    it('parses Indonesian currency and thousand separator dots', () => {
      expect(parseLocalizedNumber('Rp 75.000.000')).toBe(75000000);
      expect(parseLocalizedNumber('1.250.000,50')).toBe(1250000.5);
      expect(parseLocalizedNumber('500.000')).toBe(500000);
    });

    it('parses Western comma formatted numbers', () => {
      expect(parseLocalizedNumber('1,500,000')).toBe(1500000);
      expect(parseLocalizedNumber('2500.75')).toBe(2500.75);
    });

    it('returns null for empty or non-numeric values', () => {
      expect(parseLocalizedNumber('')).toBeNull();
      expect(parseLocalizedNumber('N/A')).toBeNull();
      expect(parseLocalizedNumber(null)).toBeNull();
    });
  });

  describe('parseFlexibleDate', () => {
    it('parses ISO date YYYY-MM-DD', () => {
      expect(parseFlexibleDate('2026-10-14')).toBe('2026-10-14');
    });

    it('parses DD/MM/YYYY and DD-MM-YYYY', () => {
      expect(parseFlexibleDate('14/10/2026')).toBe('2026-10-14');
      expect(parseFlexibleDate('05-08-2026')).toBe('2026-08-05');
    });

    it('parses Excel numeric serial date code', () => {
      // 45570 corresponds to ~October 2024
      const result = parseFlexibleDate(45570);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns null for invalid dates', () => {
      expect(parseFlexibleDate('invalid-date')).toBeNull();
      expect(parseFlexibleDate('')).toBeNull();
      expect(parseFlexibleDate(null)).toBeNull();
    });
  });

  describe('sanitizeCellValue (Anti-Formula Injection)', () => {
    it('prepends single quote to formula trigger characters', () => {
      expect(sanitizeCellValue('=1+1')).toBe("'=1+1");
      expect(sanitizeCellValue('+cmd|')).toBe("'+cmd|");
      expect(sanitizeCellValue('-dangerous')).toBe("'-dangerous");
      expect(sanitizeCellValue('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
    });

    it('preserves clean strings', () => {
      expect(sanitizeCellValue('Plaza Indonesia')).toBe('Plaza Indonesia');
      expect(sanitizeCellValue('ST-001')).toBe('ST-001');
    });
  });

  describe('autoSuggestMapping', () => {
    it('suggests correct mapping for Indonesian DSR headers', () => {
      const headers = ['Kode Toko', 'Nama Toko', 'Tanggal', 'Penjualan', 'Target', 'Jumlah Transaksi', 'Unit'];
      const mapping = autoSuggestMapping(headers);

      expect(mapping.storeCode).toBe('Kode Toko');
      expect(mapping.salesDate).toBe('Tanggal');
      expect(mapping.netSales).toBe('Penjualan');
      expect(mapping.targetAmount).toBe('Target');
      expect(mapping.transactionCount).toBe('Jumlah Transaksi');
      expect(mapping.unitsSold).toBe('Unit');
    });
  });

  describe('validateStoreDailyRows & Deduplication', () => {
    it('identifies valid rows and detects duplicate records', () => {
      const rows = [
        {
          'Store Code': 'ST-01',
          'Date': '2026-10-14',
          'Net Sales': '50.000.000',
        },
        {
          // Duplicate of row 1
          'Store Code': 'ST-01',
          'Date': '2026-10-14',
          'Net Sales': '55.000.000',
        },
        {
          // Invalid net sales and missing date
          'Store Code': 'ST-02',
          'Date': 'invalid',
          'Net Sales': 'abc',
        },
      ];

      const mapping = {
        storeCode: 'Store Code',
        salesDate: 'Date',
        netSales: 'Net Sales',
      };

      const summary = validateStoreDailyRows(rows, mapping);
      expect(summary.totalRows).toBe(3);
      expect(summary.validRows.length).toBe(1);
      expect(summary.invalidRows.length).toBe(2);
      expect(summary.duplicateCount).toBe(1);

      // Check error messages
      expect(summary.invalidRows[0].errors[0]).toContain('Duplikasi terdeteksi');
      expect(summary.invalidRows[1].errors.length).toBe(2); // Date + net sales errors
    });
  });

  describe('generateErrorReportCsv', () => {
    it('outputs valid CSV with error descriptions', () => {
      const invalidRows = [
        {
          rowNumber: 2,
          raw: { Store: 'ST-01' },
          sanitized: {},
          isValid: false,
          errors: ['Format tanggal tidak valid', 'Net sales wajib diisi'],
        },
      ];

      const csv = generateErrorReportCsv(invalidRows);
      expect(csv).toContain('Row Number,Errors,Raw Data');
      expect(csv).toContain('2,"Format tanggal tidak valid; Net sales wajib diisi"');
    });
  });

  describe('Real Luxury DSR Parsing (contohdsr)', () => {
    it('normalizes luxury boutique acronyms correctly', () => {
      expect(normalizeBoutiqueCode('PI')).toBe('ST-PI-01');
      expect(normalizeBoutiqueCode('PP')).toBe('ST-PP-02');
      expect(normalizeBoutiqueCode('TBI_TBPS')).toBe('ST-PS-03');
      expect(normalizeBoutiqueCode('SC')).toBe('ST-SC-04');
      expect(normalizeBoutiqueCode('PIM')).toBe('ST-PIM-05');
      expect(normalizeBoutiqueCode('KOKAS')).toBe('ST-KOKAS-06');
    });

    it('successfully parses TB Sales Closing Update multi-store matrix workbook', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'contohdsr', 'TB Sales Closing Update 2026.xlsx');
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath).buffer;
        const result = detectAndParseDsrWorkbook(buffer);
        expect(result.formatType).toBe('multi_store_matrix');
        expect(result.summary.validRows.length).toBeGreaterThan(50);
        expect(result.summary.validRows[0].sanitized.storeCode).toBeDefined();
        expect(result.summary.validRows[0].sanitized.netSales).toBeGreaterThanOrEqual(0);
      }
    });

    it('successfully parses Daily Briefing September item-level transaction DSR workbook', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'contohdsr', 'Daily Briefing September 2026x.xlsx');
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath).buffer;
        const result = detectAndParseDsrWorkbook(buffer);
        expect(result.formatType).toBe('transaction_item_level');
        expect(result.summary.validRows.length).toBeGreaterThan(0);
        expect(result.summary.validRows[0].sanitized.storeCode).toBe('ST-PS-03');
        expect(result.summary.validRows[0].sanitized.transactionCount).toBeGreaterThan(0);
      }
    });
  });
});

