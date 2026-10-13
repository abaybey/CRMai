'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { retailDataStore } from '@/lib/data-store';
import {
  Building2,
  Users,
  ShieldCheck,
  RotateCcw,
  Clock,
  Globe,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentProfile, allProfiles, stores, refreshData } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data demonstrasi ke kondisi awal?')) {
      retailDataStore.resetDemoData();
      refreshData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const auditEvents = [
    {
      action: 'LOGIN_SESSION_AUTHENTICATED',
      actor: currentProfile.full_name.replace('[DEMO] ', ''),
      entity: 'auth.users',
      time: 'Hari ini, 08:30 WIB',
    },
    {
      action: 'DSR_DAILY_NORMALIZED',
      actor: 'System Import Pipeline',
      entity: 'sales_daily (14 records)',
      time: 'Hari ini, 06:00 WIB',
    },
    {
      action: 'AI_INSIGHT_EVIDENCE_GENERATED',
      actor: 'Deterministic Engine v1',
      entity: 'ai_insights',
      time: 'Kemarin, 22:15 WIB',
    },
    {
      action: 'PRIVACY_CONSENT_VERIFIED',
      actor: 'Clienteling Outreach Guard',
      entity: 'customers (CUST-001)',
      time: 'Kemarin, 14:10 WIB',
    },
  ];

  return (
    <AppLayout
      title="Pengaturan & Audit"
      subtitle="Profil organisasi, daftar gerai, hak akses pengguna & log sistem"
    >
      <div className="max-w-4xl space-y-6">
        {resetSuccess && (
          <div className="bg-[#EBF7EE] border border-[#D1EED5] p-3 rounded text-xs text-[#1E7E34] flex items-center justify-between">
            <span>✓ Data demonstrasi berhasil diatur ulang ke kondisi default.</span>
            <button onClick={() => setResetSuccess(false)} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Organization Identity */}
        <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#666666]" />
              <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                Profil Organisasi
              </h3>
            </div>
            <span className="text-[10px] bg-[#F5F5F5] text-[#555555] px-2 py-0.5 rounded">
              Multi-Tenant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#777777] block text-[11px]">Nama Organisasi</span>
              <strong className="text-[#111111] font-medium">Maison de Luxe Group</strong>
            </div>
            <div>
              <span className="text-[#777777] block text-[11px]">Zona Waktu</span>
              <strong className="text-[#111111] font-medium">Asia/Jakarta (WIB)</strong>
            </div>
            <div>
              <span className="text-[#777777] block text-[11px]">Mata Uang</span>
              <strong className="text-[#111111] font-medium">Indonesian Rupiah (IDR)</strong>
            </div>
          </div>
        </div>

        {/* Managed Stores */}
        <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F0F0F0]">
            <Globe className="w-4 h-4 text-[#666666]" />
            <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Daftar Gerai Butik ({stores.length})
            </h3>
          </div>

          <div className="divide-y divide-[#F5F5F5] text-xs">
            {stores.map(store => (
              <div key={store.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#111111]">
                    {store.name.replace('[DEMO] ', '')}
                  </div>
                  <div className="text-[11px] text-[#777777]">{store.location}</div>
                </div>
                <div className="text-right">
                  <span className="text-[#888888] text-[11px] block">{store.code}</span>
                  <span className="text-[10px] text-[#1E7E34]">Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Matrix & User Directory */}
        <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F0F0F0]">
            <Users className="w-4 h-4 text-[#666666]" />
            <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Hak Akses & Pengguna
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] text-[#666666] text-[11px] font-medium border-b border-[#EAEAEA]">
                <tr>
                  <th className="py-2 px-3 font-normal">Nama</th>
                  <th className="py-2 px-3 font-normal">Email</th>
                  <th className="py-2 px-3 font-normal">Role</th>
                  <th className="py-2 px-3 font-normal">Cakupan Akses Toko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {allProfiles.map(p => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-medium text-[#111111]">
                      {p.full_name.replace('[DEMO] ', '')}
                    </td>
                    <td className="py-2 px-3 text-[#666666]">{p.email}</td>
                    <td className="py-2 px-3">
                      <span className="capitalize text-[#444444]">
                        {p.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#777777]">
                      {p.role === 'area_manager'
                        ? 'Seluruh Gerai (Area Scope)'
                        : 'Gerai Ditugaskan Khusus'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security, Privacy & Audit Trail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#1E7E34]" />
              <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                Kebijakan Privasi (UU PDP)
              </h3>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Isolasi multi-tenant dan Row Level Security (RLS) PostgreSQL melindungi kerahasiaan
              data nomor telepon dan profil belanja tamu. Status &quot;Do Not Contact&quot; ditegakkan
              secara ketat pada generator pesan clienteling.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-[#EAEAEA] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#666666]" />
              <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                Log Jejak Audit
              </h3>
            </div>
            <div className="space-y-1.5 text-xs">
              {auditEvents.map((ev, idx) => (
                <div key={idx} className="p-2 bg-[#FAFAFA] rounded border border-[#EAEAEA]">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-medium text-[#111111]">{ev.action}</span>
                    <span className="text-[#888888]">{ev.time}</span>
                  </div>
                  <div className="text-[10px] text-[#666666] mt-0.5">
                    {ev.actor} • {ev.entity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Demo Data Action */}
        <div className="p-4 rounded-lg border border-[#EAEAEA] bg-white flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-[#111111]">
              Reset Data Demo
            </h4>
            <p className="text-[11px] text-[#777777] mt-0.5">
              Mengembalikan dataset DSR, riwayat kontak, dan status ke demo default.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#EAEAEA] text-[#333333] hover:bg-[#F5F5F5] text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
