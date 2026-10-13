'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-[#18181B]">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E4E4E7] p-8 shadow-lg text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto border border-[#FCA5A5]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#18181B]">Akses Tidak Diizinkan (403)</h2>
        <p className="text-xs text-[#71717A] leading-relaxed">
          Akun Anda tidak memiliki hak otorisasi untuk mengakses gerai atau modul ini.
          Seluruh akses diawasi secara ketat berdasarkan aturan Row Level Security (RLS) dan kebijakan tata kelola data retail.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#18181B] text-white text-xs font-semibold rounded-lg hover:bg-[#27272A] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
