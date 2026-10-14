'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, FileSpreadsheet, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentRole } = useAuth();

  const getDashboardHref = () => {
    if (currentRole === 'store_manager') return '/store/dashboard';
    return '/sa/dashboard';
  };

  const navItems = [
    {
      name: 'Performa',
      href: getDashboardHref(),
      icon: LayoutDashboard,
      active: pathname.includes('/dashboard'),
    },
    {
      name: 'Tamu VIP',
      href: '/sa/customers',
      icon: Users,
      active: pathname === '/sa/customers',
    },
    {
      name: 'Tugas',
      href: '/tasks',
      icon: CheckSquare,
      active: pathname === '/tasks',
    },
    ...(currentRole === 'store_manager'
      ? [
          {
            name: 'Impor DSR',
            href: '/import',
            icon: FileSpreadsheet,
            active: pathname === '/import',
          },
        ]
      : []),
    {
      name: 'Profil',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAEAEA] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-sm"
    >
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg min-w-[56px] transition-colors ${
              item.active ? 'text-[#111111]' : 'text-[#888888] hover:text-[#555555]'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${item.active ? 'bg-[#F2F2F2]' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                item.active ? 'font-semibold text-[#111111]' : 'font-normal'
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
