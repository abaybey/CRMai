'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header({
  title,
  subtitle,
  onOpenMobileMenu,
}: {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}) {
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
    <header className="h-14 bg-white border-b border-[#EAEAEA] px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 -ml-1 rounded-md text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          {title ? (
            <div>
              <h2 className="text-xs sm:text-sm font-semibold sm:font-medium text-[#111111] truncate">{title}</h2>
              {subtitle && <p className="text-[10px] sm:text-[11px] text-[#777777] truncate hidden sm:block">{subtitle}</p>}
            </div>
          ) : (
            <span className="text-[11px] sm:text-xs text-[#777777] truncate">
              Plaza Senayan • MTD Okt 2026
            </span>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Boutique Focus Indicator (1 Boutique) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E5E5] bg-white text-xs">
          <Building2 className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#888888]">Butik:</span>
          <span className="text-xs text-[#111111] font-medium">Plaza Senayan (PS)</span>
        </div>

        {/* Role Switcher (Store Manager & SA only) */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded border border-[#E5E5E5] bg-white text-xs">
          <User className="w-3.5 h-3.5 text-[#888888] shrink-0" />
          <span className="text-[#888888] hidden sm:inline">Akses:</span>
          <select
            value={currentProfile.id}
            onChange={handleRoleChange}
            className="text-xs font-medium text-[#111111] bg-transparent border-none focus:outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
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
