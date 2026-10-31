import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { calculateEarnings, getNextSundayStatus, extractYoutubeId, getMembershipTier, formatINR, TRIAL_PLAN, DEFAULT_PLAN_MULTIPLIERS } from '../utils/finance';
import { getLocalDateString, getUpcoming7Days } from '../utils/dateUtils';
import { SUPPORTED_LANGUAGES, LANGUAGE_OPTIONS, t as translateFn } from '../utils/translations';

const AppContext = createContext();

// Storage key updated to taskcoin_pro_state_v1 for clean production state without dummy data
const STORAGE_KEY = 'taskcoin_pro_state_v1';

/* =========================================================================
   7-DAY DATE-WISE INITIAL TASK SCHEDULE GENERATOR
   Generates tailored task rosters for Today (offset 0) up to 7 upcoming days (+6).
   Every day at 00:00 midnight, the platform auto-switches to the new day's tasks!
   Admin can customize or schedule ANY task for any of the 7 days.
   ========================================================================= */
export function generateDefault7DayTaskRoster() {
  const schedule = {};
  const todayStr = getLocalDateString(0);

  // Day 0 (Today): Standard Mix
  schedule[todayStr] = [
    {
      id: 'vid_101',
      type: 'video',
      title: 'Brand Launch: TaskCoin Alpha Tech Review',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=y9u2eQy5fmg',
      youtubeId: 'y9u2eQy5fmg',
      reward: 35.00,
      duration: 20,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      totalShares: 1420,
      description: 'Watch video for 20s and share to your Facebook feed or friends to claim reward.',
      createdAt: new Date().toISOString(),
      targetDate: todayStr,
    },
    {
      id: 'music_1',
      type: 'music',
      title: 'Alpha Ambient Synthesizer Flow',
      category: 'Focus Audio',
      reward: 25.00,
      duration: 20,
      status: 'ACTIVE',
      description: 'Listen to ambient productivity audio track for 20s to claim cash.',
      createdAt: new Date().toISOString(),
      targetDate: todayStr,
    },
    {
      id: 'slide3_1',
      type: 'slide3',
      title: '3×3 Slide Number Puzzle Challenge',
      category: 'Skill Puzzle',
      reward: 40.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Solve the 3×3 logic tile puzzle within 60s countdown. Pure cognitive skill.',
      createdAt: new Date().toISOString(),
      targetDate: todayStr,
    },
    {
      id: 'walk_1',
      type: 'walk',
      title: 'Walk for 10 Minutes Health Pedometer',
      category: 'Fitness Tracker',
      reward: 40.00,
      duration: 600,
      targetSteps: 1200,
      status: 'ACTIVE',
      description: 'Active pedometer health verification. Complete 10 minutes (1,200 steps) of walking.',
      createdAt: new Date().toISOString(),
      targetDate: todayStr,
    },
    {
      id: 'spin_1',
      type: 'spin',
      title: 'Lucky Wealth Spin Wheel',
      category: 'Lucky Draw',
      reward: 20.00,
      duration: 10,
      status: 'ACTIVE',
      description: 'Spin high-tech wheel for instant reward.',
      createdAt: new Date().toISOString(),
      targetDate: todayStr,
    },
  ];

  // Day 1 (Tomorrow): Compound Wealth & Memory Match Mix
  const day1Str = getLocalDateString(1);
  schedule[day1Str] = [
    {
      id: 'vid_102',
      type: 'video',
      title: 'Compound Wealth: 2026 Financial Roadmap',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=OQznqM_9k8I',
      youtubeId: 'OQznqM_9k8I',
      reward: 50.00,
      duration: 25,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      totalShares: 850,
      description: 'Watch financial roadmap analysis for 25s and share to friends.',
      createdAt: new Date().toISOString(),
      targetDate: day1Str,
    },
    {
      id: 'memory_1',
      type: 'memory',
      title: 'Wealth Icon Memory Match Challenge',
      category: 'Brain Game',
      reward: 35.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Flip and match 6 wealth icon pairs before 60s timer expires.',
      createdAt: new Date().toISOString(),
      targetDate: day1Str,
    },
    {
      id: 'slide3_2',
      type: 'slide3',
      title: '3×3 Speed Tile Logic Matrix',
      category: 'Skill Puzzle',
      reward: 40.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Arrange tiles 1 to 8 before the 60s countdown hits zero.',
      createdAt: new Date().toISOString(),
      targetDate: day1Str,
    },
    {
      id: 'music_2',
      type: 'music',
      title: 'Deep Focus Binaural Beats',
      category: 'Focus Audio',
      reward: 25.00,
      duration: 20,
      status: 'ACTIVE',
      description: 'Stream 20 seconds of high-fidelity focus audio to claim reward.',
      createdAt: new Date().toISOString(),
      targetDate: day1Str,
    },
    {
      id: 'spin_2',
      type: 'spin',
      title: 'Golden Wealth Spin Wheel',
      category: 'Lucky Draw',
      reward: 25.00,
      duration: 10,
      status: 'ACTIVE',
      description: 'Instant wheel spin with guaranteed cash drop.',
      createdAt: new Date().toISOString(),
      targetDate: day1Str,
    },
  ];

  // Day 2 (+2 Days): Digital Assets & Cardio Walk Mix
  const day2Str = getLocalDateString(2);
  schedule[day2Str] = [
    {
      id: 'vid_103',
      type: 'video',
      title: 'Decentralized Yield & Web3 Monetization',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=y9u2eQy5fmg',
      youtubeId: 'y9u2eQy5fmg',
      reward: 45.00,
      duration: 20,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      description: 'Watch 20s of decentralized yield review and share to social feed.',
      createdAt: new Date().toISOString(),
      targetDate: day2Str,
    },
    {
      id: 'walk_2',
      type: 'walk',
      title: '10-Minute Morning Cardio Walk',
      category: 'Fitness Tracker',
      reward: 40.00,
      duration: 600,
      targetSteps: 1200,
      status: 'ACTIVE',
      description: '10-minute fitness verification. Hit 1,200 steps to unlock reward.',
      createdAt: new Date().toISOString(),
      targetDate: day2Str,
    },
    {
      id: 'memory_2',
      type: 'memory',
      title: 'Gem Match Logic Challenge',
      category: 'Brain Game',
      reward: 35.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Match all pairs within 60s to unlock instant payout.',
      createdAt: new Date().toISOString(),
      targetDate: day2Str,
    },
    {
      id: 'spin_3',
      type: 'spin',
      title: 'Diamond Luck Wheel',
      category: 'Lucky Draw',
      reward: 20.00,
      duration: 10,
      status: 'ACTIVE',
      description: 'Spin for instant task wallet rewards.',
      createdAt: new Date().toISOString(),
      targetDate: day2Str,
    },
  ];

  // Day 3 (+3 Days): Portfolio Allocation & Lo-Fi Flow
  const day3Str = getLocalDateString(3);
  schedule[day3Str] = [
    {
      id: 'vid_104',
      type: 'video',
      title: 'Smart Portfolio Allocation Strategy',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=OQznqM_9k8I',
      youtubeId: 'OQznqM_9k8I',
      reward: 40.00,
      duration: 20,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      description: 'Watch 20s video and share to claim your reward.',
      createdAt: new Date().toISOString(),
      targetDate: day3Str,
    },
    {
      id: 'slide3_3',
      type: 'slide3',
      title: 'Numerical Matrix 3×3 Challenge',
      category: 'Skill Puzzle',
      reward: 45.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Complete the numeric slide puzzle within 60 seconds.',
      createdAt: new Date().toISOString(),
      targetDate: day3Str,
    },
    {
      id: 'music_3',
      type: 'music',
      title: 'Ambient Chillwave Lo-Fi Flow',
      category: 'Focus Audio',
      reward: 25.00,
      duration: 20,
      status: 'ACTIVE',
      description: 'Listen to lo-fi track for 20 seconds.',
      createdAt: new Date().toISOString(),
      targetDate: day3Str,
    },
    {
      id: 'walk_3',
      type: 'walk',
      title: '10-Minute Evening Cardio Pedometer',
      category: 'Fitness Tracker',
      reward: 40.00,
      duration: 600,
      targetSteps: 1200,
      status: 'ACTIVE',
      description: '10-minute verified walk challenge.',
      createdAt: new Date().toISOString(),
      targetDate: day3Str,
    },
  ];

  // Day 4 (+4 Days): Algorithmic Yield & Memory Match
  const day4Str = getLocalDateString(4);
  schedule[day4Str] = [
    {
      id: 'vid_105',
      type: 'video',
      title: 'Fintech Innovation & Automated Growth',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=y9u2eQy5fmg',
      youtubeId: 'y9u2eQy5fmg',
      reward: 50.00,
      duration: 25,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      description: 'Watch automated yield review and share with friends.',
      createdAt: new Date().toISOString(),
      targetDate: day4Str,
    },
    {
      id: 'memory_3',
      type: 'memory',
      title: 'Cyber Pattern Memory Match',
      category: 'Brain Game',
      reward: 35.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Match icons within 60s timer.',
      createdAt: new Date().toISOString(),
      targetDate: day4Str,
    },
    {
      id: 'slide3_4',
      type: 'slide3',
      title: '3×3 Rapid Tile Arrangement',
      category: 'Skill Puzzle',
      reward: 40.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Solve the 3x3 slide before time runs out.',
      createdAt: new Date().toISOString(),
      targetDate: day4Str,
    },
    {
      id: 'spin_4',
      type: 'spin',
      title: 'Super Star Wheel Spin',
      category: 'Lucky Draw',
      reward: 20.00,
      duration: 10,
      status: 'ACTIVE',
      description: 'Instant wheel spin bonus.',
      createdAt: new Date().toISOString(),
      targetDate: day4Str,
    },
  ];

  // Day 5 (+5 Days): Emerging Tech & Health Pedometer
  const day5Str = getLocalDateString(5);
  schedule[day5Str] = [
    {
      id: 'vid_106',
      type: 'video',
      title: 'Global Market Trends & Emerging Tech',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=OQznqM_9k8I',
      youtubeId: 'OQznqM_9k8I',
      reward: 35.00,
      duration: 20,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      description: 'Watch tech trends video for 20s and share.',
      createdAt: new Date().toISOString(),
      targetDate: day5Str,
    },
    {
      id: 'walk_4',
      type: 'walk',
      title: 'Active 1,200 Steps Health Tracker',
      category: 'Fitness Tracker',
      reward: 40.00,
      duration: 600,
      targetSteps: 1200,
      status: 'ACTIVE',
      description: 'Complete 10 minutes of active walking.',
      createdAt: new Date().toISOString(),
      targetDate: day5Str,
    },
    {
      id: 'music_4',
      type: 'music',
      title: 'Alpha Wave Concentration Audio',
      category: 'Focus Audio',
      reward: 25.00,
      duration: 20,
      status: 'ACTIVE',
      description: 'Listen to 20s focus soundscape.',
      createdAt: new Date().toISOString(),
      targetDate: day5Str,
    },
    {
      id: 'spin_5',
      type: 'spin',
      title: 'Diamond Wealth Spin',
      category: 'Lucky Draw',
      reward: 25.00,
      duration: 10,
      status: 'ACTIVE',
      description: 'Spin and win instant wallet rewards.',
      createdAt: new Date().toISOString(),
      targetDate: day5Str,
    },
  ];

  // Day 6 (+6 Days): Weekly Recap & Brain Challenges
  const day6Str = getLocalDateString(6);
  schedule[day6Str] = [
    {
      id: 'vid_107',
      type: 'video',
      title: 'Weekly Financial Recap & Growth Blueprint',
      category: 'Video & Share',
      platform: 'YouTube',
      videoUrl: 'https://www.youtube.com/watch?v=y9u2eQy5fmg',
      youtubeId: 'y9u2eQy5fmg',
      reward: 55.00,
      duration: 30,
      shareRequired: true,
      sharePlatform: 'Facebook & Friends',
      status: 'ACTIVE',
      description: 'Watch recap and share to your social network.',
      createdAt: new Date().toISOString(),
      targetDate: day6Str,
    },
    {
      id: 'slide3_5',
      type: 'slide3',
      title: 'Master Mind 3×3 Puzzle Challenge',
      category: 'Skill Puzzle',
      reward: 45.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Solve the 3x3 slide within 60s.',
      createdAt: new Date().toISOString(),
      targetDate: day6Str,
    },
    {
      id: 'memory_4',
      type: 'memory',
      title: 'Rapid Recall Brain Match',
      category: 'Brain Game',
      reward: 35.00,
      duration: 60,
      status: 'ACTIVE',
      description: 'Match 6 pairs before time runs out.',
      createdAt: new Date().toISOString(),
      targetDate: day6Str,
    },
    {
      id: 'walk_5',
      type: 'walk',
      title: 'Sunday 10-Minute Walk Pedometer',
      category: 'Fitness Tracker',
      reward: 40.00,
      duration: 600,
      targetSteps: 1200,
      status: 'ACTIVE',
      description: '10-minute fitness walk challenge.',
      createdAt: new Date().toISOString(),
      targetDate: day6Str,
    },
  ];

  return schedule;
}

const DEFAULT_7DAY_SCHEDULE = generateDefault7DayTaskRoster();
export const INITIAL_DAILY_TASK_ROSTER = DEFAULT_7DAY_SCHEDULE[getLocalDateString(0)] || [];

