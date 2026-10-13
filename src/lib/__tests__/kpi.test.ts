import { describe, it, expect } from 'vitest';
import {
  calculateSalesAchievement,
  calculateSalesGap,
  calculateATV,
  calculateUPT,
  calculateAverageDailySales,
  calculateGrowth,
  calculateRunRateForecast,
  formatIDR,
  formatPercent,
  formatDecimal,
  summarizeSales,
} from '../kpi';
import { SalesDaily } from '@/types';

describe('KPI Calculation Engine', () => {
  describe('calculateSalesAchievement', () => {
    it('calculates correct achievement percentage', () => {
      expect(calculateSalesAchievement(85_000_000, 100_000_000)).toBe(85);
      expect(calculateSalesAchievement(120_000_000, 100_000_000)).toBe(120);
    });

    it('returns null when target is null, undefined, or zero (no false 0 or Infinity)', () => {
      expect(calculateSalesAchievement(50_000_000, null)).toBeNull();
      expect(calculateSalesAchievement(50_000_000, undefined)).toBeNull();
      expect(calculateSalesAchievement(50_000_000, 0)).toBeNull();
      expect(calculateSalesAchievement(50_000_000, -10_000_000)).toBeNull();
    });
  });

  describe('calculateSalesGap', () => {
    it('calculates gap between target and actual', () => {
      expect(calculateSalesGap(80_000_000, 100_000_000)).toBe(20_000_000); // Behind target
      expect(calculateSalesGap(110_000_000, 100_000_000)).toBe(-10_000_000); // Surpassed target
    });

    it('returns null when target is null or undefined', () => {
      expect(calculateSalesGap(80_000_000, null)).toBeNull();
      expect(calculateSalesGap(80_000_000, undefined)).toBeNull();
    });
  });

  describe('calculateATV', () => {
    it('calculates Average Transaction Value accurately', () => {
      expect(calculateATV(100_000_000, 10)).toBe(10_000_000);
      expect(calculateATV(45_000_000, 3)).toBe(15_000_000);
    });

    it('returns null when transaction count is 0 or missing (prevents division by zero)', () => {
      expect(calculateATV(100_000_000, 0)).toBeNull();
      expect(calculateATV(100_000_000, null)).toBeNull();
      expect(calculateATV(100_000_000, undefined)).toBeNull();
    });
  });

  describe('calculateUPT', () => {
    it('calculates Units Per Transaction accurately', () => {
      expect(calculateUPT(25, 10)).toBe(2.5);
      expect(calculateUPT(12, 8)).toBe(1.5);
    });

    it('returns null when units or tx count is missing or zero', () => {
      expect(calculateUPT(null, 10)).toBeNull();
      expect(calculateUPT(20, 0)).toBeNull();
      expect(calculateUPT(undefined, undefined)).toBeNull();
    });
  });

  describe('calculateAverageDailySales', () => {
    it('calculates daily average across elapsed days', () => {
      expect(calculateAverageDailySales(150_000_000, 15)).toBe(10_000_000);
    });

    it('returns null if days elapsed is zero or negative', () => {
      expect(calculateAverageDailySales(150_000_000, 0)).toBeNull();
      expect(calculateAverageDailySales(150_000_000, -5)).toBeNull();
    });
  });

  describe('calculateGrowth', () => {
    it('calculates positive and negative growth vs comparison period', () => {
      expect(calculateGrowth(120_000_000, 100_000_000)).toBe(20);
      expect(calculateGrowth(80_000_000, 100_000_000)).toBe(-20);
    });

    it('returns null when comparison is 0 or null', () => {
      expect(calculateGrowth(50_000_000, 0)).toBeNull();
      expect(calculateGrowth(50_000_000, null)).toBeNull();
      expect(calculateGrowth(50_000_000, undefined)).toBeNull();
    });
  });

  describe('calculateRunRateForecast', () => {
    it('projects monthly sales based on run-rate', () => {
      // 10 days elapsed, 100M achieved => 10M/day * 30 days = 300M
      expect(calculateRunRateForecast(100_000_000, 10, 30)).toBe(300_000_000);
    });

    it('returns null if invalid days elapsed or period', () => {
      expect(calculateRunRateForecast(100_000_000, 0, 30)).toBeNull();
      expect(calculateRunRateForecast(100_000_000, 35, 30)).toBeNull();
    });
  });

  describe('Formatters', () => {
    it('formats IDR currency with symbol and no false decimals', () => {
      const formatted = formatIDR(15_500_000);
      expect(formatted).toContain('15.500.000');
      expect(formatIDR(null)).toBe('N/A');
    });

    it('formats percentages and decimals', () => {
      expect(formatPercent(82.45)).toBe('82.5%');
      expect(formatPercent(null)).toBe('N/A');
      expect(formatDecimal(1.756)).toBe('1.76');
      expect(formatDecimal(null)).toBe('N/A');
    });
  });

  describe('summarizeSales', () => {
    const mockDaily: SalesDaily[] = [
      {
        id: '1',
        organization_id: 'org1',
        store_id: 'store1',
        sales_date: '2026-10-01',
        net_sales: 50_000_000,
        target_amount: 60_000_000,
        transaction_count: 5,
        units_sold: 8,
        created_at: '2026-10-01T00:00:00Z',
      },
      {
        id: '2',
        organization_id: 'org1',
        store_id: 'store1',
        sales_date: '2026-10-02',
        net_sales: 70_000_000,
        target_amount: 60_000_000,
        transaction_count: 7,
        units_sold: 14,
        created_at: '2026-10-02T00:00:00Z',
      },
    ];

    it('aggregates daily records correctly', () => {
      const summary = summarizeSales(mockDaily, 2, 30, 100_000_000);
      expect(summary.actualSales).toBe(120_000_000);
      expect(summary.targetSales).toBe(120_000_000);
      expect(summary.salesAchievement).toBe(100);
      expect(summary.salesGap).toBe(0);
      expect(summary.transactionCount).toBe(12);
      expect(summary.unitsSold).toBe(22);
      expect(summary.atv).toBe(10_000_000);
      expect(summary.upt).toBeCloseTo(1.833, 2);
      expect(summary.averageDailySales).toBe(60_000_000);
      expect(summary.growthVsPrevious).toBe(20);
      // Run rate: 120M in 2 days = 60M/day * 30 days = 1,800,000,000
      expect(summary.forecastSales).toBe(1_800_000_000);
    });
  });
});
