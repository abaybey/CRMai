'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import { formatIDR } from '@/lib/kpi';
import { Gift, CheckCircle2, Calendar, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function SalesAssociateDashboardPage() {
  const { currentProfile } = useAuth();

  const personalActual = 485_000_000;
  const personalTarget = 500_000_000;
  const personalAchievement = (personalActual / personalTarget) * 100;
  const personalGap = personalTarget - personalActual;

  const tasks = retailDataStore.getTasks();
  const customers = retailDataStore.getCustomers();

  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState('');

  const handleCompleteTask = (taskId: string) => {
    retailDataStore.updateTaskStatus(
      taskId,
      'completed',
      'Telah dikontak melalui WhatsApp dan dicatat respons positif.'
    );
    setCompletedTaskIds(prev => new Set(prev).add(taskId));
    setSuccessMsg('Tugas ditandai selesai.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' && !completedTaskIds.has(t.id));
  const completedCount = tasks.filter(t => t.status === 'completed' || completedTaskIds.has(t.id)).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <AppLayout
      title={`Workspace Penjualan — ${currentProfile.full_name.replace('[DEMO] ', '')}`}
      subtitle="Target individu, portofolio tamu, dan antrean tindak lanjut harian"
    >
      <div className="space-y-6">
        {successMsg && (
          <div className="bg-[#EBF7EE] border border-[#D1EED5] p-3 rounded text-xs text-[#1E7E34] flex items-center justify-between">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Personal Performance Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard
            label="Pencapaian Pribadi (MTD)"
            value={formatIDR(personalActual)}
            subValue={`Target Bulan: ${formatIDR(personalTarget)}`}
            target={formatIDR(personalTarget)}
            achievement={personalAchievement}
            trend={14.2}
            trendLabel="vs bulan lalu"
          />
          <KpiCard
            label="Kekurangan Target (Gap)"
            value={formatIDR(personalGap)}
            subValue="Sisa target menuju 100%"
            achievement={personalAchievement}
          />
          <KpiCard
            label="Tamu Portofolio Ditugaskan"
            value={`${customers.length} Tamu VIP`}
            subValue="Akses khusus terverifikasi"
          />
          <KpiCard
            label="Progress Follow-Up"
            value={`${completionRate.toFixed(0)}% Selesai`}
            subValue={`${completedCount} dari ${totalTasks} tugas selesai`}
            trend={completionRate}
            trendLabel="progress"
          />
        </div>

        {/* Action Priority Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Tasks Queue */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#EAEAEA] p-4">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#F5F5F5]">
              <div>
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Daftar Tugas Clienteling
                </h3>
                <p className="text-[11px] text-[#777777]">
                  Tindak lanjut kontak customer VIP terjadwal
                </p>
              </div>
              <span className="text-xs text-[#666666]">
                {pendingTasks.length} Menunggu
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-[#FAFAFA] rounded border border-dashed border-[#EAEAEA]">
                <CheckCircle2 className="w-6 h-6 text-[#1E7E34] mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-[#111111]">Semua Tugas Telah Selesai</h4>
                <p className="text-[11px] text-[#777777] mt-0.5">
                  Seluruh agenda kontak customer telah diselesaikan.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map(task => {
                  const customer = customers.find(c => c.id === task.customer_id);
                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-[#FAFAFA] rounded-md border border-[#EAEAEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEEEE] text-[#444444] uppercase">
                            {task.priority}
                          </span>
                          <span className="text-xs font-medium text-[#111111]">
                            {customer?.full_name.replace('[DEMO] ', '') || 'Pelanggan VIP'}
                          </span>
                          {customer?.tier && (
                            <span className="text-[10px] text-[#777777]">
                              • {customer.tier}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#444444] leading-relaxed">
                          {task.recommended_action}
                        </p>
                        {task.notes && (
                          <p className="text-[11px] text-[#888888]">Catatan: {task.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/sa/customers?action=draft&customerId=${task.customer_id}`}
                          className="inline-flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Draft WA
                        </Link>
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="inline-flex items-center gap-1 bg-white border border-[#EAEAEA] hover:bg-[#F5F5F5] text-[#333333] text-xs font-medium px-2.5 py-1.5 rounded"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E34]" />
                          Selesai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Access Clienteling Sidebar */}
          <div className="space-y-3.5">
            {/* Birthday Alert */}
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#666666]" />
                  Ulang Tahun Tamu Ditugaskan
                </span>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed mb-3">
                Ibu Clarissa Soeryadjaya berulang tahun dalam 5 hari (18 Oktober). Siapkan private
                birthday privilege card dan tawaran teh di boutique.
              </p>
              <Link
                href="/sa/customers?action=draft&customerId=30000000-0000-0000-0000-000000000001"
                className="w-full text-center block bg-[#FAFAFA] border border-[#EAEAEA] hover:bg-[#F5F5F5] text-[#222222] text-xs font-medium py-1.5 rounded transition-colors"
              >
                Buat Ucapan Selamat Ulang Tahun →
              </Link>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#666666]" />
                  Janji Temu Salon
                </span>
              </div>
              <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-xs">
                <div className="flex items-center justify-between font-medium text-[#111111]">
                  <span>Ibu Clarissa Soeryadjaya</span>
                  <span className="text-[11px] text-[#777777]">15:00 WIB</span>
                </div>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Private room reserved untuk koleksi Autumn/Winter handbag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
