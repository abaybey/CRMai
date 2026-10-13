'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter();
  const {
    currentProfile,
    currentRole,
    stores,
    selectedStoreId,
    switchProfile,
    switchStore,
    allProfiles,
  } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfileId = e.target.value;
    switchProfile(newProfileId);

    const profile = allProfiles.find(p => p.id === newProfileId);
    if (profile) {
      if (profile.role === 'area_manager' || profile.role === 'org_admin') {
        router.push('/area/dashboard');
      } else if (profile.role === 'store_manager') {
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
            Oktober 2026 • Periode MTD (Hari 14 dari 31)
          </span>
        )}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {/* Store Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E5E5] bg-white text-xs">
          <Building2 className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#888888]">Toko:</span>
          {currentRole === 'area_manager' || currentRole === 'org_admin' ? (
            <select
              value={selectedStoreId}
              onChange={e => switchStore(e.target.value)}
              className="text-xs text-[#111111] font-medium bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Cabang</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name.replace('[DEMO] ', '')}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-[#111111] font-medium">
              {stores.find(s => s.id === selectedStoreId)?.name.replace('[DEMO] ', '') ||
                'Toko Ditugaskan'}
            </span>
          )}
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E5E5] bg-white text-xs">
          <User className="w-3.5 h-3.5 text-[#888888]" />
          <span className="text-[#888888]">Peran:</span>
          <select
            value={currentProfile.id}
            onChange={handleRoleChange}
            className="text-xs font-medium text-[#111111] bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {allProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name.replace('[DEMO] ', '')} ({p.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
