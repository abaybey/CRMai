'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { switchProfile } = useAuth();

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#1A1A1A] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-[#EAEAEA] bg-white px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#1A1A1A] flex items-center justify-center text-white font-medium text-xs tracking-wider">
              M
            </div>
            <div>
              <h1 className="text-xs font-semibold tracking-wider uppercase text-[#1A1A1A]">
                Maison de Luxe
              </h1>
              <p className="text-[10px] text-[#888888]">Retail Intelligence OS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#666666] bg-[#F5F5F5] px-2.5 py-0.5 rounded">
              Mode Demo Aktif
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
            Retail Performance & Clienteling OS
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Platform operasional multi-cabang untuk luxury fashion retail. Pemantauan Daily Sales Report
            (DSR), kalkulasi KPI deterministik, analitik performa, dan CRM clienteling berbasis izin.
          </p>
        </div>

        {/* 3 Role Quick Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {/* 1. Area Manager */}
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 hover:border-[#CCCCCC] transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider block mb-1">
                Eksekutif Area
              </span>
              <h3 className="text-sm font-semibold text-[#111111] mb-1.5">
                Area Manager
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-5">
                Konsolidasi DSR seluruh gerai, perbandingan cabang, analisis pencapaian, dan ringkasan manajemen.
              </p>
            </div>
            <Link
              href="/area/dashboard"
              onClick={() => switchProfile('20000000-0000-0000-0000-000000000001')}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium py-2 rounded transition-colors"
            >
              <span>Buka Dashboard Area</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. Store Manager */}
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 hover:border-[#CCCCCC] transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider block mb-1">
                Pimpinan Gerai
              </span>
              <h3 className="text-sm font-semibold text-[#111111] mb-1.5">
                Store Manager
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-5">
                Pencapaian target harian vs aktual, leaderboard tim SA, agenda janji temu, dan pencatatan coaching staf.
              </p>
            </div>
            <Link
              href="/store/dashboard"
              onClick={() => switchProfile('20000000-0000-0000-0000-000000000002')}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium py-2 rounded transition-colors"
            >
              <span>Buka Dashboard Gerai</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. Sales Associate */}
          <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 hover:border-[#CCCCCC] transition-colors flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider block mb-1">
                Staf Penjualan
              </span>
              <h3 className="text-sm font-semibold text-[#111111] mb-1.5">
                Sales Associate (SA)
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-5">
                Target personal, daftar customer yang ditugaskan, reminder ulang tahun, dan pembuatan draft WhatsApp.
              </p>
            </div>
            <Link
              href="/sa/dashboard"
              onClick={() => switchProfile('20000000-0000-0000-0000-000000000003')}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium py-2 rounded transition-colors"
            >
              <span>Buka Workspace SA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[#EAEAEA] text-[11px] text-[#777777]">
          <div>• Multi-Tenant & RLS Isolation</div>
          <div>• DSR Spreadsheet Import Wizard</div>
          <div>• Kalkulasi Deterministik KPI</div>
          <div>• Standar Privasi UU PDP</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAEAEA] bg-white py-3.5 px-6 text-center text-[11px] text-[#888888]">
        Retail Intelligence OS • Maison de Luxe Group
      </footer>
    </div>
  );
}
