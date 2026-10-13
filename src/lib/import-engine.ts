import * as XLSX from 'xlsx';

export interface ColumnMapping {
  storeCode?: string;
  storeName?: string;
  salesDate?: string;
  netSales?: string;
  targetAmount?: string;
  transactionCount?: string;
  unitsSold?: string;
  // Customer master fields
  customerRef?: string;
  fullName?: string;
  phone?: string;
  birthday?: string;
  consentStatus?: string;
  tier?: string;
  // Staff sales fields
  staffEmail?: string;
  staffName?: string;
}

export interface ParsedRowResult {
  rowNumber: number;
  raw: Record<string, unknown>;
  sanitized: Record<string, unknown>;
  isValid: boolean;
  errors: string[];
}

export interface ImportValidationSummary {
  totalRows: number;
  validRows: ParsedRowResult[];
  invalidRows: ParsedRowResult[];
  duplicateCount: number;
  detectedHeaders: string[];
  suggestedMapping: Record<string, string>;
}

/**
 * Sanitizes a cell string against CSV / Excel Formula Injection (CWE-1236).
 * If the value starts with =, +, -, @, prepend a single quote '.
 */
export function sanitizeCellValue(val: unknown): unknown {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^[=+\-@]/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return trimmed;
  }
  return val;
}

/**
 * Parses numbers with Indonesian or Western formatting (dots as thousands, commas as decimals, or vice versa, stripping Rp).
 */