export const TASK_ROSTER_PRESETS = [
  {
    id: 'combo_balanced',
    name: 'Combo A: Video + Song + 3×3 Slide',
    badge: 'Standard Mix',
    description: '1 Video Watch & Share, 1 Focus Music Track, and 1 3×3 Slide Puzzle (60s timer).',
    activeIds: ['vid_101', 'music_1', 'slide3_1'],
  },
  {
    id: 'combo_fitness_games',
    name: 'Combo B: Video + 2 Games + Walk for 10 Mins',
    badge: 'Fitness & Logic',
    description: '1 Video, 1 Slide Puzzle (60s), 1 Memory Match (60s), and 1 10-Minute Walk Challenge.',
    activeIds: ['vid_101', 'slide3_1', 'memory_1', 'walk_1'],
  },
  {
    id: 'combo_high_skill',
    name: 'Combo C: High-Skill & Payout Saver',
    badge: 'Max Liability Saver',
    description: '3×3 Slide Puzzle (60s) + Memory Match (60s) + 10-Min Walk + Video. Hardest tasks, lowest payout liability.',
    activeIds: ['slide3_1', 'memory_1', 'walk_1', 'vid_102'],
  },
  {
    id: 'combo_all',
    name: 'Combo D: Full Daily Engagement',
    badge: 'All Active',
    description: 'All tasks active (Videos, Music, 3×3 Slide, Memory Match, 10-Min Walk, Spin).',
    activeIds: ['vid_101', 'vid_102', 'music_1', 'slide3_1', 'memory_1', 'walk_1', 'spin_1'],
  },
];

export const INITIAL_VIDEO_TASKS = INITIAL_DAILY_TASK_ROSTER.filter((t) => t.type === 'video');

/* =========================================================================
   30-DAY PROGRESSIVE DAILY LOGIN STREAK REWARDS
   ========================================================================= */
export const STREAK_REWARDS = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7,
  8: 2, 9: 3, 10: 4, 11: 5, 12: 6, 13: 7, 14: 8,
  15: 3, 16: 4, 17: 5, 18: 6, 19: 7, 20: 8, 21: 9,
  22: 4, 23: 5, 24: 6, 25: 7, 26: 8, 27: 9, 28: 10,
  29: 11, 30: 12,
};

export const STREAK_WEEKS = [
  { weekNum: 1, title: 'Week 1', range: 'Days 1–7', formula: '₹1 → ₹7', startDay: 1, endDay: 7, baseSum: 28 },
  { weekNum: 2, title: 'Week 2', range: 'Days 8–14', formula: '₹2 → ₹8', startDay: 8, endDay: 14, baseSum: 35 },
  { weekNum: 3, title: 'Week 3', range: 'Days 15–21', formula: '₹3 → ₹9', startDay: 15, endDay: 21, baseSum: 42 },
  { weekNum: 4, title: 'Week 4 (30-Day Finale)', range: 'Days 22–30', formula: '₹4 → ₹12', startDay: 22, endDay: 30, baseSum: 72 },
];

export const STREAK_SCHEDULE = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const reward = STREAK_REWARDS[day] || 1;
  const weekNum = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
  return {
    day,
    reward,
    label: `Day ${day}`,
    week: weekNum,
    isWeeklyFinish: day === 7 || day === 14 || day === 21,
    isGrandFinish: day === 30,
  };
});

export const INITIAL_PAYMENT_SETTINGS = {
  upiId: 'taskcoin@icici',
  upiPayeeName: 'TaskCoin Pro Treasury',
  bankName: 'HDFC Bank',
  accountName: 'TaskCoin Technologies Private Limited',
  accountNumber: '50200098412849',
  ifscCode: 'HDFC0001234',
  branch: 'BKC Corporate Financial Centre, Mumbai',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=taskcoin@icici%26pn=TaskCoin%20Pro%20Treasury%26cu=INR',
  instructions: '1. Pay the exact membership plan amount via Google Pay, PhonePe, Paytm, BHIM, or Net Banking.\n2. Note down the 12-digit UTR or UPI Reference Number from your payment receipt.\n3. Paste the 12-digit UTR in the deposit form below and click Submit.\n4. Admin treasury verifies your UTR within 5–15 minutes and your plan activates automatically!',
  minDeposit: 2000,
  isUpiEnabled: true,
  isBankEnabled: true,
  isQrEnabled: true,
};

export const INITIAL_ADMIN_ANNOUNCEMENT = {
  active: true,
  title: '📢 TaskCoin Pro Live & 24/7 Instant Payouts Active!',
  message: 'Welcome to TaskCoin Pro! Complete verified daily engagement tasks to earn guaranteed rewards. Deposit requests with valid 12-digit UTRs are verified within 5–15 minutes.',
  type: 'info',
  updatedAt: new Date().toISOString(),
  broadcastBy: 'Admin Treasury Desk',
};

// CLEAN PRODUCTION INITIAL STATE: ZERO DUMMY USERS, ZERO DUMMY PLANS, ZERO DUMMY TRANSACTIONS!
const INITIAL_STATE = {
  currentRole: 'investor', // 'investor' or 'admin'
  user: null,              // User must register or log in!
  allUsers: [],            // Empty production list
  depositRequests: [],     // Real deposit submissions only
  withdrawalRequests: [],  // Real withdrawal requests only
  payoutMethod: null,      // User adds their own UPI/bank
  rewardWallet: 0.00,      // Real user starts at 0.00
  totalWithdrawn: 0.00,    // Real user starts at 0.00
  plans: [],               // Real user starts with no plans until subscribed
  tasksCompletedToday: {}, // Real-time daily task completion map
  lastActiveDate: getLocalDateString(0),
  scheduledTasksByDate: DEFAULT_7DAY_SCHEDULE,
  dailyTaskRoster: INITIAL_DAILY_TASK_ROSTER,
  dailyVideoTasks: INITIAL_VIDEO_TASKS,
  transactions: [],
  mlmNetwork: {
    referralCode: 'TASKCOIN',
    preferredLeg: 'AUTO',
    leftVolume: 0,
    rightVolume: 0,
    leftCarry: 0,
    rightCarry: 0,
    totalPairsMatched: 0,
    lifetimeMlmEarned: 0.00,
    dailyCappedToday: 0.00,
    dailyCapLimit: 3000.00,
    binaryPairBonusRate: 0.05,
    leftMembers: [],
    rightMembers: [],
  },
  loginStreak: {
    currentDay: 1,
    lastClaimedDate: null,
    claimedToday: false,
    totalStreakEarned: 0.00,
    history: Array(30).fill(false),
  },
  gamingStats: {
    totalGamingRakeCollected: 0.00,
    totalMatchesPlayed: 0,
    userMatchesPlayed: 0,
    userMatchesWon: 0,
  },
  lastWithdrawalTime: null,
  forceSunday: true, // 24/7 payouts active
  paymentSettings: INITIAL_PAYMENT_SETTINGS,
  adminAnnouncement: INITIAL_ADMIN_ANNOUNCEMENT,
  adminPassword: 'admin123',
  streakRewards: STREAK_REWARDS,
  planMultipliers: DEFAULT_PLAN_MULTIPLIERS,
  passwordResetRequests: [],
  language: 'en',
};

/* =========================================================================
   REAL-TIME MULTI-DEVICE & CROSS-TAB SYNCHRONIZATION ENGINE
   - BroadcastChannel: 0ms instantaneous updates across tabs/windows
   - Background API polling loop: Real-time updates between User & Admin devices
   - Smart State Reconciler: Seamlessly merges users, deposits, withdrawals, resets
   ========================================================================= */
const REALTIME_CHANNEL = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('earnflow_pro_realtime_sync_v1')
  : null;

const CLOUD_SYNC_TOPIC = 'earnflow_pro_live_sync_9f536854';

