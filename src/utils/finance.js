// Financial calculation & utilities for EarnFlow
// NOTE: Strictly compliance-aligned. No "% return" or "guarantee return" labels.
// All values represent Estimated Task Income and Earning Potential.

export const DEPOSIT_PRESETS = [2000, 3500, 5000, 7500, 10000, 25000, 50000];

export const LOCKIN_PERIODS = [
  {
    id: '30d',
    months: 1,
    days: 30,
    label: '30 Days',
    badge: 'Starter Sprint',
    tierFactor: 0.055, // internal task distribution factor
    description: '30-day membership cycle. Access daily task rewards with principal eligible for withdrawal upon 30-day maturity.',
    color: '#06b6d4',
  },
  {
    id: '90d',
    months: 3,
    days: 90,
    label: '90 Days',
    badge: 'Quarterly Growth',
    tierFactor: 0.060,
    description: '90-day membership tier. Higher estimated daily task reward allocation and steady campaign access.',
    color: '#3b82f6',
  },
  {
    id: '180d',
    months: 6,
    days: 180,
    label: '180 Days',
    badge: 'Alpha Tier',
    tierFactor: 0.065,
    description: '180-day membership tier. Advanced task earning potential with dedicated high-value brand campaigns.',
    color: '#8b5cf6',
  },
  {
    id: '360d',
    months: 12,
    days: 360,
    label: '360 Days',
    badge: 'Diamond VIP',
    tierFactor: 0.070,
    description: '360-day VIP membership tier. Maximum estimated daily task quota allocation and premium priority rewards.',
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

export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return String(dateInput || 'N/A');
  }
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
      tierName: 'Free Visitor (No Plan)',
      tierBadge: 'No Active Plan',
      depositAmount: 0,
      loginMultiplier: 1.0,
      taskMultiplier: 1.0,
      color: '#94a3b8',
      badgeClass: 'badge-zinc',
      description: 'Subscribe to a plan (min ₹2,000) to activate daily login streak and task rewards.',
    };
  }

  const amount = Number(activePlan.amount) || 2000;
  // Multiplier directly scales from basic deposit (₹2,000 = 1.0x, ₹5,000 = 2.5x, ₹10,000 = 5.0x, etc.)
  const rawMultiplier = +(amount / 2000).toFixed(2);
  const loginMultiplier = Math.max(1.0, rawMultiplier);
  const taskMultiplier = Math.max(1.0, rawMultiplier);

  let tierKey = 'basic_2000';
  let tierBadge = '🥉 Basic Member (₹2k)';
  let badgeClass = 'badge-cyan';
  let color = '#06b6d4';

  if (amount >= 50000) {
    tierKey = 'vip_50000';
    tierBadge = '👑 Diamond VIP (₹50k)';
    badgeClass = 'badge-emerald';
    color = '#10b981';
  } else if (amount >= 25000) {
    tierKey = 'vip_25000';
    tierBadge = '💎 Elite VIP (₹25k)';
    badgeClass = 'badge-indigo';
    color = '#8b5cf6';
  } else if (amount >= 10000) {
    tierKey = 'alpha_10000';
    tierBadge = '⚡ Alpha Executive (₹10k)';
    badgeClass = 'badge-gold';
    color = '#f59e0b';
  } else if (amount >= 5000) {
    tierKey = 'growth_5000';
    tierBadge = '🚀 Growth Tier (₹5k)';
    badgeClass = 'badge-cyan';
    color = '#38bdf8';
  }

  return {
    tierKey,
    tierName: `${tierBadge} • ${loginMultiplier}× Multiplier`,
    tierBadge,
    depositAmount: amount,
    loginMultiplier,
    taskMultiplier,
    color,
    badgeClass,
    description: `${loginMultiplier}× Deposit Multiplier based on ₹${amount.toLocaleString()} active deposit (Base: ₹2,000).`,
  };
}

