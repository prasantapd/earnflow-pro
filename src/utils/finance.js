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

export const TRIAL_PLAN = {
  id: 'trial_3d',
  months: 0.1,
  days: 3,
  label: '3 Days Trial',
  badge: '⚡ Special 3-Day Trial',
  amount: 300,
  tierFactor: 0.055,
  description: '3-Day introductory trial pass (Once per mobile number). Full ₹2,000 plan task earnings & login rewards + flexible 1-time lifetime withdrawal with ZERO minimum threshold!',
  color: '#ec4899',
};

export const DEFAULT_PLAN_MULTIPLIERS = {
  300: 1.0,     // 3-Day Trial Pass: strictly 1.0x (same as ₹2,000 plan)
  2000: 1.0,    // Base Anchor Plan: strictly 1.0x (all tasks & login streak authored at this rate)
  3500: 1.75,   // Starter Sprint
  5000: 2.5,    // Growth Tier
  7500: 3.75,   // Momentum Tier
  10000: 5.0,   // Alpha Executive (admin can change to 5.5x, 6.0x, etc.)
  25000: 12.5,  // Elite VIP
  50000: 25.0,  // Diamond VIP
};

/**
 * Calculates Estimated Income based on deposit tier and lock-in duration.
 * Strictly outputs estimated monetary income without percentage return claims.
 */