export function parseLocalizedNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  let str = String(val).trim();
  // Remove currency prefix and non-numeric chars except digits, minus, dot, comma
  str = str.replace(/[^\d.,-]/g, '');
  if (!str) return null;

  // Indonesian format: 1.500.000 or 1.500.000,50
  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // 1.500.000,50 -> remove dots, replace comma with dot
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,500,000.50 -> remove commas
      str = str.replace(/,/g, '');
    }
  } else if (str.includes('.') && !str.includes(',')) {
    const dotParts = str.split('.');
    if (dotParts.length > 2 || (dotParts.length === 2 && dotParts[1].length === 3)) {
      // e.g. 1.500.000 or 50.000 -> thousand separators
      str = str.replace(/\./g, '');
    }
    // Otherwise keep as normal decimal e.g. 1.5
  } else if (str.includes(',') && !str.includes('.')) {
    const commaParts = str.split(',');
    if (commaParts.length > 2 || (commaParts.length === 2 && commaParts[1].length === 3)) {
      // e.g. 1,500,000 -> thousand separators
      str = str.replace(/,/g, '');
    } else {
      // e.g. 15,5 -> decimal separator
      str = str.replace(',', '.');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parses dates from Excel serial numbers, ISO strings, or DD/MM/YYYY formats into YYYY-MM-DD.
 */
export function parseFlexibleDate(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;

  // Handle Excel Serial Date Number (e.g. 45600)
  if (typeof val === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(val);
      if (parsed) {
        const y = parsed.y;
        const m = String(parsed.m).padStart(2, '0');
        const d = String(parsed.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      return null;
    }
  }

  const str = String(val).trim();
  // Standard ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : str;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback to Date parser
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Suggests header mappings based on standard luxury retail column names.
 */
export function autoSuggestMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerMap = headers.map(h => ({ original: h, clean: h.toLowerCase().replace(/[^a-z0-9]/g, '') }));

  function findMatch(patterns: string[]): string | undefined {
    for (const pat of patterns) {
      const found = lowerMap.find(item => item.clean.includes(pat));
      if (found) return found.original;
    }
    return undefined;
  }

  const storeCode = findMatch(['storecode', 'kodetoko', 'branchcode', 'storeid']);
  if (storeCode) mapping.storeCode = storeCode;

  const storeName = findMatch(['storename', 'namatoko', 'store', 'cabang']);
  if (storeName) mapping.storeName = storeName;

  const salesDate = findMatch(['salesdate', 'tanggal', 'date', 'tgl']);
  if (salesDate) mapping.salesDate = salesDate;

  const netSales = findMatch(['netsales', 'penjualan', 'omzet', 'sales', 'actualsales', 'netamount']);
  if (netSales) mapping.netSales = netSales;

  const targetAmount = findMatch(['targetamount', 'target', 'targets']);
  if (targetAmount) mapping.targetAmount = targetAmount;

  const transactionCount = findMatch(['transactioncount', 'jumlahtransaksi', 'txcount', 'transaksi', 'struk']);
  if (transactionCount) mapping.transactionCount = transactionCount;

  const unitsSold = findMatch(['unitssold', 'unit', 'jumlahunit', 'quantity', 'qty']);
  if (unitsSold) mapping.unitsSold = unitsSold;

  // Customer Master Matches
  const customerRef = findMatch(['customerref', 'custid', 'idcustomer', 'nocustomer', 'memberid']);
  if (customerRef) mapping.customerRef = customerRef;

  const fullName = findMatch(['fullname', 'namalengkap', 'namacustomer', 'name', 'nama']);
  if (fullName) mapping.fullName = fullName;

  const phone = findMatch(['phone', 'nohp', 'telepon', 'handphone', 'wa']);
  if (phone) mapping.phone = phone;

  const birthday = findMatch(['birthday', 'tanggallahir', 'tgllahir', 'dob']);
  if (birthday) mapping.birthday = birthday;

  const tier = findMatch(['tier', 'membership', 'level', 'statustier']);
  if (tier) mapping.tier = tier;

  return mapping;
}

/**
 * Inspects a workbook array buffer, detects header row (even if offset), and returns raw rows.
 */
export function parseSheetBuffer(buffer: ArrayBuffer): { headers: string[]; rawRows: Record<string, unknown>[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of arrays first to find the header row
  const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (rows.length === 0) {
    return { headers: [], rawRows: [] };
  }

  // Scan first 5 rows to locate the header row (row with most non-empty strings)
  let headerRowIndex = 0;
  let maxCols = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i] || [];
    const stringCols = row.filter(cell => typeof cell === 'string' && cell.trim().length > 0).length;
    if (stringCols > maxCols) {
      maxCols = stringCols;
      headerRowIndex = i;
    }
  }

  const rawHeaders = (rows[headerRowIndex] || []).map((col, idx) => {
    const s = String(col || '').trim();
    return s || `Column_${idx + 1}`;
  });

  const rawRows: Record<string, unknown>[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    // Skip empty lines
    const hasData = row.some(cell => cell !== '' && cell !== null && cell !== undefined);
    if (!hasData) continue;

    const rowObj: Record<string, unknown> = {};
    rawHeaders.forEach((header, idx) => {
      rowObj[header] = row[idx];
    });
    rawRows.push(rowObj);
  }

  return { headers: rawHeaders, rawRows };
}

/**
 * Validates parsed store daily sales rows.
 */
export function validateStoreDailyRows(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): ImportValidationSummary {
  const validRows: ParsedRowResult[] = [];
  const invalidRows: ParsedRowResult[] = [];
  const seenKeys = new Set<string>();
  let duplicateCount = 0;

  rows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = {};

    // Validate Store Identifier
    const storeCodeVal = mapping.storeCode ? row[mapping.storeCode] : undefined;
    const storeCode = storeCodeVal ? String(storeCodeVal).trim() : '';
    if (!storeCode) {
      errors.push('Kode toko wajib diisi');
    } else {
      sanitized.storeCode = sanitizeCellValue(storeCode);
    }

    // Validate Sales Date
    const dateVal = mapping.salesDate ? row[mapping.salesDate] : undefined;
    const parsedDate = parseFlexibleDate(dateVal);
    if (!parsedDate) {
      errors.push('Format tanggal tidak valid (gunakan YYYY-MM-DD atau DD/MM/YYYY)');
    } else {
      sanitized.salesDate = parsedDate;
    }

    // Validate Net Sales
    const netSalesVal = mapping.netSales ? row[mapping.netSales] : undefined;
    const parsedNetSales = parseLocalizedNumber(netSalesVal);
    if (parsedNetSales === null) {
      errors.push('Nilai net sales wajib berupa angka valid');
    } else if (parsedNetSales < 0) {
      errors.push('Nilai net sales tidak boleh bernilai negatif');
    } else {
      sanitized.netSales = parsedNetSales;
    }

    // Target Amount (Optional)
    if (mapping.targetAmount && row[mapping.targetAmount] !== undefined) {
      sanitized.targetAmount = parseLocalizedNumber(row[mapping.targetAmount]);
    }

    // Transaction Count (Optional)
    if (mapping.transactionCount && row[mapping.transactionCount] !== undefined) {
      const tx = parseLocalizedNumber(row[mapping.transactionCount]);
      sanitized.transactionCount = tx !== null ? Math.round(tx) : null;
    }

    // Units Sold (Optional)
    if (mapping.unitsSold && row[mapping.unitsSold] !== undefined) {
      const units = parseLocalizedNumber(row[mapping.unitsSold]);
      sanitized.unitsSold = units !== null ? Math.round(units) : null;
    }

    // Deduplication key: storeCode + salesDate
    if (parsedDate && storeCode) {
      const dedupeKey = `${storeCode.toLowerCase()}__${parsedDate}`;
      if (seenKeys.has(dedupeKey)) {
        duplicateCount++;
        errors.push(`Duplikasi terdeteksi untuk toko ${storeCode} pada tanggal ${parsedDate}`);
      } else {
        seenKeys.add(dedupeKey);
      }
    }

    const rowResult: ParsedRowResult = {
      rowNumber,
      raw: row,
      sanitized,
      isValid: errors.length === 0,
      errors,
    };

    if (rowResult.isValid) {
      validRows.push(rowResult);
    } else {
      invalidRows.push(rowResult);
    }
  });

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
    duplicateCount,
    detectedHeaders: Object.keys(rows[0] || {}),
    suggestedMapping: mapping as Record<string, string>,
  };
}

