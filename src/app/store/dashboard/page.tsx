'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { AiBriefingCard } from '@/components/ui/AiBriefingCard';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import { formatIDR, formatDecimal } from '@/lib/kpi';
import { Calendar, Gift, Plus } from 'lucide-react';
import Link from 'next/link';

export default function StoreDashboardPage() {
  const { currentProfile, stores, selectedStoreId } = useAuth();
  const currentStore =
    stores.find(s => s.id === selectedStoreId) ||
    stores.find(s => s.id === currentProfile.store_id) ||
    stores[0];

  const kpi = retailDataStore.getKpiSummary(currentStore.id);
  const tasks = retailDataStore.getTasks();
  const appointments = retailDataStore.getAppointments(currentStore.id);
  const aiInsights = retailDataStore.getAiInsights(currentStore.id);

  const [coachingTopic, setCoachingTopic] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Muhamad Ridwan Saputra');
  const [coachingKpi, setCoachingKpi] = useState('UPT & Cross-Selling');
  const [coachingPlan, setCoachingPlan] = useState('');
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState('');

  const handleSaveCoaching = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachingPlan) return;
    retailDataStore.addTask({
      organization_id: currentStore.organization_id,
      store_id: currentStore.id,
      customer_id: '30000000-0000-0000-0000-000000000001',
      assigned_staff_id: currentProfile.id,
      created_by: currentProfile.id,
      task_type: 'customer_request',
      priority: 'high',
      due_at: '2026-10-20T17:00:00Z',
      status: 'pending',
      recommended_action: `Coaching ${selectedStaff}: ${coachingKpi}. Target: ${coachingPlan}`,
      notes: coachingTopic,
    });
    setCoachingFeedback(`Coaching session untuk ${selectedStaff} berhasil dicatat.`);
    setShowCoachingModal(false);
    setCoachingPlan('');
    setCoachingTopic('');
  };

  return (
    <AppLayout
      title={`Performa Gerai — ${currentStore.name.replace('[DEMO] ', '')}`}
      subtitle="Evaluasi pencapaian target, performa staf, janji temu & jadwal coaching"
    >
      <div className="space-y-6">
        {coachingFeedback && (
          <div className="bg-[#EBF7EE] border border-[#D1EED5] p-3 rounded text-xs text-[#1E7E34] flex items-center justify-between">
            <span>✓ {coachingFeedback}</span>
            <button onClick={() => setCoachingFeedback('')} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Store Level KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard
            label="Net Sales Gerai (MTD)"
            value={formatIDR(kpi.actualSales)}
            subValue={`Target: ${formatIDR(kpi.targetSales)}`}
            target={formatIDR(kpi.targetSales)}
            achievement={kpi.salesAchievement}
            trend={kpi.growthVsPrevious}
          />
          <KpiCard
            label="Kesenjangan Target (Gap)"
            value={formatIDR(kpi.salesGap)}
            subValue={
              (kpi.salesGap || 0) > 0 ? 'Kekurangan omzet MTD' : 'Surplus omzet di atas target'
            }
            achievement={kpi.salesAchievement}
          />
          <KpiCard
            label="Average Transaction Value"
            value={formatIDR(kpi.atv)}
            subValue={`Total Transaksi: ${kpi.transactionCount || 0}`}
          />
          <KpiCard
            label="Units Per Transaction (UPT)"
            value={formatDecimal(kpi.upt, 2)}
            subValue={`Total Unit: ${kpi.unitsSold || 0} pcs`}
          />
        </div>

        {/* Staff Performance & Coaching Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Staff Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#EAEAEA] p-4">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#F5F5F5]">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Performa Staf (Sales Associate)
                </h3>
                <p className="text-[11px] text-[#777777]">
                  Pencapaian penjualan individu dan tamu aktif yang dikelola
                </p>
              </div>
              <button
                onClick={() => setShowCoachingModal(true)}
                className="inline-flex items-center gap-1.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#222222] text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Catat Coaching
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#666666] border-b border-[#EAEAEA] text-[11px] font-medium">
                  <tr>
                    <th className="py-2.5 px-3 font-normal">Nama SA</th>
                    <th className="py-2.5 px-3 font-normal">Sales MTD</th>
                    <th className="py-2.5 px-3 font-normal">Target</th>
                    <th className="py-2.5 px-3 font-normal">Pencapaian</th>
                    <th className="py-2.5 px-3 font-normal">Tamu Portofolio</th>
                    <th className="py-2.5 px-3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5]">
                  <tr className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 px-3 font-medium text-[#111111] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#EAEAEA] text-[#444444] flex items-center justify-center font-medium text-[10px]">
                        MR
                      </div>
                      Muhamad Ridwan Saputra
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#111111]">
                      {formatIDR(kpi.actualSales * 0.52)}
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">
                      {formatIDR((kpi.targetSales || 0) * 0.45)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-[#EBF7EE] text-[#1E7E34] px-1.5 py-0.5 rounded font-medium text-[11px]">
                        102.5%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">2 VIP (Clarissa, Michelle)</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#1E7E34] font-medium">On Track</td>
                  </tr>

                  <tr className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 px-3 font-medium text-[#111111] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#EAEAEA] text-[#444444] flex items-center justify-center font-medium text-[10px]">
                        KS
                      </div>
                      Keisha Suhendra
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#111111]">
                      {formatIDR(kpi.actualSales * 0.28)}
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">
                      {formatIDR((kpi.targetSales || 0) * 0.3)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-[#EBF7EE] text-[#1E7E34] px-1.5 py-0.5 rounded font-medium text-[11px]">
                        92.0%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">2 VIP (Richard, Felicia)</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#1E7E34] font-medium">On Track</td>
                  </tr>

                  <tr className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 px-3 font-medium text-[#111111] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#EAEAEA] text-[#444444] flex items-center justify-center font-medium text-[10px]">
                        FK
                      </div>
                      Farah Khansa Nabilah
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#111111]">
                      {formatIDR(kpi.actualSales * 0.20)}
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">
                      {formatIDR((kpi.targetSales || 0) * 0.25)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-[#FFF8E6] text-[#B87A00] px-1.5 py-0.5 rounded font-medium text-[11px]">
                        78.4%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">1 Tamu Baru</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#B87A00] font-medium">Perlu Coaching</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointments & Birthday Alerts */}
          <div className="space-y-3.5">
            {/* Appointments Card */}
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#666666]" />
                  Janji Temu Salon
                </span>
                <span className="text-[10px] bg-[#F5F5F5] text-[#555555] px-2 py-0.5 rounded">
                  {appointments.length} Terjadwal
                </span>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-[#888888] italic">Tidak ada janji temu hari ini.</p>
              ) : (
                <div className="space-y-2">
                  {appointments.map(app => (
                    <div
                      key={app.id}
                      className="p-2.5 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-xs"
                    >
                      <div className="flex items-center justify-between font-medium text-[#111111]">
                        <span>Ibu Clarissa Soeryadjaya (VIP)</span>
                        <span className="text-[11px] text-[#555555]">15:00 WIB</span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-0.5">{app.notes}</p>
                      <div className="mt-1.5 text-[10px] text-[#888888]">
                        Staf penanggung jawab: M. Ridwan Saputra
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Birthday Alert */}
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#666666]" />
                  Ulang Tahun Tamu (Bulan Ini)
                </span>
              </div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center justify-between p-2 rounded bg-[#FAFAFA] border border-[#EAEAEA]">
                  <div>
                    <span className="font-medium text-[#111111]">Ibu Felicia Anggoro</span>
                    <span className="text-[10px] text-[#777777] block">15 Oktober (2 hari lagi)</span>
                  </div>
                  <Link
                    href="/sa/customers"
                    className="text-[11px] font-medium text-[#111111] hover:underline"
                  >
                    Draft WA →
                  </Link>
                </li>
                <li className="flex items-center justify-between p-2 rounded bg-[#FAFAFA] border border-[#EAEAEA]">
                  <div>
                    <span className="font-medium text-[#111111]">Ibu Clarissa Soeryadjaya</span>
                    <span className="text-[10px] text-[#777777] block">18 Oktober (5 hari lagi)</span>
                  </div>
                  <Link
                    href="/sa/customers"
                    className="text-[11px] font-medium text-[#111111] hover:underline"
                  >
                    Draft WA →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Store Briefing */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
            Catatan Rekomendasi Khusus Gerai
          </h3>
          {aiInsights.map(insight => (
            <AiBriefingCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Coaching Modal */}
      {showCoachingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-[#EAEAEA]">
            <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1">
              Catat Sesi Coaching Manajerial
            </h3>
            <p className="text-[11px] text-[#777777] mb-3.5">
              Dokumentasikan topik evaluasi, KPI fokus, dan rencana tindak lanjut SA.
            </p>

            <form onSubmit={handleSaveCoaching} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#444444] font-medium mb-1">Pilih Staf (SA)</label>
                <select
                  value={selectedStaff}
                  onChange={e => setSelectedStaff(e.target.value)}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-[#111111]"
                >
                  <option value="Muhamad Ridwan Saputra">Muhamad Ridwan Saputra</option>
                  <option value="Keisha Suhendra">Keisha Suhendra</option>
                  <option value="Farah Khansa Nabilah">Farah Khansa Nabilah</option>
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Fokus KPI</label>
                <select
                  value={coachingKpi}
                  onChange={e => setCoachingKpi(e.target.value)}
                  className="w-full p-2 border border-[#EAEAEA] rounded bg-white text-[#111111]"
                >
                  <option value="UPT & Cross-Selling Aksesori">UPT & Cross-Selling Aksesori</option>
                  <option value="ATV & Presentasi Handbag Koleksi">ATV & Presentasi Handbag Koleksi</option>
                  <option value="Clienteling Reaktivasi Tamu Inaktif">Clienteling Reaktivasi Tamu Inaktif</option>
                </select>
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Topik Coaching</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Teknik penawaran silk scarf & leather wallet"
                  value={coachingTopic}
                  onChange={e => setCoachingTopic(e.target.value)}
                  className="w-full p-2 border border-[#EAEAEA] rounded text-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[#444444] font-medium mb-1">Rencana Tindak Lanjut SA</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Target tindakan konkret SA sebelum review berikutnya..."
                  value={coachingPlan}
                  onChange={e => setCoachingPlan(e.target.value)}
                  className="w-full p-2 border border-[#EAEAEA] rounded text-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCoachingModal(false)}
                  className="px-3 py-1.5 rounded border border-[#EAEAEA] text-[#666666] hover:bg-[#F5F5F5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#1A1A1A] text-white font-medium hover:bg-[#333333]"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
