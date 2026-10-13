'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { AiBriefingCard } from '@/components/ui/AiBriefingCard';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import { formatIDR, formatDecimal } from '@/lib/kpi';
import { AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AreaDashboardPage() {
  const { stores, selectedStoreId } = useAuth();

  const kpiOverall = retailDataStore.getKpiSummary(selectedStoreId);
  const aiInsights = retailDataStore.getAiInsights(selectedStoreId);

  const storeComparisons = stores.map(store => {
    const kpi = retailDataStore.getKpiSummary(store.id);
    return {
      store,
      kpi,
    };
  });

  const rankedStores = [...storeComparisons].sort((a, b) => {
    return (b.kpi.salesAchievement || 0) - (a.kpi.salesAchievement || 0);
  });

  const storesNeedingAttention = storeComparisons.filter(
    item => item.kpi.salesAchievement !== null && item.kpi.salesAchievement < 85
  );

  return (
    <AppLayout
      title="Performa Area & Multi-Cabang"
      subtitle="Konsolidasi Daily Sales Report (DSR) dan evaluasi performa gerai"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#EAEAEA]">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#777777]">Periode:</span>
            <span className="font-medium text-[#111111] bg-[#F5F5F5] px-2.5 py-0.5 rounded">
              1 Okt - 14 Okt 2026 (MTD)
            </span>
          </div>

          <Link
            href="/import"
            className="inline-flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Impor DSR Baru</span>
          </Link>
        </div>

        {/* Core KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard
            label="Total Net Sales (MTD)"
            value={formatIDR(kpiOverall.actualSales)}
            subValue={`Target: ${formatIDR(kpiOverall.targetSales)}`}
            target={formatIDR(kpiOverall.targetSales)}
            achievement={kpiOverall.salesAchievement}
            trend={kpiOverall.growthVsPrevious}
          />
          <KpiCard
            label="Kesenjangan Target (Sales Gap)"
            value={formatIDR(kpiOverall.salesGap)}
            subValue={
              (kpiOverall.salesGap || 0) > 0
                ? 'Defisit akumulasi MTD'
                : 'Surplus omzet di atas target'
            }
            achievement={kpiOverall.salesAchievement}
          />
          <KpiCard
            label="Average Transaction Value (ATV)"
            value={formatIDR(kpiOverall.atv)}
            subValue={`Total Transaksi: ${kpiOverall.transactionCount || 0}`}
            trend={4.5}
            trendLabel="vs benchmark"
          />
          <KpiCard
            label="Units Per Transaction (UPT)"
            value={formatDecimal(kpiOverall.upt, 2)}
            subValue={`Total Unit: ${kpiOverall.unitsSold || 0} pcs`}
            trend={-2.1}
            trendLabel="vs target 1.6"
          />
        </div>

        {/* Run-Rate Forecasting Banner */}
        <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider block">
                Proyeksi Run-Rate Akhir Bulan
              </span>
              <h3 className="text-base font-semibold text-[#111111] mt-0.5">
                Estimasi Penjualan: {formatIDR(kpiOverall.forecastSales)}
              </h3>
              <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                Rata-rata penjualan harian {formatIDR(kpiOverall.averageDailySales)}/hari selama 14
                hari pertama. Perkiraan gap:{' '}
                <span className={(kpiOverall.forecastGap || 0) > 0 ? 'text-[#C0392B]' : 'text-[#1E7E34]'}>
                  {formatIDR(kpiOverall.forecastGap)}
                </span>
                .
              </p>
            </div>
            <div className="text-right text-[11px] text-[#888888]">
              Progress: <strong>14 / 31 Hari</strong>
            </div>
          </div>
        </div>

        {/* Stores Needing Attention Alert */}
        {storesNeedingAttention.length > 0 && (
          <div className="bg-[#FFFDFB] border border-[#F0E6DD] rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B87A00] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-semibold text-[#333333]">
                Catatan Cabang di Bawah Target (&lt;85%):
              </span>
              <span className="text-[#666666] ml-1.5">
                {storesNeedingAttention
                  .map(
                    item =>
                      `${item.store.name.replace('[DEMO] ', '')} (${item.kpi.salesAchievement?.toFixed(
                        1
                      )}% | Gap: ${formatIDR(item.kpi.salesGap)})`
                  )
                  .join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Branch Comparison & Ranking Table */}
        <div className="bg-white rounded-lg border border-[#EAEAEA] overflow-hidden">
          <div className="p-4 border-b border-[#F0F0F0] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                Perbandingan Performa Cabang
              </h3>
              <p className="text-[11px] text-[#777777]">
                Pencapaian aktual, target penjualan, ATV, dan UPT gerai
              </p>
            </div>
            <span className="text-xs text-[#888888]">3 Cabang</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] text-[#666666] border-b border-[#EAEAEA] font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-normal">No</th>
                  <th className="py-2.5 px-3.5 font-normal">Nama Gerai</th>
                  <th className="py-2.5 px-3.5 font-normal">Net Sales</th>
                  <th className="py-2.5 px-3.5 font-normal">Target</th>
                  <th className="py-2.5 px-3.5 font-normal">Pencapaian</th>
                  <th className="py-2.5 px-3.5 font-normal">Sales Gap</th>
                  <th className="py-2.5 px-3.5 font-normal">ATV</th>
                  <th className="py-2.5 px-3.5 font-normal">UPT</th>
                  <th className="py-2.5 px-3.5 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {rankedStores.map((item, index) => {
                  const ach = item.kpi.salesAchievement || 0;
                  return (
                    <tr key={item.store.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-2.5 px-3.5 text-[#888888]">{index + 1}</td>
                      <td className="py-2.5 px-3.5 font-medium text-[#111111]">
                        {item.store.name.replace('[DEMO] ', '')}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-[#111111]">
                        {formatIDR(item.kpi.actualSales)}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#666666]">
                        {formatIDR(item.kpi.targetSales)}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            ach >= 100
                              ? 'bg-[#EBF7EE] text-[#1E7E34]'
                              : ach >= 85
                              ? 'bg-[#FFF8E6] text-[#B87A00]'
                              : 'bg-[#FDF0ED] text-[#C0392B]'
                          }`}
                        >
                          {ach.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#666666]">
                        {formatIDR(item.kpi.salesGap)}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#333333]">{formatIDR(item.kpi.atv)}</td>
                      <td className="py-2.5 px-3.5 text-[#333333]">
                        {formatDecimal(item.kpi.upt, 2)}
                      </td>
                      <td className="py-2.5 px-3.5 text-[11px] text-[#666666]">
                        {ach >= 100 ? 'Melampaui' : ach >= 85 ? 'On-Track' : 'Perlu Dorongan'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Management Insights Stream */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Analisis Tindak Lanjut & Rekomendasi
            </h3>
            <span className="text-[11px] text-[#888888]">
              Dianalisis secara deterministik dari database DSR
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {aiInsights.map(insight => (
              <AiBriefingCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
