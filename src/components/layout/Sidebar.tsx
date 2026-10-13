'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  CheckSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole, currentProfile } = useAuth();

  const getDashboardHref = () => {
    if (currentRole === 'area_manager' || currentRole === 'org_admin') return '/area/dashboard';
    if (currentRole === 'store_manager') return '/store/dashboard';
    return '/sa/dashboard';
  };

  const navItems = [
    {
      name: 'Dashboard Performa',
      href: getDashboardHref(),
      icon: LayoutDashboard,
      active: pathname.includes('/dashboard'),
    },
    {
      name: 'Clienteling & Tamu',
      href: '/sa/customers',
      icon: Users,
      active: pathname === '/sa/customers',
    },
    {
      name: 'Impor DSR & Data',
      href: '/import',
      icon: FileSpreadsheet,
      active: pathname === '/import',
      allowedRoles: ['org_admin', 'area_manager', 'store_manager'],
    },
    {
      name: 'Tugas & Tindak Lanjut',
      href: '/tasks',
      icon: CheckSquare,
      active: pathname === '/tasks',
    },
    {
      name: 'Pengaturan & Audit',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <aside className="w-60 bg-white text-[#1A1A1A] flex flex-col border-r border-[#EAEAEA] min-h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#1A1A1A] flex items-center justify-center text-white font-medium text-xs tracking-wider">
            M
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-wider uppercase text-[#1A1A1A]">
              Maison de Luxe
            </h1>
            <p className="text-[10px] text-[#888888]">Retail OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-medium tracking-wider text-[#999999] uppercase">
          Menu
        </div>

        {navItems.map(item => {
          if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
            return null;
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                item.active
                  ? 'bg-[#F4F4F5] text-[#111111]'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAFAFA]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? 'text-[#111111]' : 'text-[#888888]'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.active && <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info Footprint */}
      <div className="p-3.5 border-t border-[#F0F0F0] bg-[#FAFAFA]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EEEEEE] border border-[#E0E0E0] flex items-center justify-center text-[11px] font-medium text-[#444444]">
            {currentProfile.full_name.charAt(7) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#1A1A1A] truncate">
              {currentProfile.full_name.replace('[DEMO] ', '')}
            </p>
            <p className="text-[10px] text-[#888888] capitalize truncate">
              {currentRole.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