export function calculateEarnings(principal, months, factor, days = null, customMultiplier = null) {
  const p = Number(principal) || 2000;
  const isTrial = p === 300 || days === 3;
  
  // If months is passed as a custom multiplier (e.g. calculateEarnings(10000, 5.5))
  let m = Number(months) || (isTrial ? 0.1 : 1);
  let effectiveCustomMult = customMultiplier;
  if (factor === undefined && typeof months === 'number' && (months > 1.2 || months === 5.5 || months === 6.0)) {
    effectiveCustomMult = months;
    m = 1;
  }

  const f = Number(factor) || (m === 1 ? 0.055 : m === 3 ? 0.060 : m === 6 ? 0.065 : 0.070);

  // If a custom multiplier is given (e.g. 5.5x or 6.0x for 10000 vs baseline 5.0x),
  // boost proportional gain accordingly
  let boostFactor = 1.0;
  if (!isTrial && effectiveCustomMult && effectiveCustomMult > 0 && p >= 2000) {
    const baselineMult = p / 2000;
    if (baselineMult > 0) {
      boostFactor = effectiveCustomMult / baselineMult;
    }
  }

  const totalGainMultiplier = Math.pow(1 + f, m) - 1;
  const estimatedTotalIncome = isTrial ? 11 : Math.round(p * totalGainMultiplier * boostFactor);
  const estimatedMaturityValue = p + estimatedTotalIncome;
  const totalDays = days || (isTrial ? 3 : m * 30);
  const estimatedDailyIncome = +(estimatedTotalIncome / totalDays).toFixed(2);
  const estimatedMonthlyIncome = +(estimatedDailyIncome * 30).toFixed(2);
  const estimatedWeeklyIncome = +(estimatedDailyIncome * 7).toFixed(2);

  const calculatedMult = effectiveCustomMult || (isTrial ? 1.0 : +(p / 2000).toFixed(2));
  // Standard member task capacity is 10 tasks/day * (₹10 * mult) = 100 * mult
  const dailyTaskEarnings = +(100 * Number(calculatedMult)).toFixed(2);
  const monthlyTaskEarnings = +(dailyTaskEarnings * 30).toFixed(2);

  return {
    principal: p,
    months: m,
    multiplier: Number(calculatedMult) || 1.0,
    daily: dailyTaskEarnings,
    monthly: monthlyTaskEarnings,
    tasksPerDay: 10,
    perTask: +(dailyTaskEarnings / 10).toFixed(2),
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
    isTrial,
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

export function formatCompactINR(val) {
  const num = Number(val) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${num}`;
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
    isOpen: isSunday,
    isSunday,
    nextSunday,
    nextSundayDate: nextSunday,
    windowStart: 'Sunday 00:00 IST',
    windowEnd: 'Sunday 23:59 IST',
    hours,
    minutes,
    seconds,
    daysUntilSunday,
    formattedCountdown: `${hours}h ${minutes}m ${seconds}s`,
    timeRemaining: `${hours}h ${minutes}m ${seconds}s`,
  };
}

/**
 * Validates withdrawal eligibility against Sunday window, trial exemption, and minimum threshold.
 */
export function canUserWithdrawToday({
  isTrialMember = false,
  trialWithdrawalClaimed = false,
  balance = 0,
  hasNeverDeposited = false,
  overrideSundayCheck = false,
} = {}) {
  const sundayInfo = getNextSundayStatus();
  const isDayAllowed = overrideSundayCheck || sundayInfo.isSunday;

  if (!isDayAllowed) {
    return {
      allowed: false,
      reason: 'Withdrawals are open exclusively on Sundays (00:00 - 23:59 IST).',
      sundayInfo,
    };
  }

  if (hasNeverDeposited) {
    return {
      allowed: false,
      reason: 'Withdrawal Locked: Free registration allows 2 days of earning, but withdrawal requires activating the ₹300 Trial Pass or a Membership Plan.',
    };
  }

  if (isTrialMember) {
    if (trialWithdrawalClaimed) {
      return {
        allowed: false,
        reason: 'Trial Pass withdrawal can be used only once in a lifetime.',
      };
    }
    return {
      allowed: balance > 0,
      isTrialExemption: true,
      minRequired: 0,
      reason: balance > 0 ? 'Eligible for instant withdrawal (Zero Minimum Requirement)' : 'Insufficient wallet balance',
    };
  }

  const minRequired = 500;
  if (balance < minRequired) {
    return {
      allowed: false,
      minRequired,
      reason: `Minimum withdrawal amount is ${formatINR(minRequired)}. Your current balance is ${formatINR(balance)}.`,
    };
  }

  return {
    allowed: true,
    minRequired,
    reason: 'Eligible for withdrawal',
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
 * based on the user's active membership plan deposit amount / tier, or 2-day free registration pass.
 * Fully supports dynamic Admin-configured multipliers per plan tier!
 */
export function getMembershipTier(activePlan, freeTrialStatus = null, planMultipliers = null) {
  const multipliers = { ...DEFAULT_PLAN_MULTIPLIERS, ...(planMultipliers || {}) };
  // Crucial rule: Base anchor (₹2,000) and 3-Day Trial (₹300) are strictly 1.0x (anchor for tasks and streak)
  multipliers[2000] = 1.0;
  multipliers[300] = 1.0;

  // Check if trial pass passed via trial status
  const isTrialActiveFromStatus = Boolean(
    freeTrialStatus && (freeTrialStatus.isTrialActive || (freeTrialStatus.trialPlan && (freeTrialStatus.trialPlan.price === 300 || freeTrialStatus.trialPlan.amount === 300)))
  );
  if (isTrialActiveFromStatus) {
    return {
      tierKey: 'trial_300',
      tierName: '⚡ 3-Day Trial Member (₹300)',
      name: '⚡ 3-Day Trial Pass Member',
      tierBadge: '⚡ 3-Day Trial (₹300)',
      depositAmount: 300,
      multiplier: 1.0,
      loginMultiplier: 1.0, // EXACT SAME AS ₹2,000 PLAN
      taskMultiplier: 1.0,  // EXACT SAME AS ₹2,000 PLAN
      color: '#ec4899',
      badgeClass: 'badge-pink',
      isTrial: true,
      description: '3-Day Trial Member: Full ₹2,000 base rate rewards active (1.0× multiplier). Flexible 1-time lifetime withdrawal with ZERO minimum requirement!',
    };
  }

  // 1. Active Paid Plan (or active trial pass)
  if (activePlan && activePlan.status !== 'inactive' && activePlan.status !== 'expired') {
    const amount = Number(activePlan.amount ?? activePlan.price) || 2000;
    const isTrial = Boolean(activePlan.isTrial || amount === 300 || (activePlan.id && String(activePlan.id).includes('trial')));

    if (isTrial) {
      return {
        tierKey: 'trial_300',
        tierName: '⚡ 3-Day Trial Member (₹300)',
        name: '⚡ 3-Day Trial Pass Member',
        tierBadge: '⚡ 3-Day Trial (₹300)',
        depositAmount: 300,
        multiplier: 1.0,
        loginMultiplier: 1.0, // EXACT SAME AS ₹2,000 PLAN
        taskMultiplier: 1.0,  // EXACT SAME AS ₹2,000 PLAN
        color: '#ec4899',
        badgeClass: 'badge-pink',
        isTrial: true,
        description: '3-Day Trial Member: Full ₹2,000 base rate rewards active (1.0× multiplier). Flexible 1-time lifetime withdrawal with ZERO minimum requirement!',
      };
    }

    // Dynamic Multiplier determined by Admin configuration
    let customMult = multipliers[amount];
    if (customMult === undefined) {
      // Find closest lower preset or compute default proportional
      const presets = Object.keys(multipliers).map(Number).sort((a, b) => b - a);
      const match = presets.find(pr => amount >= pr);
      if (match && match >= 2000) {
        customMult = multipliers[match];
      } else {
        customMult = +(amount / 2000).toFixed(2);
      }
    }
    const finalMultiplier = Math.max(1.0, Number(customMult) || 1.0);

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
    } else if (amount >= 7500) {
      tierKey = 'momentum_7500';
      tierBadge = '🔥 Momentum Tier (₹7.5k)';
      badgeClass = 'badge-gold';
      color = '#f59e0b';
    } else if (amount >= 5000) {
      tierKey = 'growth_5000';
      tierBadge = '🚀 Growth Tier (₹5k)';
      badgeClass = 'badge-cyan';
      color = '#38bdf8';
    } else if (amount >= 3500) {
      tierKey = 'sprint_3500';
      tierBadge = '⚡ Starter Sprint (₹3.5k)';
      badgeClass = 'badge-cyan';
      color = '#06b6d4';
    }

    return {
      tierKey,
      tierName: `${tierBadge} • ${finalMultiplier}× Multiplier`,
      name: `${tierBadge} • ${finalMultiplier}× Multiplier`,
      tierBadge,
      depositAmount: amount,
      multiplier: finalMultiplier,
      loginMultiplier: finalMultiplier,
      taskMultiplier: finalMultiplier,
      color,
      badgeClass,
      description: `${finalMultiplier}× Multiplier configured by Admin based on ₹${amount.toLocaleString()} active deposit (Base: ₹2,000 = 1.0×).`,
    };
  }

  // 2. First-Time Registration Free Trial (Day 1 & Day 2)
  if (freeTrialStatus && freeTrialStatus.canEarn) {
    return {
      tierKey: 'free_trial_2d',
      tierName: `🎁 New User Pass (Day ${freeTrialStatus.dayNumber || 1} of 2)`,
      name: `🎁 New User Pass (Day ${freeTrialStatus.dayNumber || 1} of 2)`,
      tierBadge: `🎁 Free Pass (Day ${freeTrialStatus.dayNumber || 1}/2)`,
      depositAmount: 0,
      multiplier: 1.0,
      loginMultiplier: 1.0, // EXACT SAME AS ₹2,000 PLAN
      taskMultiplier: 1.0,  // EXACT SAME AS ₹2,000 PLAN
      color: '#f59e0b',
      badgeClass: 'badge-gold',
      isFreeTrial: true,
      description: `Welcome Pass: Complete daily tasks & claim login bonuses for 2 consecutive days. (Withdrawal requires ₹300 Trial or Membership Plan).`,
    };
  }

  // 3. Free Visitor (No active plan and free trial ended or guest)
  return {
    tierKey: 'starter',
    tierName: 'Free Visitor (No Plan)',
    name: 'Free Visitor (No Plan)',
    tierBadge: 'No Active Plan',
    depositAmount: 0,
    multiplier: 1.0,
    loginMultiplier: 1.0,
    taskMultiplier: 1.0,
    color: '#94a3b8',
    badgeClass: 'badge-zinc',
    description: 'Subscribe to the ₹300 3-Day Trial or a regular plan (min ₹2,000) to activate daily login streak and task rewards.',
  };
}


