import { KpiSummary, SalesDaily } from '@/types';

/**
 * Formats a numeric value into Indonesian Rupiah (IDR).
 */
export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a percentage value (e.g., 85.5 -> "85.5%").
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a decimal number (e.g. for UPT / ATV).
 */
export function formatDecimal(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
}

/**
 * Calculates sales achievement percentage.
 * actual / target * 100
 * Returns null if target is missing, zero, or negative.
 */
export function calculateSalesAchievement(
  actualNetSales: number,
  targetSales: number | null | undefined
): number | null {
  if (targetSales === null || targetSales === undefined || targetSales <= 0) {
    return null;
  }
  return (actualNetSales / targetSales) * 100;
}

/**
 * Calculates sales gap (target - actual).
 * Returns null if target is not provided.
 */
export function calculateSalesGap(
  actualNetSales: number,
  targetSales: number | null | undefined
): number | null {
  if (targetSales === null || targetSales === undefined) {
    return null;
  }
  return targetSales - actualNetSales;
}

/**
 * Calculates Average Transaction Value (ATV).
 * net_sales / transaction_count
 * Returns null if transaction count is 0 or missing.
 */
export function calculateATV(
  netSales: number,
  transactionCount: number | null | undefined
): number | null {
  if (!transactionCount || transactionCount <= 0) {
    return null;
  }
  return netSales / transactionCount;
}

/**
 * Calculates Units Per Transaction (UPT).
 * units_sold / transaction_count
 * Returns null if transaction count is 0 or missing.
 */
export function calculateUPT(
  unitsSold: number | null | undefined,
  transactionCount: number | null | undefined
): number | null {
  if (
    unitsSold === null ||
    unitsSold === undefined ||
    !transactionCount ||
    transactionCount <= 0
  ) {
    return null;
  }
  return unitsSold / transactionCount;
}

/**
 * Calculates Average Daily Sales.
 * net_sales / days_elapsed
 * Returns null if days_elapsed <= 0.
 */
export function calculateAverageDailySales(
  netSales: number,
  daysElapsed: number
): number | null {
  if (daysElapsed <= 0) {
    return null;
  }
  return netSales / daysElapsed;
}

/**
 * Calculates period-over-period growth percentage.
 * (actual - comparison) / comparison * 100
 * Returns null if comparison is missing or zero.
 */
export function calculateGrowth(
  actual: number,
  comparison: number | null | undefined
): number | null {
  if (comparison === null || comparison === undefined || comparison === 0) {
    return null;
  }
  return ((actual - comparison) / Math.abs(comparison)) * 100;
}

/**
 * Calculates run-rate baseline sales forecast.
 * Projected Sales = (Actual / Days Elapsed) * Total Days In Period
 */
export function calculateRunRateForecast(
  actualNetSales: number,
  daysElapsed: number,
  totalDaysInPeriod: number
): number | null {
  if (daysElapsed <= 0 || totalDaysInPeriod <= 0 || daysElapsed > totalDaysInPeriod) {
    return null;
  }
  const dailyRunRate = actualNetSales / daysElapsed;
  return Math.round(dailyRunRate * totalDaysInPeriod);
}

/**
 * Summarizes an array of SalesDaily records for a specific period.
 */
export function summarizeSales(
  records: SalesDaily[],
  daysElapsed: number,
  totalDaysInPeriod: number,
  previousPeriodSales?: number | null
): KpiSummary {
  let totalNetSales = 0;
  let totalTarget: number | null = null;
  let hasTarget = false;
  let totalTransactions: number | null = null;
  let hasTransactions = false;
  let totalUnits: number | null = null;
  let hasUnits = false;

  for (const record of records) {
    totalNetSales += record.net_sales;

    if (record.target_amount !== null && record.target_amount !== undefined) {
      hasTarget = true;
      totalTarget = (totalTarget ?? 0) + record.target_amount;
    }

    if (record.transaction_count !== null && record.transaction_count !== undefined) {
      hasTransactions = true;
      totalTransactions = (totalTransactions ?? 0) + record.transaction_count;
    }

    if (record.units_sold !== null && record.units_sold !== undefined) {
      hasUnits = true;
      totalUnits = (totalUnits ?? 0) + record.units_sold;
    }
  }

  const achievement = calculateSalesAchievement(totalNetSales, hasTarget ? totalTarget : null);
  const gap = calculateSalesGap(totalNetSales, hasTarget ? totalTarget : null);
  const atv = calculateATV(totalNetSales, hasTransactions ? totalTransactions : null);
  const upt = calculateUPT(hasUnits ? totalUnits : null, hasTransactions ? totalTransactions : null);
  const avgDaily = calculateAverageDailySales(totalNetSales, daysElapsed);
  const growth = calculateGrowth(totalNetSales, previousPeriodSales);
  const forecastSales = calculateRunRateForecast(totalNetSales, daysElapsed, totalDaysInPeriod);
  const forecastGap = totalTarget !== null && forecastSales !== null ? totalTarget - forecastSales : null;

  return {
    actualSales: totalNetSales,
    targetSales: totalTarget,
    salesAchievement: achievement,
    salesGap: gap,
    transactionCount: totalTransactions,
    unitsSold: totalUnits,
    atv,
    upt,
    averageDailySales: avgDaily,
    daysElapsed,
    totalDaysInPeriod,
    growthVsPrevious: growth,
    forecastSales,
    forecastGap,
    forecastMethod: 'Run-Rate Pro-Rata Baseline',
  };
}