/**
 * Generates CSV content for download error report.
 */
export function generateErrorReportCsv(invalidRows: ParsedRowResult[]): string {
  const header = ['Row Number', 'Errors', 'Raw Data'];
  const lines = [header.join(',')];

  invalidRows.forEach(row => {
    const rowNum = row.rowNumber;
    const errors = `"${row.errors.join('; ').replace(/"/g, '""')}"`;
    const rawData = `"${JSON.stringify(row.raw).replace(/"/g, '""')}"`;
    lines.push(`${rowNum},${errors},${rawData}`);
  });

  return lines.join('\n');
}

/**
 * Returns CSV string templates for users to download.
 */
export function getTemplateCsv(templateType: 'store_daily_sales' | 'staff_sales' | 'customer_master'): string {
  if (templateType === 'store_daily_sales') {
    return [
      'Kode Toko,Nama Toko,Tanggal,Net Sales,Target,Jumlah Transaksi,Unit Terjual',
      'ST-PI-01,Plaza Indonesia - Flagship,2026-10-14,85000000,75000000,4,7',
      'ST-PP-02,Pacific Place - Boutique,2026-10-14,64000000,60000000,3,5',
      'ST-SC-03,Senayan City - Lounge,2026-10-14,41000000,45000000,2,3',
    ].join('\n');
  }

  if (templateType === 'customer_master') {
    return [
      'Customer Ref,Nama Lengkap,No Telepon,Tanggal Lahir,Tier,Status Izin',
      'CUST-001,Ibu Clarissa Soeryadjaya,+628111223344,1988-10-18,VIP,opted_in',
      'CUST-002,Ibu Michelle Tan,+628129876543,1992-10-22,Platinum,opted_in',
      'CUST-003,Bapak Richard Halim,+628135544332,1984-11-05,VIP,opted_in',
    ].join('\n');
  }

  return [
    'Kode Staf,Nama Staf,Kode Toko,Tanggal,Net Sales,Target',
    'SA-001,Siti Rahma,ST-PI-01,2026-10-14,45000000,35000000',
    'SA-002,Kevin Wijaya,ST-PI-01,2026-10-14,40000000,35000000',
  ].join('\n');
}