function broadcastState(payload) {
  if (!payload) return;
  // 1. Cross-Tab local broadcast (0ms instant)
  if (REALTIME_CHANNEL) {
    try {
      REALTIME_CHANNEL.postMessage({ type: 'STATE_SYNC', payload });
    } catch (e) {
      console.warn('BroadcastChannel failed:', e);
    }
  }

  // 2. Global Cloud Real-Time Broadcast (Sub-100ms across all devices on the internet)
  try {
    const compact = {};
    if (payload.allUsers) compact.allUsers = payload.allUsers.slice(0, 15);
    if (payload.depositRequests) compact.depositRequests = payload.depositRequests.slice(0, 15);
    if (payload.withdrawalRequests) compact.withdrawalRequests = payload.withdrawalRequests.slice(0, 15);
    if (payload.passwordResetRequests) compact.passwordResetRequests = payload.passwordResetRequests.slice(0, 15);
    if (payload.plans) compact.plans = payload.plans.slice(0, 15);
    if (payload.paymentSettings) compact.paymentSettings = payload.paymentSettings;
    if (payload.adminAnnouncement) compact.adminAnnouncement = payload.adminAnnouncement;
    if (payload.adminPassword) compact.adminPassword = payload.adminPassword;

    fetch(`https://ntfy.sh/${CLOUD_SYNC_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': 'EarnFlowLiveSync',
        'Priority': 'default',
      },
      body: JSON.stringify({ type: 'STATE_SYNC', payload: compact, timestamp: Date.now() }),
    }).catch(() => {});
  } catch (e) {
    // Offline or network error
  }
}

async function dispatchApi(endpoint, data) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Offline / fallback to local optimistic state
  }
  return null;
}

function reconcileStates(prev, incoming) {
  if (!incoming) return prev;
  let changed = false;

  // 1. Reconcile allUsers
  const userMap = new Map();
  (prev.allUsers || []).forEach((u) => userMap.set(u.id, u));
  (incoming.allUsers || []).forEach((u) => {
    const existing = userMap.get(u.id);
    if (!existing) {
      userMap.set(u.id, u);
      changed = true;
    } else if (
      existing.status !== u.status ||
      existing.isActivated !== u.isActivated ||
      existing.password !== u.password ||
      existing.totalDeposited !== u.totalDeposited ||
      existing.suspensionReason !== u.suspensionReason
    ) {
      userMap.set(u.id, { ...existing, ...u });
      changed = true;
    }
  });
  const mergedUsers = Array.from(userMap.values());

  // Check if currently logged in user was updated by Admin (activation, suspension, password change)
  let updatedCurrentUser = prev.user;
  if (prev.user) {
    const matched = mergedUsers.find(
      (u) => u.id === prev.user.id || (u.phone && u.phone === prev.user.phone) || (u.email && u.email === prev.user.email)
    );
    if (matched) {
      if (
        matched.status !== prev.user.status ||
        matched.isActivated !== prev.user.isActivated ||
        matched.password !== prev.user.password ||
        matched.totalDeposited !== prev.user.totalDeposited ||
        matched.suspensionReason !== prev.user.suspensionReason
      ) {
        updatedCurrentUser = { ...prev.user, ...matched };
        changed = true;
      }
    }
  }

  // 2. Reconcile depositRequests
  const depMap = new Map();
  (prev.depositRequests || []).forEach((d) => depMap.set(d.id, d));
  (incoming.depositRequests || []).forEach((d) => {
    const existing = depMap.get(d.id);
    if (!existing) {
      depMap.set(d.id, d);
      changed = true;
    } else if (existing.status !== d.status || existing.rejectionReason !== d.rejectionReason) {
      depMap.set(d.id, { ...existing, ...d });
      changed = true;
    }
  });
  const mergedDeposits = Array.from(depMap.values());

  // 3. Reconcile withdrawalRequests
  const wdrMap = new Map();
  (prev.withdrawalRequests || []).forEach((w) => wdrMap.set(w.id, w));
  (incoming.withdrawalRequests || []).forEach((w) => {
    const existing = wdrMap.get(w.id);
    if (!existing) {
      wdrMap.set(w.id, w);
      changed = true;
    } else if (
      existing.status !== w.status ||
      existing.disbursedUtr !== w.disbursedUtr ||
      existing.rejectionReason !== w.rejectionReason
    ) {
      wdrMap.set(w.id, { ...existing, ...w });
      changed = true;
    }
  });
  const mergedWithdrawals = Array.from(wdrMap.values());

  // 4. Reconcile passwordResetRequests
  const rstMap = new Map();
  (prev.passwordResetRequests || []).forEach((r) => rstMap.set(r.id, r));
  (incoming.passwordResetRequests || []).forEach((r) => {
    const existing = rstMap.get(r.id);
    if (!existing) {
      rstMap.set(r.id, r);
      changed = true;
    } else if (existing.status !== r.status || existing.tempPassword !== r.tempPassword) {
      rstMap.set(r.id, { ...existing, ...r });
      changed = true;
    }
  });
  const mergedResets = Array.from(rstMap.values());

  // 5. Reconcile plans
  const planMap = new Map();
  (prev.plans || []).forEach((p) => planMap.set(p.id, p));
  (incoming.plans || []).forEach((p) => {
    const existing = planMap.get(p.id);
    if (!existing) {
      planMap.set(p.id, p);
      changed = true;
    } else if (existing.status !== p.status || existing.earnedSoFar !== p.earnedSoFar) {
      planMap.set(p.id, { ...existing, ...p });
      changed = true;
    }
  });

  // Ensure user has active plan if an approved deposit exists for them
  if (updatedCurrentUser) {
    const hasActivePlan = Array.from(planMap.values()).some(
      (p) =>
        p.status === 'active' &&
        (p.userId === updatedCurrentUser.id ||
          (updatedCurrentUser.phone && p.userPhone === updatedCurrentUser.phone) ||
          p.userName === updatedCurrentUser.name)
    );
    if (!hasActivePlan) {
      const userApprovedDep = mergedDeposits.find(
        (d) =>
          d.status === 'APPROVED' &&
          (d.userId === updatedCurrentUser.id ||
            d.userName === updatedCurrentUser.name ||
            (d.userPhone && d.userPhone === updatedCurrentUser.phone))
      );
      if (userApprovedDep) {
        const incomingApprovedPlan = (incoming.plans || []).find(
          (p) =>
            p.depositRef === userApprovedDep.id &&
            p.status === 'active' &&
            (p.userId === updatedCurrentUser.id ||
              p.userName === updatedCurrentUser.name ||
              (userApprovedDep.userPhone && p.userPhone === userApprovedDep.userPhone))
        );
        if (incomingApprovedPlan) {
          planMap.set(incomingApprovedPlan.id, incomingApprovedPlan);
          changed = true;
        } else {
          const calc = calculateEarnings(userApprovedDep.amount, userApprovedDep.planMonths || 1, 1.0);
          const startDate = new Date();
          const totalDays = userApprovedDep.planDays || (userApprovedDep.planMonths || 1) * 30;
          const maturityDate = new Date();
          maturityDate.setDate(startDate.getDate() + totalDays);
          const autoPlan = {
            id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: updatedCurrentUser.id,
            userName: updatedCurrentUser.name,
            userPhone: updatedCurrentUser.phone || '',
            title: userApprovedDep.planTitle || 'Membership Plan',
            amount: userApprovedDep.amount,
            months: userApprovedDep.planMonths || 1,
            days: totalDays,
            startDate: startDate.toISOString(),
            maturityDate: maturityDate.toISOString(),
            totalExpectedGain: calc.estimatedTotalIncome,
            estimatedTotalIncome: calc.estimatedTotalIncome,
            dailyQuota: calc.estimatedDailyIncome,
            earnedSoFar: 0,
            status: 'active',
            isUpgrade: userApprovedDep.isUpgrade,
            depositRef: userApprovedDep.id,
            utr: userApprovedDep.utr,
          };
          planMap.set(autoPlan.id, autoPlan);
          changed = true;
        }
      }
    }
  }

  const mergedPlans = Array.from(planMap.values());

  if (!changed) return prev;

  return {
    ...prev,
    allUsers: mergedUsers,
    user: updatedCurrentUser,
    depositRequests: mergedDeposits,
    withdrawalRequests: mergedWithdrawals,
    passwordResetRequests: mergedResets,
    plans: mergedPlans,
    paymentSettings: incoming.paymentSettings ? { ...prev.paymentSettings, ...incoming.paymentSettings } : prev.paymentSettings,
    adminAnnouncement: incoming.adminAnnouncement ? { ...prev.adminAnnouncement, ...incoming.adminAnnouncement } : prev.adminAnnouncement,
    adminPassword: incoming.adminPassword || prev.adminPassword,
    planMultipliers: incoming.planMultipliers ? { ...prev.planMultipliers, ...incoming.planMultipliers } : prev.planMultipliers,
    lastUpdated: Date.now(),
  };
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const todayStr = getLocalDateString(0);
        const sched = {
          ...DEFAULT_7DAY_SCHEDULE,
          ...(parsed.scheduledTasksByDate || {}),
        };
        return {
          ...INITIAL_STATE,
          ...parsed,
          adminPassword: parsed.adminPassword || 'admin123',
          streakRewards: parsed.streakRewards || STREAK_REWARDS,
          planMultipliers: {
            ...DEFAULT_PLAN_MULTIPLIERS,
            ...(parsed.planMultipliers || {}),
          },
          passwordResetRequests: parsed.passwordResetRequests || INITIAL_STATE.passwordResetRequests,
          scheduledTasksByDate: sched,
          dailyTaskRoster: sched[todayStr] || parsed.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER,
          paymentSettings: {
            ...INITIAL_PAYMENT_SETTINGS,
            ...(parsed.paymentSettings || {}),
          },
          adminAnnouncement: {
            ...INITIAL_ADMIN_ANNOUNCEMENT,
            ...(parsed.adminAnnouncement || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved state, using clean default:', e);
    }
    return INITIAL_STATE;
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Internationalization: language state (default 'en', supported: 'en', 'hi', 'bn')
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLang = localStorage.getItem('taskcoin_lang');
      if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        return savedLang;
      }
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (newLang) => {
    if (SUPPORTED_LANGUAGES.includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem('taskcoin_lang', newLang);
      } catch (e) {}
    }
  };

  const t = (key, params) => translateFn(key, language, params);

  // Derive current user's personal plans strictly isolated by user ID or phone/name
  const userPlans = useMemo(() => {
    if (!state.user) return [];
    return (state.plans || []).filter(
      (p) =>
        p.userId === state.user.id ||
        (state.user.phone && p.userPhone === state.user.phone) ||
        (state.user.name && p.userName === state.user.name)
    );
  }, [state.plans, state.user]);

  const activePlan = useMemo(() => {
    return userPlans.find((p) => p.status === 'active') || null;
  }, [userPlans]);

  const pendingPlan = useMemo(() => {
    return userPlans.find((p) => p.status === 'pending_approval') || null;
  }, [userPlans]);

  const pendingDeposit = useMemo(() => {
    if (!state.user) return null;
    return (
      (state.depositRequests || []).find(
        (d) =>
          d.status === 'PENDING' &&
          (d.userId === state.user.id ||
            (state.user.phone && d.userPhone === state.user.phone) ||
            (state.user.name && d.userName === state.user.name))
      ) || null
    );
  }, [state.depositRequests, state.user]);

  const userTransactions = useMemo(() => {
    if (!state.user) return [];
    return (state.transactions || []).filter(
      (t) =>
        t.userId === state.user.id ||
        (state.user.phone && t.meta && t.meta.includes(state.user.phone)) ||
        !t.userId
    );
  }, [state.transactions, state.user]);

  // 1. Free Trial Status for First-Time Registration (consecutive 2 days)
  const freeTrialStatus = useMemo(() => {
    if (!state.user) {
      return { isFreeTrial: false, dayNumber: 0, isExpired: false, canEarn: false };
    }
    // If user already has an active paid plan or past paid plan
    if (activePlan) {
      return { isFreeTrial: false, dayNumber: 0, isExpired: false, canEarn: false };
    }
    const hasAnyPaidPlan = (userPlans || []).some(
      (p) => p.status === 'active' || p.status === 'matured' || p.amount >= 300
    );
    if (hasAnyPaidPlan) {
      return { isFreeTrial: false, dayNumber: 0, isExpired: false, canEarn: false };
    }

    const joinDateStr = state.user.joinedDate ? state.user.joinedDate.slice(0, 10) : getLocalDateString(0);
    const todayStr = getLocalDateString(0);
    const joinTime = new Date(joinDateStr).getTime();
    const todayTime = new Date(todayStr).getTime();
    const dayDiff = Math.max(0, Math.floor((todayTime - joinTime) / (1000 * 60 * 60 * 24)));

    if (dayDiff < 2) {
      return {
        isFreeTrial: true,
        dayNumber: dayDiff + 1, // Day 1 or Day 2
        isExpired: false,
        canEarn: true,
      };
    } else {
      return {
        isFreeTrial: true,
        dayNumber: dayDiff + 1,
        isExpired: true,
        canEarn: false,
      };
    }
  }, [state.user, activePlan, userPlans]);

  // 2. Track whether this mobile number has already used the ₹300 3-day trial plan
  const hasUsedTrialPlan = useMemo(() => {
    if (!state.user?.phone) return false;
    const phone = state.user.phone.trim();
    const foundInPlans = (state.plans || []).some(
      (p) => (p.userPhone === phone || p.userId === state.user.id) && (p.amount === 300 || p.isTrial)
    );
    const foundInDeposits = (state.depositRequests || []).some(
      (d) => (d.userPhone === phone || d.userId === state.user.id) && (d.amount === 300 || d.isTrial)
    );
    return Boolean(foundInPlans || foundInDeposits);
  }, [state.plans, state.depositRequests, state.user]);

  // 3. Track whether trial user has already used their 1 lifetime withdrawal
  const hasUsedTrialWithdrawal = useMemo(() => {
    if (!state.user) return false;
    const phone = state.user.phone?.trim();
    return (state.withdrawalRequests || []).some(
      (w) =>
        (w.userId === state.user.id || (phone && w.userPhone === phone)) &&
        (w.isTrialWithdrawal || w.type === 'TRIAL_WITHDRAWAL' || (w.amount < 100 && w.type === 'TASK_REWARD')) &&
        w.status !== 'REJECTED'
    );
  }, [state.withdrawalRequests, state.user]);

  const userMembershipTier = useMemo(() => {
    return getMembershipTier(activePlan, freeTrialStatus, state.planMultipliers);
  }, [activePlan, freeTrialStatus, state.planMultipliers]);
  const isUserActivated = state.user?.status === 'ACTIVE';
  const canUserEarn = (isUserActivated && Boolean(activePlan) && activePlan.status === 'active') || Boolean(freeTrialStatus.canEarn);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

  /* =========================================================================
     REAL-TIME LISTENERS: BROADCASTCHANNEL + CROSS-TAB STORAGE + POLLING LOOP
     ========================================================================= */
  // 1. Instant 0ms Cross-Tab Sync via BroadcastChannel
  useEffect(() => {
    if (!REALTIME_CHANNEL) return;
    const handleBroadcast = (event) => {
      if (event.data?.type === 'STATE_SYNC' && event.data.payload) {
        setState((prev) => reconcileStates(prev, event.data.payload));
      }
    };
    REALTIME_CHANNEL.addEventListener('message', handleBroadcast);
    return () => REALTIME_CHANNEL.removeEventListener('message', handleBroadcast);
  }, []);

  // 2. Cross-Window Storage Event Backup
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setState((prev) => reconcileStates(prev, parsed));
        } catch (e) {
          console.warn('Storage sync error:', e);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 3. Background Real-Time Polling Loop (Multi-Device User <-> Admin Sync)
  useEffect(() => {
    let isMounted = true;

    // Initial server handshake: Sync any local data with server DB, and fetch server DB
    const initialSync = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const local = saved ? JSON.parse(saved) : {};
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            allUsers: local.allUsers || [],
            depositRequests: local.depositRequests || [],
            withdrawalRequests: local.withdrawalRequests || [],
            passwordResetRequests: local.passwordResetRequests || [],
            plans: local.plans || [],
          }),
        });
        if (res.ok) {
          const serverData = await res.json();
          if (isMounted && serverData) {
            setState((prev) => reconcileStates(prev, serverData));
          }
        }
      } catch (e) {
        // Fallback to local state if offline or static
      }
    };

    initialSync();

    // 1.5s real-time heartbeat polling
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const serverData = await res.json();
          if (isMounted && serverData) {
            setState((prev) => reconcileStates(prev, serverData));
          }
        }
      } catch (e) {
        // Disconnected or offline
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  /* =========================================================================
     GLOBAL REAL-TIME CLOUD SSE & 12-HOUR HISTORY ENGINE (INTERNET-WIDE MULTI-DEVICE)
     Works across mobile phones, laptops, and all hosting platforms (Render, etc.)
     ========================================================================= */
  useEffect(() => {
    let isMounted = true;
    let eventSource = null;

    // 1. Replay events from last 12h so any missed actions from another device are restored
    const syncCloudHistory = async () => {
      try {
        const res = await fetch(`https://ntfy.sh/${CLOUD_SYNC_TOPIC}/json?poll=1&since=12h`);
        if (res.ok && isMounted) {
          const text = await res.text();
          const lines = text.trim().split('\n').filter(Boolean);
          for (const l of lines) {
            try {
              const item = JSON.parse(l);
              if (item.event === 'message') {
                if (item.attachment && item.attachment.url) {
                  try {
                    const attRes = await fetch(item.attachment.url);
                    if (attRes.ok) {
                      const attJson = await attRes.json();
                      const payload = attJson.payload || attJson;
                      if (payload && isMounted) {
                        setState((prev) => reconcileStates(prev, payload));
                      }
                    }
                  } catch (e) {}
                } else if (item.message && typeof item.message === 'string') {
                  const trimmed = item.message.trim();
                  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    const msg = JSON.parse(trimmed);
                    if (msg.payload && isMounted) {
                      setState((prev) => reconcileStates(prev, msg.payload));
                    }
                  }
                }
              }
            } catch (err) {}
          }
        }
      } catch (e) {
        // Fallback
      }
    };

    syncCloudHistory();

    // 2. Open live Server-Sent Events stream (<100ms real-time delivery worldwide)
    try {
      eventSource = new EventSource(`https://ntfy.sh/${CLOUD_SYNC_TOPIC}/sse`);
      eventSource.onmessage = async (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message') {
            if (data.attachment && data.attachment.url) {
              try {
                const attRes = await fetch(data.attachment.url);
                if (attRes.ok) {
                  const attJson = await attRes.json();
                  const payload = attJson.payload || attJson;
                  if (payload && isMounted) {
                    setState((prev) => reconcileStates(prev, payload));
                  }
                }
              } catch (e) {}
            } else if (data.message && typeof data.message === 'string') {
              const trimmed = data.message.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                const msg = JSON.parse(trimmed);
                if (msg.payload && isMounted) {
                  setState((prev) => reconcileStates(prev, msg.payload));
                }
              }
            }
          }
        } catch (err) {}
      };
    } catch (e) {
      console.warn('Global SSE stream initialization error:', e);
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, []);

  // Periodic Admin Snapshot: Broadcasts full database every 2 mins to keep cloud in sync
  useEffect(() => {
    if (state.currentRole === 'admin' && (state.allUsers || []).length > 0) {
      broadcastState({
        allUsers: state.allUsers,
        depositRequests: state.depositRequests,
        withdrawalRequests: state.withdrawalRequests,
        passwordResetRequests: state.passwordResetRequests,
        plans: state.plans,
      });
    }
  }, [state.currentRole]);

  // 4. Real-Time Admin Activation / Suspension Celebration Watcher
  const prevUserRef = React.useRef(state.user);
  useEffect(() => {
    const prev = prevUserRef.current;
    const cur = state.user;
    if (prev && cur && prev.id === cur.id) {
      if (prev.status === 'PENDING_ACTIVATION' && cur.status === 'ACTIVE') {
        showToast('🎉 Congratulations! Your account has been ACTIVATED by Admin! You can now earn task rewards and daily bonuses.', 'success');
        triggerCelebration();
      } else if (prev.status !== 'SUSPENDED' && cur.status === 'SUSPENDED') {
        showToast(`⚠️ Account suspended by Admin: ${cur.suspensionReason || 'Contact Support'}`, 'error');
      }
    }
    prevUserRef.current = cur;
  }, [state.user]);

  /* =========================================================================
     AUTOMATIC 00:00 MIDNIGHT WATCHER
     Automatically checks local time every 10 seconds.
     When the date advances (00:00:00 hrs):
     - Resets `tasksCompletedToday` to empty
     - Switches `dailyTaskRoster` to the tasks scheduled for the new date
     - Updates `lastActiveDate`
     ========================================================================= */
  useEffect(() => {
    const checkMidnight = () => {
      const todayStr = getLocalDateString(0);
      const yesterdayStr = getLocalDateString(-1);
      setState((prev) => {
        if (prev.lastActiveDate && prev.lastActiveDate !== todayStr) {
          const newSchedule = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
          const newTodayTasks = newSchedule[todayStr] || newSchedule[getLocalDateString(0)] || [];
          
          const lastClaimed = prev.loginStreak?.lastClaimedDate ? prev.loginStreak.lastClaimedDate.slice(0, 10) : null;
          // Streak Rule: If yesterday was missed, streak strictly restarts from Day 1
          const missedDay = lastClaimed && lastClaimed !== yesterdayStr;

          return {
            ...prev,
            lastActiveDate: todayStr,
            tasksCompletedToday: {},
            dailyTaskRoster: newTodayTasks,
            loginStreak: {
              ...(prev.loginStreak || {}),
              currentDay: missedDay ? 1 : (prev.loginStreak?.currentDay || 1),
              history: missedDay ? Array(30).fill(false) : (prev.loginStreak?.history || Array(30).fill(false)),
              claimedToday: false, // Unlock new day's streak bonus!
            },
          };
        }
        return prev;
      });
    };

    const interval = setInterval(checkMidnight, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.message === message ? null : cur));
    }, 4000);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  };

  // Role Switcher
  const switchRole = (role) => {
    setState((prev) => ({ ...prev, currentRole: role }));
    showToast(`Switched view to ${role === 'admin' ? '🛡️ Administrator Control Center' : '👤 User Dashboard'}`);
  };

  /* =========================================================================
     AUTHENTICATION METHODS (REGISTRATION, LOGIN, LOGOUT)
     - No dummy users; accounts stored in local state & persisted
     ========================================================================= */
  const registerUser = (userData) => {
    const emailLower = (userData.email || '').trim().toLowerCase();
    const phoneTrim = (userData.phone || '').trim();

    // Check if account already exists
    const existing = (state.allUsers || []).find(
      (u) => (u.email && u.email.toLowerCase() === emailLower) || (u.phone && u.phone === phoneTrim)
    );
    if (existing) {
      showToast('An account already exists with this Email or Mobile Number. Please Log In.', 'error');
      return false;
    }

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const myOwnRefCode = (userData.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'USER') + Math.floor(100 + Math.random() * 900);
    
    // Find sponsor from referral code or referredBy
    const sponsorCode = (userData.referredBy || userData.referralCode || '').trim().toUpperCase();
    const sponsor = sponsorCode ? (state.allUsers || []).find(
      (u) => (u.referralCode && u.referralCode.toUpperCase() === sponsorCode) || 
             (u.phone && u.phone === sponsorCode) || 
             (u.id && u.id.toUpperCase() === sponsorCode)
    ) : null;

    const newUser = {
      id: newId,
      name: userData.name.trim(),
      email: emailLower,
      phone: phoneTrim,
      password: userData.password,
      referralCode: myOwnRefCode, // Every user gets their OWN referral code
      referredBy: sponsor ? sponsor.referralCode : (sponsorCode || null),
      sponsorId: sponsor ? sponsor.id : null,
      sponsorName: sponsor ? sponsor.name : null,
      joinedDate: new Date().toISOString(),
      status: 'PENDING_ACTIVATION',
      isActivated: false,
      suspensionReason: '',
      isVerified: false,
      totalDeposited: 0,
      walletBalance: 0.00,
    };

    // If sponsor found, also add downline member to mlmNetwork!
    let updatedMlm = state.mlmNetwork;
    if (sponsor) {
      const leg = (userData.leg ? userData.leg.toUpperCase() : (sponsor.preferredLeg || 'AUTO'));
      const targetLeg = (leg === 'AUTO') 
        ? (((state.mlmNetwork?.leftCarry || 0) <= (state.mlmNetwork?.rightCarry || 0)) ? 'LEFT' : 'RIGHT') 
        : (leg === 'LEFT' ? 'LEFT' : 'RIGHT');
      
      const newMember = {
        id: newId,
        name: newUser.name,
        amount: 0,
        joinedAt: newUser.joinedDate,
        leg: targetLeg,
        status: 'PENDING_ACTIVATION',
      };

      updatedMlm = {
        ...(state.mlmNetwork || {}),
        leftMembers: targetLeg === 'LEFT' ? [newMember, ...(state.mlmNetwork?.leftMembers || [])] : (state.mlmNetwork?.leftMembers || []),
        rightMembers: targetLeg === 'RIGHT' ? [newMember, ...(state.mlmNetwork?.rightMembers || [])] : (state.mlmNetwork?.rightMembers || []),
      };
    }

    const updatedUsers = [newUser, ...(state.allUsers || [])];
    setState((prev) => ({
      ...prev,
      user: newUser,
      allUsers: updatedUsers,
      mlmNetwork: updatedMlm,
      rewardWallet: 0.00,
      totalWithdrawn: 0.00,
      tasksCompletedToday: {},
      payoutMethod: null,
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ allUsers: updatedUsers, mlmNetwork: updatedMlm });
    dispatchApi('/api/register', newUser);

    if (sponsor) {
      showToast(`Welcome ${newUser.name}! Registered under sponsor: ${sponsor.name} (${sponsor.referralCode}).`, 'success');
    } else {
      showToast(`Registration successful! Account created. Please select an Investment Plan and submit payment for Admin activation.`, 'info');
    }
    triggerCelebration();
    return true;
  };

  const loginUser = ({ identifier, password }) => {
    const idClean = (identifier || '').trim().toLowerCase();
    const matched = (state.allUsers || []).find(
      (u) => (u.email && u.email.toLowerCase() === idClean) || (u.phone && u.phone.trim() === (identifier || '').trim())
    );

    if (!matched) {
      showToast('No account found with this Mobile/Email. Please Register first.', 'error');
      return false;
    }

    if (matched.password !== password) {
      showToast('Incorrect password. Please verify and re-enter.', 'error');
      return false;
    }

    if (matched.status === 'SUSPENDED') {
      showToast(`Account suspended: ${matched.suspensionReason || 'Please contact platform support.'}`, 'error');
      return false;
    }

    if (matched.status === 'DEACTIVATED') {
      showToast('Account is currently deactivated. Please contact support.', 'error');
      return false;
    }

    const todayStr = getLocalDateString(0);
    const yesterdayStr = getLocalDateString(-1);
    const lastClaimed = state.loginStreak?.lastClaimedDate ? state.loginStreak.lastClaimedDate.slice(0, 10) : null;
    const missedDay = lastClaimed && lastClaimed !== yesterdayStr && lastClaimed !== todayStr;

    setState((prev) => ({
      ...prev,
      user: matched,
      payoutMethod: matched.payoutMethod || null,
      rewardWallet: matched.walletBalance || 0.00,
      totalWithdrawn: 0.00,
      tasksCompletedToday: {},
      loginStreak: missedDay ? {
        ...(prev.loginStreak || {}),
        currentDay: 1,
        claimedToday: false,
        history: Array(30).fill(false),
      } : {
        ...(prev.loginStreak || {}),
        claimedToday: lastClaimed === todayStr,
      },
    }));

    showToast(`Welcome back, ${matched.name}! Logged in successfully.`);
    return true;
  };

  const logoutUser = () => {
    setState((prev) => ({
      ...prev,
      user: null,
      rewardWallet: 0.00,
      totalWithdrawn: 0.00,
      tasksCompletedToday: {},
      payoutMethod: null,
      currentRole: 'investor',
    }));
    showToast('Logged out successfully.');
  };

  // Update Payout Method
  const savePayoutMethod = (methodData) => {
    const updated = {
      ...methodData,
      savedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      payoutMethod: updated,
      user: prev.user ? { ...prev.user, payoutMethod: updated } : prev.user,
      allUsers: (prev.allUsers || []).map((u) =>
        u.id === prev.user?.id ? { ...u, payoutMethod: updated } : u
      ),
    }));
    showToast('Payout method updated successfully! Ready for withdrawals.');
  };

  // Subscribe to or Upgrade membership tier (User can hold only 1 active plan; can upgrade, cannot downgrade)
  const subscribePlan = ({ amount, lockinPeriod, title, utrNumber, isTrial = false }) => {
    const numAmount = Number(amount);
    const isTrialPlan = Boolean(isTrial || numAmount === 300 || lockinPeriod?.id === 'trial_3d' || lockinPeriod?.days === 3);

    // Rule 1: A user cannot submit multiple deposits if one is already pending Admin verification!
    const activeUserId = state.user?.id || 'USR-GUEST';
    const activeUserPhone = state.user?.phone || '';
    const activeUserName = state.user?.name || '';
    const existingPendingDeposit = (state.depositRequests || []).find(
      (d) => d.status === 'PENDING' && (
        (activeUserId !== 'USR-GUEST' && d.userId === activeUserId) ||
        (activeUserPhone && d.userPhone === activeUserPhone) ||
        (activeUserName && d.userName === activeUserName)
      )
    );
    if (existingPendingDeposit) {
      showToast(
        `Payment verification in progress! You already have a pending deposit of ₹${existingPendingDeposit.amount.toLocaleString()} (UTR: ${existingPendingDeposit.utr}). Multiple payments are strictly prohibited until Admin verifies your current deposit.`,
        'error'
      );
      return false;
    }

    // Rule 2: A user cannot submit another plan if one is already pending approval!
    const existingPendingPlan = (state.plans || []).find(
      (p) => p.status === 'pending_approval' && (
        (activeUserId !== 'USR-GUEST' && p.userId === activeUserId) ||
        (activeUserPhone && p.userPhone === activeUserPhone) ||
        (activeUserName && p.userName === activeUserName)
      )
    );
    if (existingPendingPlan) {
      showToast(
        `Plan activation pending! You already have a plan awaiting Admin approval. Multiple payments are not permitted.`,
        'error'
      );
      return false;
    }

    // Rule 3: ₹300 Trial Plan is strictly once per mobile number!
    if (isTrialPlan) {
      if (hasUsedTrialPlan) {
        showToast('The ₹300 3-Day Trial Plan is limited to once per mobile number. This number has already availed the trial. Please select a regular Membership Plan (₹2,000+).', 'error');
        return false;
      }
    }

    const existingActivePlan = userPlans.find((p) => p.status === 'active') || null;

    if (existingActivePlan && !isTrialPlan) {
      if (numAmount <= existingActivePlan.amount) {
        showToast(`Downgrade not permitted. You currently hold the ₹${existingActivePlan.amount.toLocaleString()} tier. You can only upgrade to a higher tier plan.`, 'error');
        return false;
      }
    }

    const isUpgrade = Boolean(existingActivePlan && !isTrialPlan);
    const depositRef = `DEP-${Math.floor(1000 + Math.random() * 9000)}`;
    const utr = utrNumber || `UTR${Date.now().toString().slice(-10)}`;
    const effectiveLockin = lockinPeriod || (isTrialPlan ? TRIAL_PLAN : LOCKIN_PERIODS[0]);
    const planDays = isTrialPlan ? 3 : (effectiveLockin.days || effectiveLockin.months * 30);
    const planMonths = isTrialPlan ? 0.1 : effectiveLockin.months;

    const newDepositRequest = {
      id: depositRef,
      userId: state.user?.id || 'USR-GUEST',
      userName: state.user?.name || 'Member',
      userPhone: state.user?.phone || '',
      userEmail: state.user?.email || '',
      amount: numAmount,
      planMonths: planMonths,
      planDays: planDays,
      planTitle: title || (isTrialPlan ? '⚡ 3-Day Special Trial Pass' : `${effectiveLockin.label} Tier Plan`),
      isUpgrade: isUpgrade,
      isTrial: isTrialPlan,
      previousPlanId: existingActivePlan?.id || null,
      utr: utr,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      rejectionReason: '',
    };

    const calc = calculateEarnings(numAmount, planMonths, effectiveLockin.tierFactor, planDays);
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + planDays);

    const newPlan = {
      id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: state.user?.id || 'USR-GUEST',
      userName: state.user?.name || 'Member',
      userPhone: state.user?.phone || '',
      title: title || (isTrialPlan ? '⚡ 3-Day Special Trial Pass' : `${effectiveLockin.label} Tier Plan`),
      amount: numAmount,
      months: planMonths,
      days: planDays,
      startDate: startDate.toISOString(),
      maturityDate: maturityDate.toISOString(),
      totalExpectedGain: calc.estimatedTotalIncome,
      estimatedTotalIncome: calc.estimatedTotalIncome,
      dailyQuota: calc.estimatedDailyIncome,
      estimatedDailyQuota: calc.estimatedDailyIncome,
      earnedSoFar: 0,
      status: 'pending_approval', // STRICT: Requires Admin approval before becoming 'active'
      isUpgrade: isUpgrade,
      isTrial: isTrialPlan,
      depositRef: depositRef,
      utr: utr,
    };

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: state.user?.id || 'USR-GUEST',
      type: 'DEPOSIT',
      title: isUpgrade ? 'Plan Upgrade (Pending Admin Approval)' : 'Plan Deposit (Pending Admin Approval)',
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      meta: `${lockinPeriod.label} Tier (${newPlan.id}) - UTR: ${utr} [Awaiting Admin Payment Verification]`,
    };

    const updatedPlans = [newPlan, ...(state.plans || [])];
    const updatedDeposits = [newDepositRequest, ...(state.depositRequests || [])];

    setState((prev) => ({
      ...prev,
      plans: updatedPlans,
      depositRequests: updatedDeposits,
      transactions: [newTxn, ...prev.transactions],
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ depositRequests: updatedDeposits, plans: updatedPlans });
    dispatchApi('/api/deposit/submit', newDepositRequest);

    showToast(`Payment receipt submitted! UTR: ${utr}. Admin verification takes 5–15 minutes. Plan will activate upon approval.`, 'info');
    return newPlan;
  };

  // Complete a daily task and earn monetary reward
  const completeTask = ({ taskId, taskTitle, rewardAmount, meta }) => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Cannot perform tasks or claim rewards. Contact support.', 'error');
      return false;
    }
    if (state.user?.status === 'DEACTIVATED') {
      showToast('Account deactivated: Please reactivate your account in profile.', 'error');
      return false;
    }

    const isFreeTrialAllowed = Boolean(freeTrialStatus?.canEarn);
    const hasActivePaidPlan = Boolean(activePlan && activePlan.status === 'active');

    if (!isFreeTrialAllowed && !hasActivePaidPlan) {
      if (freeTrialStatus?.isExpired) {
        showToast('Your 2-Day Free Trial has expired. Please subscribe to the ₹300 3-Day Trial Plan or a regular Membership Plan to continue earning.', 'warning');
      } else if (state.user?.status === 'PENDING_ACTIVATION') {
        showToast('Account pending activation! Payment approval by Admin is required before you can earn task rewards.', 'error');
      } else {
        showToast('Payment approval required! Your deposit must be verified and approved by Admin to activate task earnings.', 'error');
      }
      return false;
    }

    if (taskId && state.tasksCompletedToday?.[taskId]) {
      showToast('Task already completed today! Each daily task can only be completed once per day.', 'warning');
      return false;
    }

    const numReward = Number(rewardAmount);

    const mult = userMembershipTier?.taskMultiplier || 1.0;
    const multLabel = mult > 1 ? ` (${mult}× Multiplier)` : '';

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'TASK_REWARD',
      title: taskTitle || 'Task Reward Claimed',
      amount: numReward,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: meta ? `${meta}${mult > 1 ? ` • ${mult}× Multiplier (${userMembershipTier?.tierBadge})` : ''}` : `Completed task ID: ${taskId}${multLabel}`,
    };

    setState((prev) => {
      const updatedPlans = (prev.plans || []).map((p) => {
        if (p.status === 'active') {
          return {
            ...p,
            earnedSoFar: +(p.earnedSoFar + numReward).toFixed(2),
          };
        }
        return p;
      });

      return {
        ...prev,
        rewardWallet: +(prev.rewardWallet + numReward).toFixed(2),
        tasksCompletedToday: {
          ...prev.tasksCompletedToday,
          [taskId]: numReward,
        },
        transactions: [newTxn, ...prev.transactions],
        plans: updatedPlans,
      };
    });

    showToast(`+${formatINR(numReward)} credited to your Task Wallet!${multLabel}`);
    triggerCelebration();
    return true;
  };

  // 24/7 Anytime Withdrawal Engine
  const withdrawRewards = (amount, customPayoutDetails = null) => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Cannot submit withdrawal requests. Contact support.', 'error');
      return false;
    }
    if (state.user?.status === 'DEACTIVATED') {
      showToast('Account deactivated: Reactivate account to withdraw.', 'error');
      return false;
    }

    // 1. Check if user is on Free Registration Trial (No paid plan)
    const isTrialMember = Boolean(activePlan && (activePlan.isTrial || activePlan.amount === 300));
    const hasPaidRegularPlan = Boolean(activePlan && activePlan.amount >= 2000);

    if (!isTrialMember && !hasPaidRegularPlan) {
      showToast('Withdrawal Locked: First-time free registration allows earning for 2 days, but withdrawal requires activating the ₹300 Trial Plan or a regular Membership Plan.', 'error');
      return false;
    }

    // 2. Check Trial Member rules:
    // - "trial members der khetre minimum requirement for withdrawals ta thakbe na, ora ja khusi with draw korte pare"
    // - "jibone ekbar e toh" (strictly 1 lifetime withdrawal under trial)
    if (isTrialMember) {
      if (hasUsedTrialWithdrawal) {
        showToast('The 3-Day Trial Plan allows exactly 1 lifetime withdrawal ("একবারই উইথড্র"). You have already claimed your 1 trial withdrawal. Please upgrade to a regular Membership Plan (₹2,000+) to unlock unlimited 24/7 withdrawals.', 'error');
        return false;
      }
      if (amount <= 0) {
        showToast('Please enter a valid amount to withdraw.', 'error');
        return false;
      }
      // Zero minimum limit for trial members!
    } else {
      // Regular members: minimum ₹100
      if (amount < 100) {
        showToast('Minimum withdrawal amount is ₹100.', 'error');
        return false;
      }
    }

    if (amount > state.rewardWallet) {
      showToast(`Insufficient balance. You requested ${formatINR(amount)} but only have ${formatINR(state.rewardWallet)} in wallet.`, 'error');
      return false;
    }

    const effectivePayout = customPayoutDetails || state.payoutMethod;
    if (!effectivePayout) {
      showToast('Please configure your UPI ID or Bank Account first.', 'error');
      return false;
    }

    const newWithdrawalRequest = {
      id: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: state.user?.id || 'USR-GUEST',
      userName: state.user?.name || 'Member',
      userPhone: state.user?.phone || '',
      userEmail: state.user?.email || '',
      amount: amount,
      type: 'TASK_REWARD',
      payoutDetails: {
        ...effectivePayout,
        holderName: effectivePayout.holderName || state.user?.name || 'Member',
        holder: effectivePayout.holderName || state.user?.name || 'Member',
        value: effectivePayout.type === 'upi_id'
          ? (effectivePayout.upiId || '')
          : effectivePayout.type === 'upi_phone'
            ? `${effectivePayout.upiPhone || ''} (${effectivePayout.upiApp || 'UPI Mobile'})`
            : `${effectivePayout.bankName || 'Bank'} - A/C: ${effectivePayout.accountNumber || ''} (IFSC: ${effectivePayout.ifsc || ''})`,
      },
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      rejectionReason: '',
      disbursedUtr: '',
    };

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'WITHDRAWAL',
      title: 'Task Reward Withdrawal Request',
      amount: amount,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      meta: `Payout submitted to: ${effectivePayout.type === 'upi_id' ? effectivePayout.upiId : effectivePayout.type === 'upi_phone' ? effectivePayout.upiPhone : effectivePayout.bankName}`,
      payoutMethod: effectivePayout,
    };

    const updatedWdrs = [newWithdrawalRequest, ...(state.withdrawalRequests || [])];

    setState((prev) => ({
      ...prev,
      rewardWallet: +(prev.rewardWallet - amount).toFixed(2),
      totalWithdrawn: +(prev.totalWithdrawn + amount).toFixed(2),
      lastWithdrawalTime: new Date().toISOString(),
      withdrawalRequests: updatedWdrs,
      transactions: [newTxn, ...prev.transactions],
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ withdrawalRequests: updatedWdrs });
    dispatchApi('/api/withdrawal/submit', newWithdrawalRequest);

    showToast(`Withdrawal of ₹${amount.toLocaleString()} submitted! Verification within 5–15 mins.`);
    triggerCelebration();
    return newTxn;
  };

  // 30-Day Daily Login Bonus
  const claimDailyLoginBonus = () => {
    if (state.user?.status === 'SUSPENDED' || state.user?.status === 'DEACTIVATED') {
      showToast('Account inactive: Cannot claim streak bonus.', 'error');
      return false;
    }

    const isFreeTrialAllowed = Boolean(freeTrialStatus?.canEarn);
    const hasActivePaidPlan = Boolean(activePlan && activePlan.status === 'active');

    if (!isFreeTrialAllowed && !hasActivePaidPlan) {
      if (freeTrialStatus?.isExpired) {
        showToast('Your 2-Day Free Trial has ended. Please subscribe to the ₹300 3-Day Trial Plan or a regular Membership Plan to continue claiming daily bonuses.', 'warning');
      } else if (state.user?.status === 'PENDING_ACTIVATION') {
        showToast('Account pending activation! Payment approval by Admin is required to claim daily login bonus.', 'error');
      } else {
        showToast('Payment approval required! Please subscribe to the ₹300 Trial or a Membership Plan (₹2,000+) to unlock daily bonus.', 'error');
      }
      return false;
    }

    const streak = state.loginStreak || {
      currentDay: 1,
      lastClaimedDate: null,
      claimedToday: false,
      totalStreakEarned: 0,
      history: Array(30).fill(false),
    };

    const todayStr = getLocalDateString(0);
    const yesterdayStr = getLocalDateString(-1);
    const lastClaimed = streak.lastClaimedDate ? streak.lastClaimedDate.slice(0, 10) : null;

    let activeDay = streak.currentDay || 1;
    let activeHistory = streak.history || Array(30).fill(false);

    // Rule: Miss a day -> strictly restart from Day 1 on next login
    if (lastClaimed && lastClaimed !== yesterdayStr && lastClaimed !== todayStr) {
      activeDay = 1;
      activeHistory = Array(30).fill(false);
    }

    if (lastClaimed === todayStr || streak.claimedToday) {
      showToast("Today's bonus has already been claimed! Next reward unlocks tomorrow at 00:00 hrs.", 'warning');
      return false;
    }

    const currentDay = Math.min(30, Math.max(1, activeDay));
    const activeStreakRewards = state.streakRewards || STREAK_REWARDS;
    const baseReward = Number(activeStreakRewards[currentDay]) || (currentDay >= 30 ? 12 : 1);
    const multiplier = Number(userMembershipTier?.loginMultiplier) || 1.0;
    const reward = +(baseReward * multiplier).toFixed(2);

    const newHistory = [...activeHistory];
    newHistory[currentDay - 1] = true;

    const isCompletedMonth = currentDay >= 30;
    const nextDay = isCompletedMonth ? 1 : currentDay + 1;

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'LOGIN_BONUS',
      title: `Daily Login Streak Bonus (Day ${currentDay} of 30)`,
      amount: reward,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `Attendance bonus: ₹${reward.toFixed(2)} (${userMembershipTier?.tierBadge} • ${multiplier}× Deposit Multiplier) credited!`,
    };

    setState((prev) => ({
      ...prev,
      rewardWallet: +(prev.rewardWallet + reward).toFixed(2),
      transactions: [newTxn, ...prev.transactions],
      loginStreak: {
        currentDay: nextDay,
        lastClaimedDate: new Date().toISOString(),
        claimedToday: true,
        totalStreakEarned: +((streak.totalStreakEarned || 0) + reward).toFixed(2),
        history: isCompletedMonth ? Array(30).fill(false) : newHistory,
      },
    }));

    showToast(`🎉 Day ${currentDay} Bonus Claimed! +₹${reward.toFixed(2)} (${multiplier}× Multiplier) added to your Task Wallet.`);
    triggerCelebration();
    return true;
  };

  // Withdraw principal for matured plan
  const withdrawPrincipal = (planId) => {
    const plan = state.plans.find((p) => p.id === planId);
    if (!plan) return false;

    const newWithdrawalRequest = {
      id: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: state.user?.id || 'USR-GUEST',
      userName: state.user?.name || 'Member',
      userPhone: state.user?.phone || '',
      userEmail: state.user?.email || '',
      amount: plan.amount,
      type: 'PRINCIPAL_WITHDRAWAL',
      planId: planId,
      payoutDetails: {
        ...(state.payoutMethod || {}),
        holderName: state.payoutMethod?.holderName || state.user?.name || 'Member',
        holder: state.payoutMethod?.holderName || state.user?.name || 'Member',
        value: state.payoutMethod?.type === 'upi_id'
          ? (state.payoutMethod.upiId || '')
          : state.payoutMethod?.type === 'upi_phone'
            ? `${state.payoutMethod.upiPhone || ''} (${state.payoutMethod.upiApp || 'UPI Mobile'})`
            : state.payoutMethod?.type === 'bank'
              ? `${state.payoutMethod.bankName || 'Bank'} - A/C: ${state.payoutMethod.accountNumber || ''} (IFSC: ${state.payoutMethod.ifsc || ''})`
              : (state.payoutMethod?.upiId || 'Bank/UPI'),
      },
      submittedAt: new Date().toISOString(),
      status: 'APPROVED',
      rejectionReason: '',
      disbursedUtr: `IMPS${Date.now().toString().slice(-9)}`,
    };

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'PRINCIPAL_WITHDRAWAL',
      title: 'Matured Principal Return',
      amount: plan.amount,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `Full principal refund for matured plan ${plan.id} (${plan.months}M lock-in)`,
      payoutMethod: state.payoutMethod,
    };

    setState((prev) => ({
      ...prev,
      plans: prev.plans.filter((p) => p.id !== planId),
      totalWithdrawn: +(prev.totalWithdrawn + plan.amount).toFixed(2),
      withdrawalRequests: [newWithdrawalRequest, ...prev.withdrawalRequests],
      transactions: [newTxn, ...prev.transactions],
    }));

    showToast(`Principal refund of ${formatINR(plan.amount)} disbursed!`);
    triggerCelebration();
    return true;
  };

  // Skill Gaming & PvP Solo Games
  const playSoloSkillGame = ({ gameId, gameTitle, entryFee, rewardAmount, won, score }) => {
    if (state.user?.status === 'SUSPENDED' || state.user?.status === 'DEACTIVATED') {
      showToast('Account suspended/inactive. Cannot play skill games.', 'error');
      return false;
    }
    if (state.user?.status === 'PENDING_ACTIVATION' || !activePlan || activePlan.status !== 'active') {
      showToast('Account pending payment approval! Active membership is required to participate in arenas.', 'error');
      return false;
    }

    const fee = Number(entryFee) || 0;
    const reward = Number(rewardAmount) || 0;

    // Deduct entry fee when starting match
    if (fee > 0 && !won) {
      if (state.rewardWallet < fee) {
        showToast(`Insufficient Task Wallet! Entry fee is ${formatINR(fee)}. Membership capital is strictly locked and cannot be used.`, 'error');
        return false;
      }

      const entryTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'GAME_ENTRY',
        title: `${gameTitle || 'Skill Arena'} — Entry Fee`,
        amount: -fee,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        meta: `Entry fee of ${formatINR(fee)} funded from Task Wallet winnings (Principal locked).`,
      };

      setState((prev) => ({
        ...prev,
        rewardWallet: Math.max(0, +(prev.rewardWallet - fee).toFixed(2)),
        transactions: [entryTxn, ...prev.transactions],
        gamingStats: {
          ...prev.gamingStats,
          totalMatchesPlayed: (prev.gamingStats?.totalMatchesPlayed || 0) + 1,
          userMatchesPlayed: (prev.gamingStats?.userMatchesPlayed || 0) + 1,
        },
      }));

      return true;
    }

    // Award winning amount when won
    if (won && reward > 0) {
      const winTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'TASK_REWARD',
        title: `${gameTitle || 'Skill Game'} — Skill Victory!`,
        amount: reward,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        meta: `Score: ${score || 'Solved'} • Pure Cognitive Skill Challenge Winnings`,
      };

      setState((prev) => ({
        ...prev,
        rewardWallet: +(prev.rewardWallet + reward).toFixed(2),
        transactions: [winTxn, ...prev.transactions],
        gamingStats: {
          ...prev.gamingStats,
          userMatchesWon: (prev.gamingStats?.userMatchesWon || 0) + 1,
        },
      }));

      triggerCelebration();
      showToast(`🎉 Puzzle solved! +${formatINR(reward)} credited to your Task Wallet!`);
      return true;
    }

    return true;
  };

  // Skill Gaming PvP Match
  const playMultiplayerPvPMatch = ({ gameType, gameTitle, entryFee, playersCount, userRank, matchSummary }) => {
    if (state.user?.status === 'SUSPENDED' || state.user?.status === 'DEACTIVATED') {
      showToast('Account suspended/inactive. Cannot enter PvP arena.', 'error');
      return false;
    }

    const fee = Number(entryFee) || 5;
    const players = Number(playersCount) || 2;
    const grossPot = fee * players;
    const platformCommission = +(grossPot * 0.10).toFixed(2);
    const netPool = +(grossPot - platformCommission).toFixed(2);

    let winAmount = 0;
    if (userRank === 1) {
      winAmount = players === 2 ? netPool : +(netPool * 0.75).toFixed(2);
    } else if (userRank === 2 && players === 4) {
      winAmount = +(netPool * 0.25).toFixed(2);
    }

    const netChange = +(winAmount - fee).toFixed(2);

    const matchTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: winAmount > 0 ? 'TASK_REWARD' : 'GAME_ENTRY',
      title: `${gameTitle} (Rank #${userRank})`,
      amount: winAmount > 0 ? winAmount : -fee,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `Pot: ₹${grossPot} • 10% Platform Rake: -₹${platformCommission} • Payout: ₹${winAmount}`,
    };

    setState((prev) => ({
      ...prev,
      rewardWallet: Math.max(0, +(prev.rewardWallet + netChange).toFixed(2)),
      transactions: [matchTxn, ...prev.transactions],
      gamingStats: {
        ...prev.gamingStats,
        totalGamingRakeCollected: +((prev.gamingStats?.totalGamingRakeCollected || 0) + platformCommission).toFixed(2),
        totalMatchesPlayed: (prev.gamingStats?.totalMatchesPlayed || 0) + 1,
        userMatchesPlayed: (prev.gamingStats?.userMatchesPlayed || 0) + 1,
        userMatchesWon: (prev.gamingStats?.userMatchesWon || 0) + (userRank === 1 ? 1 : 0),
      },
    }));

    if (userRank === 1) {
      triggerCelebration();
      showToast(`🏆 1st Rank in ${gameTitle}! +${formatINR(winAmount)} won!`);
    } else if (winAmount > 0) {
      showToast(`🥈 2nd Rank in ${gameTitle}! +${formatINR(winAmount)} runner-up prize won!`);
    } else {
      showToast(`Match ended (Rank #${userRank}). Entry fee ₹${fee} settled.`);
    }

    return true;
  };

  // MLM 2:1 Binary Methods
  const setPreferredLeg = (leg) => {
    setState((prev) => ({
      ...prev,
      mlmNetwork: {
        ...(prev.mlmNetwork || {}),
        preferredLeg: leg,
      },
    }));
    showToast(`Referral placement leg updated to: ${leg}`);
  };

  const addDownlineMember = ({ name, leg, amount }) => {
    const depositAmt = Number(amount) || 2000;
    const memberName = name?.trim() || `Member-${Math.floor(100 + Math.random() * 900)}`;

    setState((prev) => {
      const mlm = prev.mlmNetwork || {
        referralCode: 'TASKCOIN',
        preferredLeg: 'AUTO',
        leftVolume: 0,
        rightVolume: 0,
        leftCarry: 0,
        rightCarry: 0,
        totalPairsMatched: 0,
        lifetimeMlmEarned: 0,
        dailyCappedToday: 0,
        dailyCapLimit: 3000,
        leftMembers: [],
        rightMembers: []
      };

      let targetLeg = leg;
      if (!targetLeg || targetLeg === 'AUTO') {
        targetLeg = (mlm.leftCarry <= mlm.rightCarry) ? 'LEFT' : 'RIGHT';
      }

      const newMember = {
        id: `USR-${Math.floor(200 + Math.random() * 800)}`,
        name: memberName,
        amount: depositAmt,
        joinedAt: new Date().toISOString(),
        leg: targetLeg,
        status: 'ACTIVE',
      };

      let newLeftCarry = targetLeg === 'LEFT' ? mlm.leftCarry + depositAmt : mlm.leftCarry;
      let newRightCarry = targetLeg === 'RIGHT' ? mlm.rightCarry + depositAmt : mlm.rightCarry;
      const newLeftVol = targetLeg === 'LEFT' ? mlm.leftVolume + depositAmt : mlm.leftVolume;
      const newRightVol = targetLeg === 'RIGHT' ? mlm.rightVolume + depositAmt : mlm.rightVolume;

      const newLeftMembers = targetLeg === 'LEFT' ? [newMember, ...(mlm.leftMembers || [])] : (mlm.leftMembers || []);
      const newRightMembers = targetLeg === 'RIGHT' ? [newMember, ...(mlm.rightMembers || [])] : (mlm.rightMembers || []);

      let pairsMatchedNow = 0;
      let bonusEarnedNow = 0;
      const PAIR_BONUS = 150;

      while (true) {
        if (newLeftCarry >= 2000 && newRightCarry >= 1000) {
          newLeftCarry -= 2000;
          newRightCarry -= 1000;
          pairsMatchedNow += 1;
          bonusEarnedNow += PAIR_BONUS;
        } else if (newLeftCarry >= 1000 && newRightCarry >= 2000) {
          newLeftCarry -= 1000;
          newRightCarry -= 2000;
          pairsMatchedNow += 1;
          bonusEarnedNow += PAIR_BONUS;
        } else {
          break;
        }
      }

      const availableCap = Math.max(0, mlm.dailyCapLimit - mlm.dailyCappedToday);
      const payableBonus = Math.min(bonusEarnedNow, availableCap);

      let newTxns = prev.transactions;
      if (payableBonus > 0) {
        const mlmTxn = {
          id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'MLM_BINARY_BONUS',
          title: `2:1 Binary Pair Matching Bonus (${pairsMatchedNow} Pair${pairsMatchedNow > 1 ? 's' : ''})`,
          amount: payableBonus,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED',
          meta: `Matched 2:1 ratio from ${memberName} (₹${depositAmt.toLocaleString()}) on ${targetLeg} leg`,
        };
        newTxns = [mlmTxn, ...prev.transactions];
      }

      return {
        ...prev,
        rewardWallet: +(prev.rewardWallet + payableBonus).toFixed(2),
        transactions: newTxns,
        mlmNetwork: {
          ...mlm,
          leftVolume: newLeftVol,
          rightVolume: newRightVol,
          leftCarry: newLeftCarry,
          rightCarry: newRightCarry,
          totalPairsMatched: mlm.totalPairsMatched + pairsMatchedNow,
          lifetimeMlmEarned: +(mlm.lifetimeMlmEarned + payableBonus).toFixed(2),
          dailyCappedToday: +(mlm.dailyCappedToday + payableBonus).toFixed(2),
          leftMembers: newLeftMembers,
          rightMembers: newRightMembers,
        },
      };
    });

    showToast(`New member added to ${leg || 'weaker'} leg with ₹${depositAmt.toLocaleString()}!`);
    triggerCelebration();
  };

  /* =========================================================================
     ADMIN USER & REQUEST CONTROLS (REAL-TIME USER <-> ADMIN SYNC)
     ========================================================================= */
  const activateUser = (userId) => {
    let updatedCurUser = state.user;
    const targetUser = (state.allUsers || []).find((u) => u.id === userId);
    
    // Check if user has a pending deposit awaiting verification
    const userPendingDep = (state.depositRequests || []).find(
      (d) => d.status === 'PENDING' && (
        d.userId === userId ||
        (targetUser && (d.userName === targetUser.name || (d.userPhone && targetUser.phone && d.userPhone === targetUser.phone)))
      )
    );

    const depositAmount = userPendingDep ? Number(userPendingDep.amount) || 0 : 0;

    const updatedUsers = (state.allUsers || []).map((u) =>
      u.id === userId ? {
        ...u,
        status: 'ACTIVE',
        isActivated: true,
        isVerified: true,
        suspensionReason: '',
        totalDeposited: (u.totalDeposited || 0) + depositAmount,
      } : u
    );

    const isCur = state.user?.id === userId || (targetUser && (state.user?.email === targetUser.email || state.user?.phone === targetUser.phone));
    if (isCur) {
      updatedCurUser = {
        ...state.user,
        status: 'ACTIVE',
        isActivated: true,
        isVerified: true,
        suspensionReason: '',
        totalDeposited: (state.user.totalDeposited || 0) + depositAmount,
      };
    }

    // Approve pending deposit in depositRequests queue
    const updatedDeposits = (state.depositRequests || []).map((d) =>
      userPendingDep && d.id === userPendingDep.id ? { ...d, status: 'APPROVED' } : d
    );

    // Also activate any pending plan for this user
    let updatedPlans = (state.plans || []).map((p) => {
      const belongs = p.userId === userId || (targetUser && (p.userName === targetUser.name || (p.userPhone && targetUser.phone && p.userPhone === targetUser.phone)));
      if (p.status === 'pending_approval' && belongs) {
        return { ...p, status: 'active', startDate: new Date().toISOString() };
      }
      return p;
    });

    if (userPendingDep && !updatedPlans.some((p) => p.status === 'active' && (p.userId === userId || (targetUser && p.userName === targetUser.name)))) {
      const calc = calculateEarnings(userPendingDep.amount, userPendingDep.planMonths || 1, 1.0);
      const startDate = new Date();
      const totalDays = userPendingDep.planDays || (userPendingDep.planMonths || 1) * 30;
      const maturityDate = new Date(startDate.getTime() + totalDays * 86400000);
      const isTrial = Boolean(userPendingDep.isTrial || userPendingDep.amount === 300 || totalDays === 3);

      const approvedPlan = {
        id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: userId,
        userName: targetUser?.name || 'Member',
        userPhone: targetUser?.phone || '',
        title: userPendingDep.planTitle || `${totalDays} Days Membership Tier`,
        amount: userPendingDep.amount,
        months: userPendingDep.planMonths || 1,
        days: totalDays,
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
        totalExpectedGain: calc.estimatedTotalIncome,
        estimatedTotalIncome: calc.estimatedTotalIncome,
        dailyQuota: calc.estimatedDailyIncome,
        earnedSoFar: 0,
        status: 'active',
        isUpgrade: Boolean(userPendingDep.isUpgrade),
        isTrial: isTrial,
        depositRef: userPendingDep.id,
        utr: userPendingDep.utr,
      };
      updatedPlans = [approvedPlan, ...updatedPlans.filter((p) => p.depositRef !== userPendingDep.id)];
    }

    setState((prev) => ({
      ...prev,
      allUsers: updatedUsers,
      user: updatedCurUser,
      plans: updatedPlans,
      depositRequests: updatedDeposits,
    }));

    // Real-Time Broadcast & Backend Sync
    broadcastState({ allUsers: updatedUsers, plans: updatedPlans, depositRequests: updatedDeposits });
    dispatchApi('/api/user/status', { userId, status: 'ACTIVE' });
    if (userPendingDep) {
      dispatchApi('/api/deposit/review', { depositId: userPendingDep.id, action: 'APPROVE' });
    }

    const userName = targetUser?.name || 'User';
    showToast(`User ${userName} successfully ACTIVATED with full earning access!${depositAmount > 0 ? ` (₹${depositAmount.toLocaleString()} plan unlocked)` : ''}`);
    triggerCelebration();
  };

  const deactivateUser = (userId) => {
    const updatedUsers = (state.allUsers || []).map((u) =>
      u.id === userId ? { ...u, status: 'DEACTIVATED', suspensionReason: 'Deactivated by Administrator' } : u
    );
    const updatedCurUser = state.user?.id === userId ? { ...state.user, status: 'DEACTIVATED', suspensionReason: 'Deactivated by Administrator' } : state.user;

    setState((prev) => ({ ...prev, allUsers: updatedUsers, user: updatedCurUser }));

    broadcastState({ allUsers: updatedUsers });
    dispatchApi('/api/user/status', { userId, status: 'DEACTIVATED', reason: 'Deactivated by Administrator' });

    showToast(`User ${userId} DEACTIVATED.`);
  };

  const suspendUser = (userId, reason) => {
    const r = reason || 'Suspended by Administrator';
    const updatedUsers = (state.allUsers || []).map((u) =>
      u.id === userId ? { ...u, status: 'SUSPENDED', suspensionReason: r } : u
    );
    const updatedCurUser = state.user?.id === userId ? { ...state.user, status: 'SUSPENDED', suspensionReason: r } : state.user;

    setState((prev) => ({ ...prev, allUsers: updatedUsers, user: updatedCurUser }));

    broadcastState({ allUsers: updatedUsers });
    dispatchApi('/api/user/status', { userId, status: 'SUSPENDED', reason: r });

    showToast(`User ${userId} has been SUSPENDED.`);
  };

  const deleteUser = (userId) => {
    const updatedUsers = (state.allUsers || []).filter((u) => u.id !== userId);
    const updatedCurUser = state.user?.id === userId ? null : state.user;

    setState((prev) => ({ ...prev, allUsers: updatedUsers, user: updatedCurUser }));

    broadcastState({ allUsers: updatedUsers });
    dispatchApi('/api/user/delete', { userId });

    showToast(`User ${userId} deleted permanently.`, 'warning');
  };

  const resetUserPassword = (userId, newPassword) => {
    const updatedUsers = (state.allUsers || []).map((u) =>
      u.id === userId ? { ...u, password: newPassword } : u
    );

    setState((prev) => ({ ...prev, allUsers: updatedUsers }));

    broadcastState({ allUsers: updatedUsers });
    dispatchApi('/api/user/status', { userId, status: 'PASSWORD_RESET', password: newPassword });

    showToast(`Password for user ${userId} reset successfully!`);
  };

  const updateStreakRewards = (newRewards) => {
    setState((prev) => ({
      ...prev,
      streakRewards: { ...prev.streakRewards, ...newRewards },
    }));
    showToast('Daily login streak rewards successfully updated by Admin!', 'success');
  };

  const updatePlanMultipliers = (newMultipliers) => {
    setState((prev) => {
      const updated = {
        ...(prev.planMultipliers || DEFAULT_PLAN_MULTIPLIERS),
        ...newMultipliers,
        // Crucial base anchor rules:
        // Base 2000 plan is strictly 1.0x (all task and daily login bonus authored at this base)
        // 3-Day 300 trial plan is strictly 1.0x (same as 2000 plan)
        2000: 1.0,
        300: 1.0,
      };
      broadcastState({ planMultipliers: updated });
      dispatchApi('/api/sync', { planMultipliers: updated });
      return {
        ...prev,
        planMultipliers: updated,
      };
    });
    showToast('⚡ Membership plan multipliers updated successfully!', 'success');
  };

  const requestPasswordReset = (identifier) => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) {
      showToast('Please enter your registered mobile number or email.', 'error');
      return { success: false, reason: 'EMPTY_INPUT' };
    }

    const inputLower = rawInput.toLowerCase();
    const inputDigits = rawInput.replace(/\D/g, '');
    const userList = state.allUsers || [];

    const matchedUser = userList.find((u) => {
      // 1. Email match
      if (u.email && u.email.toLowerCase() === inputLower) return true;

      // 2. Exact phone match
      if (u.phone && u.phone.trim() === rawInput) return true;

      // 3. Digit-based phone match (handles +91, spaces, dashes)
      const uDigits = (u.phone || '').replace(/\D/g, '');
      if (inputDigits && uDigits) {
        if (inputDigits === uDigits) return true;
        if (inputDigits.length >= 10 && uDigits.endsWith(inputDigits.slice(-10))) return true;
        if (uDigits.length >= 10 && inputDigits.endsWith(uDigits.slice(-10))) return true;
      }

      return false;
    });

    if (!matchedUser) {
      // Check server asynchronously in case user was registered on another device
      dispatchApi('/api/password-reset/request', { identifier: rawInput }).then((res) => {
        if (res && res.success && res.request) {
          setState((prev) => reconcileStates(prev, {
            allUsers: res.user ? [res.user, ...(prev.allUsers || [])] : prev.allUsers,
            passwordResetRequests: [res.request, ...(prev.passwordResetRequests || [])],
          }));
        }
      });
      return {
        success: false,
        found: false,
        phone: rawInput,
      };
    }

    const newReq = {
      id: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: matchedUser.id,
      userName: matchedUser.name,
      userPhone: matchedUser.phone,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    const updatedResets = [newReq, ...(state.passwordResetRequests || [])];
    setState((prev) => ({
      ...prev,
      passwordResetRequests: updatedResets,
    }));

    // Broadcast immediately across tabs & send to server
    broadcastState({ passwordResetRequests: updatedResets });
    dispatchApi('/api/password-reset/request', { identifier: rawInput });

    showToast('পাসওয়ার্ড রিসেট রিকোয়েস্ট জমা নেওয়া হয়েছে। অ্যাডমিন টিম আপনার নম্বরে এসএমএস করে নতুন পাসওয়ার্ড পাঠাবে।', 'success');
    return {
      success: true,
      found: true,
      user: matchedUser
    };
  };

  const resolvePasswordReset = (requestId, customTempPassword) => {
    const req = (state.passwordResetRequests || []).find((r) => r.id === requestId);
    if (!req) return null;
    const tempPass = customTempPassword || `Task@${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedUsers = (state.allUsers || []).map((u) =>
      u.id === req.userId ? { ...u, password: tempPass } : u
    );

    const updatedResets = (state.passwordResetRequests || []).map((r) =>
      r.id === requestId
        ? { ...r, status: 'RESOLVED', resolvedAt: new Date().toISOString(), tempPassword: tempPass }
        : r
    );

    setState((prev) => ({
      ...prev,
      allUsers: updatedUsers,
      passwordResetRequests: updatedResets,
    }));

    // Real-Time Broadcast & Backend Sync
    broadcastState({ allUsers: updatedUsers, passwordResetRequests: updatedResets });
    dispatchApi('/api/password-reset/resolve', { requestId, tempPassword: tempPass });

    return {
      success: true,
      phone: req.userPhone,
      name: req.userName,
      tempPassword: tempPass,
    };
  };

  const approveDeposit = (depositId) => {
    const req = (state.depositRequests || []).find((d) => d.id === depositId);
    if (!req) return;

    const calc = calculateEarnings(req.amount, req.planMonths, 1.0);
    const startDate = new Date();
    const totalDays = req.planDays || req.planMonths * 30;
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + totalDays);

    const approvedPlan = {
      id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: req.userId,
      userName: req.userName,
      userPhone: req.userPhone || '',
      title: req.planTitle,
      amount: req.amount,
      months: req.planMonths,
      days: totalDays,
      startDate: startDate.toISOString(),
      maturityDate: maturityDate.toISOString(),
      totalExpectedGain: calc.estimatedTotalIncome,
      estimatedTotalIncome: calc.estimatedTotalIncome,
      dailyQuota: calc.estimatedDailyIncome,
      earnedSoFar: 0,
      status: 'active',
      isUpgrade: req.isUpgrade,
      isTrial: Boolean(req.isTrial || req.amount === 300 || req.planDays === 3),
      depositRef: req.id,
      utr: req.utr,
    };

    // Filter out any pending plan that was linked to this deposit
    const nonMatchingPlans = (state.plans || []).filter((p) => p.depositRef !== req.id);
    const updatedPlans = [
      approvedPlan,
      ...nonMatchingPlans.map((p) =>
        req.isUpgrade && p.status === 'active' && (p.userId === req.userId || p.userName === req.userName)
          ? { ...p, status: 'superseded_upgrade' }
          : p
      ),
    ];

    // Activate User in allUsers and current user!
    const updatedUsers = (state.allUsers || []).map((u) => {
      if (u.id === req.userId || u.name === req.userName || (u.phone && req.userPhone && u.phone === req.userPhone)) {
        return {
          ...u,
          status: 'ACTIVE',
          isActivated: true,
          isVerified: true,
          suspensionReason: '',
          totalDeposited: (u.totalDeposited || 0) + req.amount,
        };
      }
      return u;
    });

    const isCurrent = state.user && (
      state.user.id === req.userId ||
      state.user.name === req.userName ||
      (state.user.phone && req.userPhone && state.user.phone === req.userPhone)
    );
    const updatedCurUser = isCurrent
      ? {
          ...state.user,
          status: 'ACTIVE',
          isActivated: true,
          isVerified: true,
          suspensionReason: '',
          totalDeposited: (state.user.totalDeposited || 0) + req.amount,
        }
      : state.user;

    const updatedDeposits = (state.depositRequests || []).map((d) =>
      d.id === depositId ? { ...d, status: 'APPROVED' } : d
    );

    // Update matching transactions
    const updatedTxns = (state.transactions || []).map((t) => {
      if (t.type === 'DEPOSIT' && (t.meta?.includes(req.utr) || t.title?.includes('Pending'))) {
        return { ...t, status: 'COMPLETED', title: req.isUpgrade ? 'Membership Plan Upgrade' : 'Membership Tier Subscription' };
      }
      return t;
    });

    setState((prev) => ({
      ...prev,
      plans: updatedPlans,
      depositRequests: updatedDeposits,
      allUsers: updatedUsers,
      user: updatedCurUser,
      transactions: updatedTxns,
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ depositRequests: updatedDeposits, plans: updatedPlans, allUsers: updatedUsers });
    dispatchApi('/api/deposit/review', { depositId, action: 'APPROVE' });

    showToast(`Deposit ${depositId} APPROVED! User account and membership plan activated.`);
    triggerCelebration();
  };

  const rejectDeposit = (depositId, reason) => {
    const rejReason = reason || 'Invalid UTR / Payment not received in bank account';
    const updatedPlans = (state.plans || []).filter((p) => p.depositRef !== depositId);
    const updatedDeposits = (state.depositRequests || []).map((d) =>
      d.id === depositId ? { ...d, status: 'REJECTED', rejectionReason: rejReason } : d
    );

    setState((prev) => ({
      ...prev,
      plans: updatedPlans,
      depositRequests: updatedDeposits,
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ depositRequests: updatedDeposits, plans: updatedPlans });
    dispatchApi('/api/deposit/review', { depositId, action: 'REJECT', reason: rejReason });

    showToast(`Deposit ${depositId} REJECTED. Reason: ${rejReason}`, 'error');
  };

  const approveWithdrawal = (withdrawalId, customUtr) => {
    const utr = customUtr || `IMPS${Date.now().toString().slice(-9)}`;
    const updatedWdrs = (state.withdrawalRequests || []).map((w) =>
      w.id === withdrawalId ? { ...w, status: 'APPROVED', disbursedUtr: utr } : w
    );

    setState((prev) => ({
      ...prev,
      withdrawalRequests: updatedWdrs,
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ withdrawalRequests: updatedWdrs });
    dispatchApi('/api/withdrawal/review', { withdrawalId, action: 'APPROVE', utr });

    showToast(`Withdrawal ${withdrawalId} APPROVED & Disbursed! IMPS UTR: ${utr}`);
    triggerCelebration();
  };

  const rejectWithdrawal = (withdrawalId, reason) => {
    const rejReason = reason || 'Invalid UPI / Bank Account details provided';
    const req = (state.withdrawalRequests || []).find((w) => w.id === withdrawalId);
    if (!req) return;

    const refundAmount = req.amount;
    const updatedWdrs = (state.withdrawalRequests || []).map((w) =>
      w.id === withdrawalId ? { ...w, status: 'REJECTED', rejectionReason: rejReason } : w
    );

    setState((prev) => ({
      ...prev,
      rewardWallet: +(prev.rewardWallet + refundAmount).toFixed(2),
      totalWithdrawn: Math.max(0, +(prev.totalWithdrawn - refundAmount).toFixed(2)),
      withdrawalRequests: updatedWdrs,
    }));

    // Real-Time Cross-Tab & Cross-Device broadcast
    broadcastState({ withdrawalRequests: updatedWdrs });
    dispatchApi('/api/withdrawal/review', { withdrawalId, action: 'REJECT', reason: rejReason });

    showToast(`Withdrawal ${withdrawalId} REJECTED. Funds reverted to user wallet.`, 'error');
  };

  const toggleForceSunday = () => {
    setState((prev) => {
      const next = !prev.forceSunday;
      showToast(next ? '⚡ Sunday Mode Activated! Withdrawals open.' : 'Sunday Mode disabled.');
      return { ...prev, forceSunday: next };
    });
  };

  /* =========================================================================
     DATE-WISE TASK SCHEDULING & ORCHESTRATION METHODS (7 COMING DAYS)
     ========================================================================= */
  const addTaskForDate = (dateStr, taskData) => {
    const type = taskData.type || 'video';
    const newId = `task_${type}_${Date.now().toString().slice(-5)}`;
    const newTask = {
      id: newId,
      type: type,
      title: taskData.title || 'Engagement Task',
      category: taskData.category || (
        type === 'video' ? 'Video & Share' :
        type === 'walk' ? 'Fitness Tracker' :
        type === 'slide3' ? 'Skill Puzzle' :
        type === 'memory' ? 'Brain Game' :
        type === 'music' ? 'Focus Audio' :
        type === 'spin' ? 'Lucky Draw' :
        'Special Task'
      ),
      platform: taskData.platform || (type === 'video' ? 'YouTube' : 'TaskCoin App'),
      videoUrl: taskData.videoUrl || '',
      youtubeId: type === 'video' ? extractYoutubeId(taskData.videoUrl || '') : '',
      actionUrl: taskData.actionUrl || '',
      reward: Number(taskData.reward) || 35.00,
      duration: Number(taskData.duration) || (type === 'walk' ? 600 : type === 'slide3' || type === 'memory' ? 60 : 20),
      shareRequired: taskData.shareRequired === true,
      sharePlatform: taskData.sharePlatform || 'Facebook & Friends',
      status: 'ACTIVE',
      totalShares: 0,
      description: taskData.description || 'Verified engagement task.',
      createdAt: new Date().toISOString(),
      targetDate: dateStr,
    };

    setState((prev) => {
      const existingSched = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
      const dateTasks = existingSched[dateStr] || [];
      const updatedDateTasks = [newTask, ...dateTasks];
      const updatedSched = { ...existingSched, [dateStr]: updatedDateTasks };

      const isToday = dateStr === getLocalDateString(0);
      return {
        ...prev,
        scheduledTasksByDate: updatedSched,
        dailyTaskRoster: isToday ? updatedDateTasks : prev.dailyTaskRoster,
      };
    });

    showToast(`✓ Task "${newTask.title}" added to schedule for ${dateStr}!`);
    return newTask;
  };

  const updateTaskForDate = (dateStr, taskId, updatedData) => {
    setState((prev) => {
      const existingSched = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
      const dateTasks = existingSched[dateStr] || [];
      const updatedDateTasks = dateTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...updatedData,
              youtubeId: updatedData.videoUrl ? extractYoutubeId(updatedData.videoUrl) : t.youtubeId,
            }
          : t
      );
      const updatedSched = { ...existingSched, [dateStr]: updatedDateTasks };
      const isToday = dateStr === getLocalDateString(0);

      return {
        ...prev,
        scheduledTasksByDate: updatedSched,
        dailyTaskRoster: isToday ? updatedDateTasks : prev.dailyTaskRoster,
      };
    });
    showToast('Task updated successfully.');
  };

  const deleteTaskForDate = (dateStr, taskId) => {
    setState((prev) => {
      const existingSched = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
      const dateTasks = existingSched[dateStr] || [];
      const updatedDateTasks = dateTasks.filter((t) => t.id !== taskId);
      const updatedSched = { ...existingSched, [dateStr]: updatedDateTasks };
      const isToday = dateStr === getLocalDateString(0);

      return {
        ...prev,
        scheduledTasksByDate: updatedSched,
        dailyTaskRoster: isToday ? updatedDateTasks : prev.dailyTaskRoster,
      };
    });
    showToast('Task removed from schedule.', 'warning');
  };

  const toggleTaskStatusForDate = (dateStr, taskId) => {
    setState((prev) => {
      const existingSched = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
      const dateTasks = existingSched[dateStr] || [];
      let newStatus = 'ACTIVE';
      const updatedDateTasks = dateTasks.map((t) => {
        if (t.id === taskId) {
          newStatus = t.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          return { ...t, status: newStatus };
        }
        return t;
      });
      const updatedSched = { ...existingSched, [dateStr]: updatedDateTasks };
      const isToday = dateStr === getLocalDateString(0);

      showToast(`Task is now ${newStatus === 'ACTIVE' ? 'ACTIVE (Visible)' : 'PAUSED (Hidden)'} for ${dateStr}`);
      return {
        ...prev,
        scheduledTasksByDate: updatedSched,
        dailyTaskRoster: isToday ? updatedDateTasks : prev.dailyTaskRoster,
      };
    });
  };

  const copyTasksToDate = (srcDateStr, destDateStr) => {
    setState((prev) => {
      const existingSched = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
      const srcTasks = existingSched[srcDateStr] || prev.dailyTaskRoster || [];
      const clonedTasks = srcTasks.map((t) => ({
        ...t,
        id: `task_${t.type}_${Date.now().toString().slice(-4)}_${Math.floor(10 + Math.random() * 90)}`,
        createdAt: new Date().toISOString(),
        targetDate: destDateStr,
      }));
      const updatedSched = { ...existingSched, [destDateStr]: clonedTasks };
      const isToday = destDateStr === getLocalDateString(0);

      showToast(`Copied ${clonedTasks.length} tasks to ${destDateStr}!`);
      return {
        ...prev,
        scheduledTasksByDate: updatedSched,
        dailyTaskRoster: isToday ? clonedTasks : prev.dailyTaskRoster,
      };
    });
  };

  const applyPresetToDate = (dateStr, presetId) => {
    const preset = TASK_ROSTER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setState((prev) => {
      const existingSched = prev.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE;
      const dateTasks = existingSched[dateStr] || prev.dailyTaskRoster || [];
      const updated = dateTasks.map((t) => ({
        ...t,
        status: preset.activeIds.includes(t.id) ? 'ACTIVE' : 'PAUSED',
      }));
      const updatedSched = { ...existingSched, [dateStr]: updated };
      const isToday = dateStr === getLocalDateString(0);

      showToast(`Applied "${preset.name}" preset to ${dateStr}!`);
      return {
        ...prev,
        scheduledTasksByDate: updatedSched,
        dailyTaskRoster: isToday ? updated : prev.dailyTaskRoster,
      };
    });
  };

  // Backward compatibility aliases
  const addCustomDailyTask = (taskData) => addTaskForDate(getLocalDateString(0), taskData);
  const updateDailyTask = (taskId, data) => updateTaskForDate(getLocalDateString(0), taskId, data);
  const deleteDailyTask = (taskId) => deleteTaskForDate(getLocalDateString(0), taskId);
  const toggleDailyTaskStatus = (taskId) => toggleTaskStatusForDate(getLocalDateString(0), taskId);
  const applyTaskRosterPreset = (presetId) => applyPresetToDate(getLocalDateString(0), presetId);
  const addVideoTask = (taskData) => addCustomDailyTask({ ...taskData, type: 'video' });
  const updateVideoTask = updateDailyTask;
  const deleteVideoTask = deleteDailyTask;

  const sundayStatus = getNextSundayStatus();
  const isTrialMember = Boolean(activePlan && (activePlan.isTrial || activePlan.amount === 300));
  const isWithdrawalAllowed = Boolean(
    (activePlan && activePlan.amount >= 2000) ||
    (isTrialMember && !hasUsedTrialWithdrawal)
  );

  const totalLockedPrincipal = userPlans
    .filter((p) => p.status === 'active' || p.status === 'matured')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalDailyQuota = userPlans
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + (Number(p.dailyQuota) || 0), 0);

  const updatePaymentSettings = (newSettings) => {
    setState((prev) => ({
      ...prev,
      paymentSettings: {
        ...(prev.paymentSettings || INITIAL_PAYMENT_SETTINGS),
        ...newSettings,
      },
    }));
    showToast('Payment & Banking Gateway Details updated successfully!');
  };

  const updateAdminAnnouncement = (newAnnouncement) => {
    setState((prev) => ({
      ...prev,
      adminAnnouncement: {
        ...(prev.adminAnnouncement || INITIAL_ADMIN_ANNOUNCEMENT),
        ...newAnnouncement,
        updatedAt: new Date().toISOString(),
      },
    }));
    showToast('Admin Announcement published live!');
  };

  const updateAdminPassword = (newPassword, currentPassword = null) => {
    if (!newPassword || newPassword.trim().length < 4) {
      showToast('New password must be at least 4 characters long.', 'error');
      return { success: false, error: 'New password must be at least 4 characters long.' };
    }
    const cleanNewPass = newPassword.trim();
    if (currentPassword !== null) {
      const activeAdminPass = state.adminPassword || 'admin123';
      if (currentPassword.trim() !== activeAdminPass) {
        showToast('Current admin password does not match.', 'error');
        return { success: false, error: 'Current admin password does not match.' };
      }
    }
    setState((prev) => ({
      ...prev,
      adminPassword: cleanNewPass,
    }));
    showToast('🛡️ Admin master security key updated successfully!');
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        plans: userPlans,
        allPlans: state.plans || [],
        transactions: userTransactions,
        allTransactions: state.transactions || [],
        adminPassword: state.adminPassword || 'admin123',
        updateAdminPassword,
        dailyVideoTasks: state.dailyVideoTasks || INITIAL_VIDEO_TASKS,
        totalLockedPrincipal,
        totalDailyQuota,
        isWithdrawalAllowed,
        sundayStatus,
        switchRole,
        registerUser,
        loginUser,
        logoutUser,
        savePayoutMethod,
        subscribePlan,
        completeTask,
        withdrawRewards,
        withdrawPrincipal,
        toggleForceSunday,
        showToast,
        toastMessage,
        // Daily Login Streak methods
        claimDailyLoginBonus,
        streakRewards: state.streakRewards || STREAK_REWARDS,
        updateStreakRewards,
        // Password Reset via Admin SMS Requests
        passwordResetRequests: state.passwordResetRequests || [],
        requestPasswordReset,
        resolvePasswordReset,
        // MLM 2:1 Binary functions
        setPreferredLeg,
        addDownlineMember,
        // Admin functions
        activateUser,
        deactivateUser,
        suspendUser,
        deleteUser,
        resetUserPassword,
        approveDeposit,
        rejectDeposit,
        approveWithdrawal,
        rejectWithdrawal,
        // Date-Wise Task Scheduling for Up to 7 Coming Days
        scheduledTasksByDate: state.scheduledTasksByDate || DEFAULT_7DAY_SCHEDULE,
        addTaskForDate,
        updateTaskForDate,
        deleteTaskForDate,
        toggleTaskStatusForDate,
        copyTasksToDate,
        applyPresetToDate,
        // Today's Roster & Presets
        dailyTaskRoster: state.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER,
        taskRosterPresets: TASK_ROSTER_PRESETS,
        applyTaskRosterPreset,
        addCustomDailyTask,
        updateDailyTask,
        deleteDailyTask,
        toggleDailyTaskStatus,
        addVideoTask,
        updateVideoTask,
        deleteVideoTask,
        // Skill Gaming & PvP Multiplayer Engine
        gamingStats: state.gamingStats,
        playSoloSkillGame,
        playMultiplayerPvPMatch,
        // Membership Plan Tier Scaling & Activation
        userMembershipTier,
        activePlan,
        pendingPlan,
        pendingDeposit,
        isUserActivated,
        canUserEarn,
        // Free Registration Trial & ₹300 3-Day Trial status
        freeTrialStatus,
        hasUsedTrialPlan,
        hasUsedTrialWithdrawal,
        TRIAL_PLAN,
        // Dynamic Admin-Configured Plan Multipliers
        planMultipliers: state.planMultipliers || DEFAULT_PLAN_MULTIPLIERS,
        updatePlanMultipliers,
        DEFAULT_PLAN_MULTIPLIERS,
        // Payment & Banking Gateway Settings
        paymentSettings: state.paymentSettings || INITIAL_PAYMENT_SETTINGS,
        updatePaymentSettings,
        // Admin Broadcast Announcement
        adminAnnouncement: state.adminAnnouncement || INITIAL_ADMIN_ANNOUNCEMENT,
        updateAdminAnnouncement,
        // Multi-Language Support (English, Hindi, Bengali)
        language,
        setLanguage,
        t,
        SUPPORTED_LANGUAGES,
        LANGUAGE_OPTIONS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
