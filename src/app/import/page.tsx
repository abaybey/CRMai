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
  ColumnMapping,
  ImportValidationSummary,
} from '@/lib/import-engine';
import { formatIDR } from '@/lib/kpi';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export default function ImportPage() {
  const { stores, refreshData } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState('');
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
      const parsed = parseSheetBuffer(buffer);

      setHeaders(parsed.headers);
      setRawRows(parsed.rawRows);

      const suggested = autoSuggestMapping(parsed.headers);
      setMapping(suggested);

      setStep(2);
    } catch {
      alert('Gagal membaca file spreadsheet. Pastikan format file .xlsx, .xls, atau .csv valid.');
    } finally {
      setIsLoading(false);
    }
  };

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

    setFileName('sample_dsr_october_luxury.csv');
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
        const matchedStore = stores.find(
          s => s.code.toLowerCase() === storeCode.toLowerCase()
        ) || stores[0];

        return {
          organization_id: matchedStore.organization_id,
          store_id: matchedStore.id,
          sales_date: String(row.sanitized.salesDate),
          net_sales: Number(row.sanitized.netSales),
          target_amount: row.sanitized.targetAmount ? Number(row.sanitized.targetAmount) : null,
          transaction_count: row.sanitized.transactionCount ? Number(row.sanitized.transactionCount) : null,
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
      subtitle="Impor berkas Daily Sales Report, verifikasi kolom & pemetaan data"
    >
      <div className="max-w-3xl mx-auto space-y-6">
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
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-8 text-center">
              <UploadCloud className="w-10 h-10 text-[#555555] mx-auto mb-2.5" />
              <h3 className="text-sm font-semibold text-[#111111] mb-1">
                Pilih Berkas Spreadsheet DSR
              </h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mb-5 leading-relaxed">
                Mendukung .xlsx, .xls, dan .csv. Sistem mendeteksi header secara otomatis.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <label className="cursor-pointer bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 py-2 rounded text-xs font-medium transition-colors">
                  <span>Pilih Berkas</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleLoadSampleTemplate}
                  className="bg-[#FAFAFA] border border-[#EAEAEA] text-[#333333] px-3.5 py-2 rounded text-xs hover:bg-[#F5F5F5] transition-colors"
                >
                  Gunakan File Contoh Demo
                </button>
              </div>
            </div>

            {/* Download Templates Bar */}
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
              <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider block mb-2.5">
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
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 space-y-5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Pemetaan Kolom
                </h3>
                <p className="text-[11px] text-[#777777]">
                  File: {fileName} • {rawRows.length} baris data terdeteksi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
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
                  {headers.map(h => (
                    <option key={h} value={h}>
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
                  {headers.map(h => (
                    <option key={h} value={h}>
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
                  {headers.map(h => (
                    <option key={h} value={h}>
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
                  {headers.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">
                  Kolom Jumlah Transaksi (Opsional)
                </label>
                <select
                  value={mapping.transactionCount || ''}
                  onChange={e => setMapping({ ...mapping, transactionCount: e.target.value })}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-xs text-[#111111]"
                >
                  <option value="">-- Pilih Kolom --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">
                  Kolom Unit Terjual (Opsional)
                </label>
                <select
                  value={mapping.unitsSold || ''}
                  onChange={e => setMapping({ ...mapping, unitsSold: e.target.value })}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-xs text-[#111111]"
                >
                  <option value="">-- Pilih Kolom --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>
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
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 space-y-5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Hasil Validasi Data
                </h3>
                <p className="text-[11px] text-[#777777]">
                  Tinjau baris data sebelum commit ke database
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded">
                <span className="text-[10px] text-[#777777] uppercase block">Baris Valid</span>
                <div className="text-lg font-semibold text-[#1E7E34] mt-0.5">
                  {validationSummary.validRows.length} Baris
                </div>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded">
                <span className="text-[10px] text-[#777777] uppercase block">Baris Bermasalah</span>
                <div className="text-lg font-semibold text-[#C0392B] mt-0.5">
                  {validationSummary.invalidRows.length} Baris
                </div>
              </div>
              <div className="p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded">
                <span className="text-[10px] text-[#777777] uppercase block">Duplikasi</span>
                <div className="text-lg font-semibold text-[#B87A00] mt-0.5">
                  {validationSummary.duplicateCount} Duplikat
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <span className="text-[11px] font-semibold text-[#111111] block mb-2">
                Preview Sampel Data Valid
              </span>
              <div className="overflow-x-auto border border-[#EAEAEA] rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFA] text-[#666666] text-[11px] font-medium border-b border-[#EAEAEA]">
                    <tr>
                      <th className="py-2 px-3 font-normal">Kode Toko</th>
                      <th className="py-2 px-3 font-normal">Tanggal</th>
                      <th className="py-2 px-3 font-normal">Net Sales</th>
                      <th className="py-2 px-3 font-normal">Target</th>
                      <th className="py-2 px-3 font-normal">Transaksi</th>
                      <th className="py-2 px-3 font-normal">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F5]">
                    {validationSummary.validRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAFA]">
                        <td className="py-2 px-3">{String(row.sanitized.storeCode)}</td>
                        <td className="py-2 px-3">{String(row.sanitized.salesDate)}</td>
                        <td className="py-2 px-3 font-medium text-[#111111]">
                          {formatIDR(Number(row.sanitized.netSales))}
                        </td>
                        <td className="py-2 px-3 text-[#666666]">
                          {row.sanitized.targetAmount
                            ? formatIDR(Number(row.sanitized.targetAmount))
                            : '-'}
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
                onClick={() => setStep(2)}
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
                {isLoading ? 'Menyimpan...' : `Simpan ${validationSummary.validRows.length} Baris Data`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Complete */}
        {step === 4 && commitResult && (
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#1E7E34] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111111]">
              Impor DSR Selesai
            </h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
              Sebanyak <strong>{commitResult.added} baris data penjualan</strong> berhasil disimpan.
              Dashboard dan laporan performa telah diperbarui.
            </p>

            <div className="pt-3 flex items-center justify-center gap-2.5">
              <a
                href="/area/dashboard"
                className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded text-xs font-medium hover:bg-[#333333]"
              >
                Lihat Dashboard Performa
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
