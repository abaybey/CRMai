'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import {
  parseSheetBuffer,
  autoSuggestMapping,
  validateStoreDailyRows,
  generateErrorReportCsv,
  getTemplateCsv,
  detectAndParseDsrWorkbook,
  ColumnMapping,
  ImportValidationSummary,
} from '@/lib/import-engine';
import { formatIDR } from '@/lib/kpi';
import {
  UploadCloud,
  CheckCircle2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

export default function ImportPage() {
  const { stores, refreshData } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState('');
  const [detectedFormatInfo, setDetectedFormatInfo] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [validationSummary, setValidationSummary] = useState<ImportValidationSummary | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<{ added: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const detected = detectAndParseDsrWorkbook(buffer);

      if (
        detected.formatType === 'multi_store_matrix' ||
        detected.formatType === 'transaction_item_level'
      ) {
        setValidationSummary(detected.summary);
        setDetectedFormatInfo(
          detected.formatType === 'multi_store_matrix'
            ? `Format Matriks Multi-Cabang Terdeteksi (Sheet: ${detected.sheetName})`
            : `Format Detail Transaksi & Item Terdeteksi (Sheet: ${detected.sheetName})`
        );
        setStep(3); // Langsung lompat ke Preview & Validasi
      } else {
        const parsed = parseSheetBuffer(buffer);
        setHeaders(parsed.headers);
        setRawRows(parsed.rawRows);
        setMapping(autoSuggestMapping(parsed.headers));
        setDetectedFormatInfo('Format Tabel Kolom Standar');
        setStep(2);
      }
    } catch {
      alert('Gagal membaca file spreadsheet. Pastikan format file .xlsx, .xls, atau .csv valid.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample multi-store matrix format (TB Sales Closing Update)
  const handleLoadSampleMatrix = () => {
    const matrixRows: Record<string, unknown>[] = [
      { 'Kode Toko': 'ST-PI-01', Tanggal: '2026-10-14', 'Net Sales': 72440000 },
      { 'Kode Toko': 'ST-PS-03', Tanggal: '2026-10-14', 'Net Sales': 90555000 },
      { 'Kode Toko': 'ST-SC-04', Tanggal: '2026-10-14', 'Net Sales': 35260000 },
      { 'Kode Toko': 'ST-PIM-05', Tanggal: '2026-10-14', 'Net Sales': 26039620 },
      { 'Kode Toko': 'ST-KOKAS-06', Tanggal: '2026-10-14', 'Net Sales': 8200000 },
      { 'Kode Toko': 'ST-PI-01', Tanggal: '2026-10-13', 'Net Sales': 51700000 },
      { 'Kode Toko': 'ST-PS-03', Tanggal: '2026-10-13', 'Net Sales': 49750000 },
      { 'Kode Toko': 'ST-SC-04', Tanggal: '2026-10-13', 'Net Sales': 30620000 },
      { 'Kode Toko': 'ST-PIM-05', Tanggal: '2026-10-13', 'Net Sales': 46500000 },
    ];
    setFileName('TB Sales Closing Update 2026.xlsx (Simulasi)');
    setDetectedFormatInfo('Format Matriks Multi-Cabang (Sheet: OCTOBER)');
    const sampleMapping: ColumnMapping = {
      storeCode: 'Kode Toko',
      salesDate: 'Tanggal',
      netSales: 'Net Sales',
    };
    const summary = validateStoreDailyRows(matrixRows, sampleMapping);
    setValidationSummary(summary);
    setStep(3);
  };

  // Load sample item-level transaction format (Daily Briefing)
  const handleLoadSampleItemLevel = () => {
    const itemRows: Record<string, unknown>[] = [
      {
        'Kode Toko': 'ST-PS-03',
        Tanggal: '2026-09-01',
        'Net Sales': 85430000,
        'Jumlah Transaksi': 13,
        'Unit Terjual': 19,
      },
      {
        'Kode Toko': 'ST-PS-03',
        Tanggal: '2026-09-02',
        'Net Sales': 85095000,
        'Jumlah Transaksi': 11,
        'Unit Terjual': 16,
      },
      {
        'Kode Toko': 'ST-PS-03',
        Tanggal: '2026-09-03',
        'Net Sales': 41170000,
        'Jumlah Transaksi': 5,
        'Unit Terjual': 7,
      },
      {
        'Kode Toko': 'ST-PS-03',
        Tanggal: '2026-09-04',
        'Net Sales': 168925000,
        'Jumlah Transaksi': 12,
        'Unit Terjual': 21,
      },
    ];
    setFileName('Daily Briefing September 2026x.xlsx (Simulasi)');
    setDetectedFormatInfo('Format Transaksi Item-Level (Sheet: DSR September 2026)');
    const sampleMapping: ColumnMapping = {
      storeCode: 'Kode Toko',
      salesDate: 'Tanggal',
      netSales: 'Net Sales',
      transactionCount: 'Jumlah Transaksi',
      unitsSold: 'Unit Terjual',
    };
    const summary = validateStoreDailyRows(itemRows, sampleMapping);
    setValidationSummary(summary);
    setStep(3);
  };

  // Load standard columnar template
  const handleLoadSampleTemplate = () => {
    const csvContent = getTemplateCsv('store_daily_sales');
    const lines = csvContent.split('\n');
    const detectedHeaders = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const parts = line.split(',');
      const obj: Record<string, unknown> = {};
      detectedHeaders.forEach((h, idx) => {
        obj[h] = parts[idx];
      });
      return obj;
    });

    setFileName('template_store_daily_sales.csv');
    setDetectedFormatInfo('Format Kolom Standar');
    setHeaders(detectedHeaders);
    setRawRows(rows);
    setMapping(autoSuggestMapping(detectedHeaders));
    setStep(2);
  };

  const handleProceedToPreview = () => {
    const summary = validateStoreDailyRows(rawRows, mapping);
    setValidationSummary(summary);
    setStep(3);
  };

  const handleCommitImport = () => {
    if (!validationSummary) return;

    setIsLoading(true);
    try {
      const recordsToCommit = validationSummary.validRows.map(row => {
        const storeCode = String(row.sanitized.storeCode);
        const matchedStore =
          stores.find(s => s.code.toLowerCase() === storeCode.toLowerCase()) || stores[0];

        return {
          organization_id: matchedStore.organization_id,
          store_id: matchedStore.id,
          sales_date: String(row.sanitized.salesDate),
          net_sales: Number(row.sanitized.netSales),
          target_amount: row.sanitized.targetAmount ? Number(row.sanitized.targetAmount) : null,
          transaction_count: row.sanitized.transactionCount
            ? Number(row.sanitized.transactionCount)
            : null,
          units_sold: row.sanitized.unitsSold ? Number(row.sanitized.unitsSold) : null,
        };
      });

      const added = retailDataStore.addSalesDailyBatch(recordsToCommit);
      setCommitResult({ added });
      refreshData();
      setStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = (type: 'store_daily_sales' | 'staff_sales' | 'customer_master') => {
    const csv = getTemplateCsv(type);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadErrorReport = () => {
    if (!validationSummary || validationSummary.invalidRows.length === 0) return;
    const csv = generateErrorReportCsv(validationSummary.invalidRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error_report_${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="Impor Data DSR"
      subtitle="Dukungan otomatis format matriks multi-cabang, detail transaksi per SA & format standar"
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Progress Stepper */}
        <div className="bg-white p-3.5 rounded-lg border border-[#EAEAEA]">
          <div className="flex items-center justify-between text-xs">
            {[
              { num: 1, label: 'Upload File' },
              { num: 2, label: 'Pemetaan Kolom' },
              { num: 3, label: 'Preview & Validasi' },
              { num: 4, label: 'Selesai' },
            ].map(s => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 ${
                  step === s.num
                    ? 'text-[#111111] font-medium'
                    : step > s.num
                    ? 'text-[#1E7E34]'
                    : 'text-[#888888]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    step === s.num
                      ? 'bg-[#111111] text-white'
                      : step > s.num
                      ? 'bg-[#EBF7EE] text-[#1E7E34]'
                      : 'bg-[#F0F0F0] text-[#888888]'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-6 text-center">
              <UploadCloud className="w-9 h-9 text-[#555555] mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-[#111111] mb-1">
                Pilih Berkas Spreadsheet DSR
              </h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mb-4 leading-relaxed">
                Mendukung file dari folder <code>contohdsr</code>: format matriks harian per cabang
                maupun detail transaksi item per SA.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <label className="cursor-pointer bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 py-2 rounded text-xs font-medium transition-colors">
                  <span>Pilih Berkas dari Komputer</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Format Demonstrators */}
              <div className="mt-5 pt-4 border-t border-[#F5F5F5]">
                <span className="text-[11px] text-[#777777] block mb-2 font-medium">
                  Atau uji langsung format dari <code>contohdsr</code>:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleMatrix}
                    className="bg-[#FAFAFA] border border-[#EAEAEA] hover:bg-[#F5F5F5] text-[#222222] px-3 py-1.5 rounded text-[11px] transition-colors"
                  >
                    Format 1: Matriks Multi-Cabang (TB Sales Closing)
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleItemLevel}
                    className="bg-[#FAFAFA] border border-[#EAEAEA] hover:bg-[#F5F5F5] text-[#222222] px-3 py-1.5 rounded text-[11px] transition-colors"
                  >
                    Format 2: Detail Transaksi & SA (Daily Briefing)
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleTemplate}
                    className="bg-[#FAFAFA] border border-[#EAEAEA] hover:bg-[#F5F5F5] text-[#222222] px-3 py-1.5 rounded text-[11px] transition-colors"
                  >
                    Format 3: Kolom Standar
                  </button>
                </div>
              </div>
            </div>

            {/* Download Templates Bar */}
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
              <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider block mb-2">
                Unduh Template Standar
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('store_daily_sales')}
                  className="p-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded text-left hover:bg-[#F5F5F5] text-xs"
                >
                  <div className="font-medium text-[#111111]">Template DSR Toko (.csv)</div>
                  <div className="text-[10px] text-[#777777] mt-0.5">Penjualan harian & target</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('customer_master')}
                  className="p-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded text-left hover:bg-[#F5F5F5] text-xs"
                >
                  <div className="font-medium text-[#111111]">Template Customer Master (.csv)</div>
                  <div className="text-[10px] text-[#777777] mt-0.5">Data tamu & izin kontak</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('staff_sales')}
                  className="p-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded text-left hover:bg-[#F5F5F5] text-xs"
                >
                  <div className="font-medium text-[#111111]">Template Sales Staf (.csv)</div>
                  <div className="text-[10px] text-[#777777] mt-0.5">Omzet individual SA</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Mapping */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Pemetaan Kolom Spreadsheet
                </h3>
                <p className="text-[11px] text-[#777777]">
                  File: {fileName} • {rawRows.length} baris terdeteksi
                </p>
              </div>
              {detectedFormatInfo && (
                <span className="text-[10px] bg-[#F5F5F5] text-[#444444] px-2 py-0.5 rounded">
                  {detectedFormatInfo}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">
                  Kolom Kode Toko <span className="text-[#C0392B]">*</span>
                </label>
                <select
                  value={mapping.storeCode || ''}
                  onChange={e => setMapping({ ...mapping, storeCode: e.target.value })}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-xs text-[#111111]"
                >
                  <option value="">-- Pilih Kolom --</option>
                  {headers.map((h, idx) => (
                    <option key={`${h}-${idx}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">
                  Kolom Tanggal Penjualan <span className="text-[#C0392B]">*</span>
                </label>
                <select
                  value={mapping.salesDate || ''}
                  onChange={e => setMapping({ ...mapping, salesDate: e.target.value })}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-xs text-[#111111]"
                >
                  <option value="">-- Pilih Kolom --</option>
                  {headers.map((h, idx) => (
                    <option key={`${h}-${idx}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">
                  Kolom Net Sales <span className="text-[#C0392B]">*</span>
                </label>
                <select
                  value={mapping.netSales || ''}
                  onChange={e => setMapping({ ...mapping, netSales: e.target.value })}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-xs text-[#111111]"
                >
                  <option value="">-- Pilih Kolom --</option>
                  {headers.map((h, idx) => (
                    <option key={`${h}-${idx}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">
                  Kolom Target Penjualan (Opsional)
                </label>
                <select
                  value={mapping.targetAmount || ''}
                  onChange={e => setMapping({ ...mapping, targetAmount: e.target.value })}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-xs text-[#111111]"
                >
                  <option value="">-- Pilih Kolom --</option>
                  {headers.map((h, idx) => (
                    <option key={`${h}-${idx}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F5]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 border border-[#EAEAEA] rounded text-xs text-[#666666] hover:bg-[#F5F5F5]"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleProceedToPreview}
                className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded text-xs font-medium hover:bg-[#333333]"
              >
                Lanjutkan ke Preview →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === 3 && validationSummary && (
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Hasil Validasi Data DSR
                </h3>
                <p className="text-[11px] text-[#777777]">
                  {fileName} • {detectedFormatInfo || 'Format DSR'}
                </p>
              </div>
              {validationSummary.invalidRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadErrorReport}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#F5C6CB] bg-[#FDF0ED] text-[#C0392B] text-xs"
                >
                  <Download className="w-3 h-3" />
                  Unduh Error Report ({validationSummary.invalidRows.length})
                </button>
              )}
            </div>

            {/* Validation Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded">
                <span className="text-[10px] text-[#777777] uppercase block">Baris Valid</span>
                <div className="text-base font-semibold text-[#1E7E34] mt-0.5">
                  {validationSummary.validRows.length} Baris
                </div>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded">
                <span className="text-[10px] text-[#777777] uppercase block">Baris Bermasalah</span>
                <div className="text-base font-semibold text-[#C0392B] mt-0.5">
                  {validationSummary.invalidRows.length} Baris
                </div>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded">
                <span className="text-[10px] text-[#777777] uppercase block">Duplikasi</span>
                <div className="text-base font-semibold text-[#B87A00] mt-0.5">
                  {validationSummary.duplicateCount} Duplikat
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <span className="text-[11px] font-semibold text-[#111111] block mb-1.5">
                Preview Sampel Data
              </span>
              <div className="overflow-x-auto border border-[#EAEAEA] rounded max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFA] text-[#666666] text-[11px] font-medium border-b border-[#EAEAEA] sticky top-0">
                    <tr>
                      <th className="py-2 px-3 font-normal">Kode Toko</th>
                      <th className="py-2 px-3 font-normal">Tanggal</th>
                      <th className="py-2 px-3 font-normal">Net Sales</th>
                      <th className="py-2 px-3 font-normal">Transaksi</th>
                      <th className="py-2 px-3 font-normal">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F5]">
                    {validationSummary.validRows.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAFA]">
                        <td className="py-2 px-3 font-medium text-[#111111]">
                          {String(row.sanitized.storeCode)}
                        </td>
                        <td className="py-2 px-3 text-[#666666]">
                          {String(row.sanitized.salesDate)}
                        </td>
                        <td className="py-2 px-3 font-medium text-[#111111]">
                          {formatIDR(Number(row.sanitized.netSales))}
                        </td>
                        <td className="py-2 px-3 text-[#666666]">
                          {String(row.sanitized.transactionCount || '-')}
                        </td>
                        <td className="py-2 px-3 text-[#666666]">
                          {String(row.sanitized.unitsSold || '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F5]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 border border-[#EAEAEA] rounded text-xs text-[#666666] hover:bg-[#F5F5F5]"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={validationSummary.validRows.length === 0 || isLoading}
                onClick={handleCommitImport}
                className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-[#333333] disabled:bg-[#CCCCCC] text-white rounded text-xs font-medium"
              >
                {isLoading
                  ? 'Menyimpan...'
                  : `Simpan ${validationSummary.validRows.length} Baris Data`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Complete */}
        {step === 4 && commitResult && (
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-8 text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-[#1E7E34] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111111]">Impor DSR Selesai</h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
              Sebanyak <strong>{commitResult.added} baris data penjualan</strong> berhasil disimpan
              dan dinormalisasi. Seluruh dashboard telah diperbarui secara langsung.
            </p>

            <div className="pt-2 flex items-center justify-center gap-2">
              <a
                href="/store/dashboard"
                className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded text-xs font-medium hover:bg-[#333333]"
              >
                Lihat Dashboard Gerai
              </a>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 border border-[#EAEAEA] rounded text-xs text-[#666666] hover:bg-[#F5F5F5]"
              >
                Impor Berkas Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
