'use client';

import React from 'react';
import { AiInsight } from '@/types';
import { formatIDR } from '@/lib/kpi';

export function AiBriefingCard({ insight }: { insight: AiInsight }) {
  return (
    <div className="bg-white rounded-lg border border-[#EAEAEA] p-5 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F5] mb-3.5">
        <div>
          <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
            Analisis & Rekomendasi Performa
          </span>
          <p className="text-[11px] text-[#777777]">
            Periode: {insight.period_start} s/d {insight.period_end} • Berbasis DSR
          </p>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F4F4F5] text-[#555555] uppercase">
          Prioritas: {insight.priority}
        </span>
      </div>

      {/* Main Title & Summary */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#111111] mb-1">{insight.title}</h3>
        <p className="text-xs text-[#555555] leading-relaxed">{insight.summary}</p>
      </div>

      {/* Evidence Section */}
      <div className="mb-4 bg-[#FAFAFA] rounded-md p-3 border border-[#EAEAEA]">
        <span className="text-[10px] font-semibold text-[#777777] uppercase tracking-wider block mb-2">
          Data Pendukung (Evidence Base)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {insight.evidence.map((ev, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded border border-[#EAEAEA]">
              <span className="text-[10px] text-[#777777] uppercase block">
                {ev.metric.replace('_', ' ')}
              </span>
              <div className="text-xs font-semibold text-[#111111] mt-0.5">
                {ev.unit === 'percent'
                  ? `${ev.actual}%`
                  : ev.unit === 'currency_idr'
                  ? formatIDR(ev.actual)
                  : ev.actual}
              </div>
              {ev.context && <p className="text-[10px] text-[#888888] mt-0.5">{ev.context}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="mb-3">
        <span className="text-[11px] font-semibold text-[#111111] uppercase tracking-wider block mb-2">
          Rekomendasi Tindak Lanjut
        </span>
        <ul className="space-y-1.5">
          {insight.recommended_actions.map((act, idx) => (
            <li
              key={idx}
              className="text-xs text-[#333333] flex items-start gap-2 bg-[#FAFAFA] p-2.5 rounded border border-[#EEEEEE]"
            >
              <span className="w-4 h-4 rounded-full bg-[#EEEEEE] text-[#555555] flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{act}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations Disclaimer */}
      {insight.limitations && insight.limitations.length > 0 && (
        <div className="pt-2.5 border-t border-[#F5F5F5] text-[10px] text-[#888888]">
          <span>Catatan metodologi: {insight.limitations.join(' ')}</span>
        </div>
      )}
    </div>
  );
}
