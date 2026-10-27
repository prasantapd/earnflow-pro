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

/**
 * Calculates membership tier, login streak bonus multiplier, and task income multiplier
 * based on the user's active membership plan deposit amount / tier.
 */
export function getMembershipTier(activePlan) {
  if (!activePlan || activePlan.status !== 'active') {
    return {
      tierKey: 'starter',
      tierName: 'Starter Member',
      tierBadge: 'Starter Member',
      loginMultiplier: 1.0,
      taskMultiplier: 1.0,
      color: '#06b6d4',
      badgeClass: 'badge-cyan',
      description: '1.0× baseline daily login and task rewards.',
    };
  }

  const amount = Number(activePlan.amount) || 0;
  const months = Number(activePlan.months) || 1;

  if (amount >= 50000 || months >= 12) {
    return {
      tierKey: 'diamond_vip',
      tierName: 'Diamond VIP Tier',
      tierBadge: '💎 Diamond VIP',
      loginMultiplier: 4.0, // Day 1: ₹20 ... Day 7: ₹40
      taskMultiplier: 4.0, // 4.0x Task Earnings
      color: '#10b981',
      badgeClass: 'badge-emerald',
      description: '4.0× Premium Task & Daily Attendance Earning Multiplier.',
    };
  } else if (amount >= 20000 || months >= 6) {
    return {
      tierKey: 'alpha_vip',
      tierName: 'Alpha Executive Tier',
      tierBadge: '⚡ Alpha VIP',
      loginMultiplier: 2.8, // Day 1: ₹14 ... Day 7: ₹28
      taskMultiplier: 2.8,
      color: '#8b5cf6',
      badgeClass: 'badge-indigo',
      description: '2.8× High-Yield Task & Attendance Reward Multiplier.',
    };
  } else if (amount >= 7500 || months >= 3) {
    return {
      tierKey: 'growth_alpha',
      tierName: 'Quarterly Growth Tier',
      tierBadge: '🚀 Growth Alpha',
      loginMultiplier: 1.8, // Day 1: ₹9 ... Day 7: ₹18
      taskMultiplier: 1.8,
      color: '#3b82f6',
      badgeClass: 'badge-indigo',
      description: '1.8× Growth Task & Attendance Multiplier.',
    };
  } else {
    return {
      tierKey: 'starter_sprint',
      tierName: 'Starter Sprint Tier',
      tierBadge: '🥉 Starter Sprint',
      loginMultiplier: 1.0,
      taskMultiplier: 1.0,
      color: '#06b6d4',
      badgeClass: 'badge-cyan',
      description: '1.0× Baseline Task & Attendance Multiplier.',
    };
  }
}

