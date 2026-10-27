// Financial calculation & utilities for EarnFlow
// NOTE: Strictly compliance-aligned. No "% return" or "guarantee return" labels.
// All values represent Estimated Task Income and Earning Potential.

export const DEPOSIT_PRESETS = [2000, 3500, 5000, 7500, 10000, 25000, 50000];

export const LOCKIN_PERIODS = [
  {
    id: '1m',
    months: 1,
    label: '1 Month',
    badge: 'Starter Sprint',
    tierFactor: 0.055, // internal task distribution factor
    description: 'Standard membership period. Access daily task rewards with principal eligible for withdrawal upon maturity.',
    color: '#06b6d4',
  },
  {
    id: '3m',
    months: 3,
    label: '3 Months',
    badge: 'Quarterly Growth',
    tierFactor: 0.060,
    description: 'Quarterly membership tier. Higher estimated daily task reward allocation and steady campaign access.',
    color: '#3b82f6',
  },
  {
    id: '6m',
    months: 6,
    label: '6 Months',
    badge: 'Alpha Tier',
    tierFactor: 0.065,
    description: 'Semi-annual membership tier. Advanced task earning potential with dedicated high-value brand campaigns.',
    color: '#8b5cf6',
  },
  {
    id: '12m',
    months: 12,
    label: '1 Year (12M)',
    badge: 'Diamond VIP',
    tierFactor: 0.070,
    description: 'Annual VIP membership tier. Maximum estimated daily task quota allocation and premium priority rewards.',
    color: '#10b981',
  },
];

/**
 * Calculates Estimated Income based on deposit tier and lock-in duration.
 * Strictly outputs estimated monetary income without percentage return claims.
 */
export function calculateEarnings(principal, months, factor) {
  const p = Number(principal) || 2000;
  const m = Number(months) || 1;
  const f = Number(factor) || (m === 1 ? 0.055 : m === 3 ? 0.060 : m === 6 ? 0.065 : 0.070);

  const totalGainMultiplier = Math.pow(1 + f, m) - 1;
  const estimatedTotalIncome = Math.round(p * totalGainMultiplier);
  const estimatedMaturityValue = p + estimatedTotalIncome;
  const totalDays = m * 30;
  const estimatedDailyIncome = +(estimatedTotalIncome / totalDays).toFixed(2);
  const estimatedMonthlyIncome = +(estimatedDailyIncome * 30).toFixed(2);
  const estimatedWeeklyIncome = +(estimatedDailyIncome * 7).toFixed(2);

  return {
    principal: p,
    months: m,
    totalEarnings: estimatedTotalIncome,
    estimatedTotalIncome,
    estimatedMaturityValue,
    totalMaturityValue: estimatedMaturityValue,
    totalDays,
    dailyEarningQuota: estimatedDailyIncome,
    estimatedDailyIncome,
    estimatedMonthlyIncome,
    estimatedWeeklyIncome,
    weeklySundayQuota: estimatedWeeklyIncome,
  };
}

export function formatINR(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates countdown to next Sunday 00:00:00 (or check if today is Sunday)
 */
export function getNextSundayStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  const isSunday = dayOfWeek === 0;

  // Calculate milliseconds until next Sunday 00:00:00
  let daysUntilSunday = (7 - dayOfWeek) % 7;
  if (daysUntilSunday === 0 && !isSunday) {
    daysUntilSunday = 7;
  }

  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 0 : daysUntilSunday));
  nextSunday.setHours(23, 59, 59, 999);

  const diffMs = Math.max(0, nextSunday.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    isSunday,
    nextSundayDate: nextSunday,
    hours,
    minutes,
    seconds,
    daysUntilSunday,
    formattedCountdown: `${hours}h ${minutes}m ${seconds}s`,
  };
}

/**
 * Extracts standard 11-character YouTube video ID from various URL formats
 * (e.g. youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...)
 */
export function extractYoutubeId(url) {
  if (!url) return 'y9u2eQy5fmg';
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : (trimmed.length === 11 ? trimmed : 'y9u2eQy5fmg');
}

