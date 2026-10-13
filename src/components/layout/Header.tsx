'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter();
  const { currentProfile, switchProfile, allProfiles } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfileId = e.target.value;
    switchProfile(newProfileId);

    const profile = allProfiles.find(p => p.id === newProfileId);
    if (profile) {
      if (profile.role === 'store_manager') {
        router.push('/store/dashboard');
      } else {
        router.push('/sa/dashboard');
      }
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#EAEAEA] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div>
        {title ? (
          <div>
            <h2 className="text-sm font-medium text-[#111111]">{title}</h2>
            {subtitle && <p className="text-[11px] text-[#777777]">{subtitle}</p>}
          </div>
        ) : (
          <span className="text-xs text-[#777777]">
            Plaza Senayan • MTD Oktober 2026 (Hari 14 dari 31)
          </span>
        )}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {/* Boutique Focus Indicator (1 Boutique) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E5E5] bg-white text-xs">
          <Building2 className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#888888]">Butik:</span>
          <span className="text-xs text-[#111111] font-medium">Plaza Senayan (PS)</span>
        </div>

        {/* Role Switcher (Store Manager & SA only) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E5E5] bg-white text-xs">
          <User className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#888888]">Akses:</span>
          <select
            value={currentProfile.id}
            onChange={handleRoleChange}
            className="text-xs font-medium text-[#111111] bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {allProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name.replace('[DEMO] ', '')} ({p.role === 'store_manager' ? 'Store Manager' : 'Sales Associate'})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