/**
 * Maps common luxury boutique acronyms (from DSR files) to normalized store codes.
 */
export const BOUTIQUE_CODE_MAP: Record<string, string> = {
  PI: 'ST-PI-01',
  PP: 'ST-PP-02',
  PS: 'ST-PS-03',
  TBPS: 'ST-PS-03',
  TBI_TBPS: 'ST-PS-03',
  SC: 'ST-SC-04',
  PIM: 'ST-PIM-05',
  KOKAS: 'ST-KOKAS-06',
  TP: 'ST-TP-07',
  VK: 'ST-VK-08',
  'ICON BALI': 'ST-IB-09',
  PASKAL: 'ST-PK-10',
  TBOS: 'ST-ON-11',
};

export function normalizeBoutiqueCode(code: string): string {
  const clean = code.trim().toUpperCase();
  return BOUTIQUE_CODE_MAP[clean] || clean;
}

export type DsrFormatType = 'multi_store_matrix' | 'transaction_item_level' | 'standard_columnar';

export interface AutoParsedDsrResult {
  formatType: DsrFormatType;
  sheetName: string;
  summary: ImportValidationSummary;
}

/**
 * Inspects a workbook and intelligently parses either:
 * 1. Multi-Store Matrix (TB Sales Closing Update)
 * 2. Transaction Item-Level DSR (Daily Briefing DSR)
 * 3. Standard Columnar DSR
 */
