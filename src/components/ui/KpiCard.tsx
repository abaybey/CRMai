'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  target?: string | null;
  achievement?: number | null;
  trend?: number | null;
  trendLabel?: string;
  highlight?: boolean;
}

export function KpiCard({
  label,
  value,
  subValue,
  target,
  achievement,
  trend,
  trendLabel = 'vs periode lalu',
}: KpiCardProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-[#EAEAEA] transition-colors hover:border-[#D5D5D5]">
      <div className="flex items-center justify-between text-[11px] sm:text-xs">
        <span className="text-[#666666] font-normal">{label}</span>
        {achievement !== null && achievement !== undefined && (
          <span
            className={`text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded ${
              achievement >= 100
                ? 'bg-[#EBF7EE] text-[#1E7E34]'
                : achievement >= 85
                ? 'bg-[#FFF8E6] text-[#B87A00]'
                : 'bg-[#FDF0ED] text-[#C0392B]'
            }`}
          >
            {achievement.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-2 sm:mt-2.5">
        <div className="text-lg sm:text-xl font-semibold text-[#111111] tracking-tight">{value}</div>
        {subValue && <p className="text-[10px] sm:text-[11px] text-[#777777] mt-0.5">{subValue}</p>}
      </div>

      {(target || trend !== null) && (
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#F5F5F5] flex items-center justify-between text-[10px] sm:text-[11px] text-[#777777]">
          {target && (
            <span>
              Target: <strong className="font-medium text-[#333333]">{target}</strong>
            </span>
          )}

          {trend !== null && trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trend > 0 ? 'text-[#1E7E34]' : trend < 0 ? 'text-[#C0392B]' : 'text-[#777777]'
              }`}
            >
              {trend > 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : trend < 0 ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {Math.abs(trend).toFixed(1)}% {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