export function detectAndParseDsrWorkbook(buffer: ArrayBuffer): AutoParsedDsrResult {
  const workbook = XLSX.read(buffer, { type: 'array' });

  // 1. Check for Transaction Item-Level DSR Sheet (e.g. "DSR September 2026" or sheet with "Boutique Code" & "Docnum")
  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (rows.length < 2) continue;

    const firstRow = (rows[0] || []).map(c => String(c).trim().toLowerCase());
    const hasDocnum = firstRow.some(c => c.includes('docnum') || c.includes('receipt') || c.includes('no struk'));
    const hasBoutique = firstRow.some(c => c.includes('boutique') || c.includes('toko'));

    if (hasDocnum && hasBoutique) {
      // Parse transaction item-level sheet by aggregating lines into store daily records
      const boutiqueIdx = firstRow.findIndex(c => c.includes('boutique code') || c.includes('kodetoko') || c.includes('boutique'));
      const dateIdx = firstRow.findIndex(c => c === 'docdate' || c === 'date' || c === 'tanggal');
      const netIdx = firstRow.findIndex(c => c.includes('net price') || c.includes('net sales') || c.includes('net amount') || c.includes('gross price'));
      const qtyIdx = firstRow.findIndex(c => c === 'qty' || c === 'quantity' || c === 'unit');
      const docnumIdx = firstRow.findIndex(c => c.includes('docnum'));

      // Aggregate by store + date
      interface StoreDateAgg {
        storeCode: string;
        salesDate: string;
        netSales: number;
        docnums: Set<string>;
        units: number;
      }
      const aggMap = new Map<string, StoreDateAgg>();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const rawStore = boutiqueIdx >= 0 ? String(row[boutiqueIdx] || '') : 'DEFAULT';
        const rawDate = dateIdx >= 0 ? row[dateIdx] : '';
        const parsedDate = parseFlexibleDate(rawDate);
        if (!rawStore || !parsedDate) continue;

        const storeCode = normalizeBoutiqueCode(rawStore);
        const netVal = netIdx >= 0 ? parseLocalizedNumber(row[netIdx]) || 0 : 0;
        const qtyVal = qtyIdx >= 0 ? parseLocalizedNumber(row[qtyIdx]) || 1 : 1;
        const docnum = docnumIdx >= 0 ? String(row[docnumIdx] || '') : `tx-${i}`;

        const key = `${storeCode}__${parsedDate}`;
        if (!aggMap.has(key)) {
          aggMap.set(key, {
            storeCode,
            salesDate: parsedDate,
            netSales: 0,
            docnums: new Set(),
            units: 0,
          });
        }

        const entry = aggMap.get(key)!;
        entry.netSales += netVal;
        if (docnum) entry.docnums.add(docnum);
        entry.units += qtyVal;
      }

      const rawRows: Record<string, unknown>[] = [];
      Array.from(aggMap.values()).forEach(agg => {
        rawRows.push({
          'Kode Toko': agg.storeCode,
          'Tanggal': agg.salesDate,
          'Net Sales': agg.netSales,
          'Jumlah Transaksi': agg.docnums.size,
          'Unit Terjual': agg.units,
        });
      });

      const mapping: ColumnMapping = {
        storeCode: 'Kode Toko',
        salesDate: 'Tanggal',
        netSales: 'Net Sales',
        transactionCount: 'Jumlah Transaksi',
        unitsSold: 'Unit Terjual',
      };

      const summary = validateStoreDailyRows(rawRows, mapping);
      return {
        formatType: 'transaction_item_level',
        sheetName,
        summary,
      };
    }
  }

  // 2. Check for Multi-Store Closing Matrix Sheet (e.g. "OCTOBER", "SEPTEMBER", with row: Date, PI, PP, PS, SC...)
  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (rows.length < 5) continue;

    // Search first 20 rows for "Date" header
    for (let r = 0; r < Math.min(20, rows.length); r++) {
      const row = rows[r] || [];
      const dateCell = String(row[0] || '').trim().toLowerCase();

      if (dateCell === 'date' || dateCell === 'tanggal') {
        // Found header row with store columns
        const headerRow = row.map(c => String(c || '').trim());
        const storeCols: { colIdx: number; storeCode: string }[] = [];

        for (let c = 1; c < headerRow.length; c++) {
          const name = headerRow[c];
          if (!name || name.toLowerCase().includes('total') || name.toLowerCase().includes('achieve')) continue;
          storeCols.push({ colIdx: c, storeCode: normalizeBoutiqueCode(name) });
        }

        if (storeCols.length >= 2) {
          // Unpivot into rows
          const unpivotedRows: Record<string, unknown>[] = [];

          for (let d = r + 1; d < rows.length; d++) {
            const dataRow = rows[d] || [];
            const rawDate = dataRow[0];
            const parsedDate = parseFlexibleDate(rawDate);
            if (!parsedDate) continue;

            for (const sc of storeCols) {
              const rawSales = dataRow[sc.colIdx];
              const netSales = parseLocalizedNumber(rawSales);
              if (netSales !== null && netSales >= 0) {
                unpivotedRows.push({
                  'Kode Toko': sc.storeCode,
                  'Tanggal': parsedDate,
                  'Net Sales': netSales,
                });
              }
            }
          }

          if (unpivotedRows.length > 0) {
            const mapping: ColumnMapping = {
              storeCode: 'Kode Toko',
              salesDate: 'Tanggal',
              netSales: 'Net Sales',
            };
            const summary = validateStoreDailyRows(unpivotedRows, mapping);
            return {
              formatType: 'multi_store_matrix',
              sheetName,
              summary,
            };
          }
        }
      }
    }
  }

  // 3. Fallback to Standard Columnar Parser
  const parsedSheet = parseSheetBuffer(buffer);
  const mapping = autoSuggestMapping(parsedSheet.headers);
  const summary = validateStoreDailyRows(parsedSheet.rawRows, mapping);

  return {
    formatType: 'standard_columnar',
    sheetName: workbook.SheetNames[0] || 'Sheet1',
    summary,
  };
}

