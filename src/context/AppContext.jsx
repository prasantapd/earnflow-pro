import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { calculateEarnings, getNextSundayStatus, extractYoutubeId, getMembershipTier } from '../utils/finance';

const AppContext = createContext();

const STORAGE_KEY = 'earnflow_pro_state_v10';

export const INITIAL_DAILY_TASK_ROSTER = [
  {
    id: 'vid_101',
    type: 'video',
    title: 'Brand Launch: Global Alpha Tech Review',
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
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
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
    totalShares: 980,
    description: 'Watch video for 25s and share to your Facebook feed or friends to claim reward.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
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
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

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
    description: 'All 7 tasks active (Videos, Music, 3×3 Slide, Memory Match, 10-Min Walk, Spin).',
    activeIds: ['vid_101', 'vid_102', 'music_1', 'slide3_1', 'memory_1', 'walk_1', 'spin_1'],
  },
];

export const INITIAL_VIDEO_TASKS = INITIAL_DAILY_TASK_ROSTER.filter((t) => t.type === 'video');

/* =========================================================================
   30-DAY PROGRESSIVE DAILY LOGIN STREAK REWARDS (Basic ₹2,000 Plan):
   - Week 1 (Days 1–7):   1 + 2 + 3 + 4 + 5 + 6 + 7 = ₹28
   - Week 2 (Days 8–14):  2 + 3 + 4 + 5 + 6 + 7 + 8 = ₹35
   - Week 3 (Days 15–21): 3 + 4 + 5 + 6 + 7 + 8 + 9 = ₹42
   - Week 4 (Days 22–30): 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12 = ₹72 (30 Days completion)
   - Cycle Rule: Completing Day 30 completes cycle and re-starts from Day 1.
   - Missed Day Rule: Missing any day immediately resets streak back to Day 1!
   - Scales with user's active membership plan tier multiplier (up to 4.0×).
   ========================================================================= */

export const STREAK_REWARDS = {
  // Week 1: 1+2+3+4+5+6+7
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7,
  // Week 2: 2+3+4+5+6+7+8
  8: 2, 9: 3, 10: 4, 11: 5, 12: 6, 13: 7, 14: 8,
  // Week 3: 3+4+5+6+7+8+9
  15: 3, 16: 4, 17: 5, 18: 6, 19: 7, 20: 8, 21: 9,
  // Week 4 (to 30 Days): 4+5+6+7+8+9+10 + 11+12
  22: 4, 23: 5, 24: 6, 25: 7, 26: 8, 27: 9, 28: 10,
  29: 11, 30: 12,
};

export const STREAK_WEEKS = [
  {
    weekNum: 1,
    title: 'Week 1',
    range: 'Days 1–7',
    formula: '₹1 → ₹7',
    startDay: 1,
    endDay: 7,
    baseSum: 28,
  },
  {
    weekNum: 2,
    title: 'Week 2',
    range: 'Days 8–14',
    formula: '₹2 → ₹8',
    startDay: 8,
    endDay: 14,
    baseSum: 35,
  },
  {
    weekNum: 3,
    title: 'Week 3',
    range: 'Days 15–21',
    formula: '₹3 → ₹9',
    startDay: 15,
    endDay: 21,
    baseSum: 42,
  },
  {
    weekNum: 4,
    title: 'Week 4 (30-Day Finale)',
    range: 'Days 22–30',
    formula: '₹4 → ₹12',
    startDay: 22,
    endDay: 30,
    baseSum: 72,
  },
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

const INITIAL_USERS = [
  {
    id: 'USR-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    password: 'password123',
    status: 'ACTIVE', // ACTIVE, DEACTIVATED, SUSPENDED
    suspensionReason: '',
    joinedDate: new Date(Date.now() - 35 * 86400000).toISOString(),
    totalDeposited: 15000,
    walletBalance: 1850.50,
  },
  {
    id: 'USR-102',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@invest.io',
    phone: '+91 91234 56789',
    password: 'password123',
    status: 'ACTIVE',
    suspensionReason: '',
    joinedDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    totalDeposited: 7500,
    walletBalance: 640.00,
  },
  {
    id: 'USR-103',
    name: 'Priya Patel',
    email: 'priya.patel@growth.com',
    phone: '+91 98111 22334',
    password: 'password123',
    status: 'SUSPENDED',
    suspensionReason: 'Multiple unauthorized device login attempts detected',
    joinedDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    totalDeposited: 5000,
    walletBalance: 210.00,
  },
  {
    id: 'USR-104',
    name: 'Vikram Singh',
    email: 'vikram.singh@wealth.in',
    phone: '+91 99001 88776',
    password: 'password123',
    status: 'DEACTIVATED',
    suspensionReason: 'Account paused upon user request',
    joinedDate: new Date(Date.now() - 45 * 86400000).toISOString(),
    totalDeposited: 0,
    walletBalance: 0.00,
  }
];

const INITIAL_DEPOSIT_REQUESTS = [
  {
    id: 'DEP-8021',
    userId: 'USR-101',
    userName: 'Aarav Sharma',
    amount: 10000,
    planMonths: 3,
    planDays: 90,
    planMonthlyRate: 0.060,
    planTitle: 'Quarterly Alpha Growth',
    utr: 'UTR892189283120',
    submittedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    rejectionReason: '',
  },
  {
    id: 'DEP-7910',
    userId: 'USR-102',
    userName: 'Rohan Mehta',
    amount: 5000,
    planMonths: 1,
    planDays: 30,
    planMonthlyRate: 0.055,
    planTitle: '30 Days Starter Sprint',
    utr: 'UTR772109283111',
    submittedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'PENDING',
    rejectionReason: '',
  }
];

const INITIAL_WITHDRAWAL_REQUESTS = [
  {
    id: 'WDR-9201',
    userId: 'USR-101',
    userName: 'Aarav Sharma',
    amount: 850.00,
    type: 'TASK_REWARD',
    payoutDetails: {
      type: 'upi_id',
      value: 'aarav.sharma@okhdfcbank',
      holder: 'Aarav Sharma',
    },
    submittedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    rejectionReason: '',
    disbursedUtr: '',
  },
  {
    id: 'WDR-9190',
    userId: 'USR-102',
    userName: 'Rohan Mehta',
    amount: 500.00,
    type: 'TASK_REWARD',
    payoutDetails: {
      type: 'bank',
      value: 'SBI Bank (A/C: ••••4582, IFSC: SBIN0001827)',
      holder: 'Rohan Mehta',
    },
    submittedAt: new Date(Date.now() - 95 * 60000).toISOString(),
    status: 'PENDING',
    rejectionReason: '',
    disbursedUtr: '',
  }
];

const INITIAL_STATE = {
  currentRole: 'investor', // 'investor' or 'admin'
  user: {
    id: 'USR-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    joinedDate: new Date(Date.now() - 35 * 86400000).toISOString(),
    status: 'ACTIVE',
    suspensionReason: '',
    isVerified: true,
  },
  allUsers: INITIAL_USERS,
  depositRequests: INITIAL_DEPOSIT_REQUESTS,
  withdrawalRequests: INITIAL_WITHDRAWAL_REQUESTS,
  payoutMethod: {
    type: 'upi_id',
    upiId: 'aarav.sharma@okhdfcbank',
    holderName: 'Aarav Sharma',
    savedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  rewardWallet: 1850.50,
  totalWithdrawn: 3400.00,
  plans: [
    {
      id: 'PLN-9421',
      title: 'Wealth Growth Alpha',
      amount: 10000,
      months: 3,
      days: 90,
      startDate: new Date(Date.now() - 35 * 86400000).toISOString(),
      maturityDate: new Date(Date.now() + 55 * 86400000).toISOString(),
      totalExpectedGain: 1910,
      estimatedTotalIncome: 1910,
      dailyQuota: 21.22,
      earnedSoFar: 742.70,
      status: 'active',
    },
    {
      id: 'PLN-3819',
      title: 'High Yield Sprint',
      amount: 5000,
      months: 1,
      days: 30,
      startDate: new Date(Date.now() - 32 * 86400000).toISOString(),
      maturityDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      totalExpectedGain: 275,
      estimatedTotalIncome: 275,
      dailyQuota: 9.16,
      earnedSoFar: 275.00,
      status: 'matured',
    }
  ],
  tasksCompletedToday: {
    vid_101: true,
    vid_102: false,
    music_1: false,
    slide3_1: false,
    memory_1: false,
    walk_1: false,
    spin_1: false,
    scratch_1: false,
  },
  dailyVideoTasks: INITIAL_VIDEO_TASKS,
  dailyTaskRoster: INITIAL_DAILY_TASK_ROSTER,
  transactions: [
    {
      id: 'TXN-908124',
      type: 'TASK_REWARD',
      title: 'YouTube Video Watch Reward',
      amount: 35.00,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'COMPLETED',
      meta: 'Video: How Global Yield Funds Work',
    },
    {
      id: 'TXN-876120',
      type: 'WITHDRAWAL',
      title: 'Sunday Reward Payout',
      amount: 1200.00,
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: 'COMPLETED',
      meta: 'Transferred to UPI: aarav.sharma@okhdfcbank',
      payoutType: 'upi_id',
    },
    {
      id: 'TXN-761921',
      type: 'DEPOSIT',
      title: 'Plan Subscription Deposit',
      amount: 10000.00,
      timestamp: new Date(Date.now() - 35 * 86400000).toISOString(),
      status: 'COMPLETED',
      meta: '90 Days Lock-in Plan (PLN-9421)',
    },
    {
      id: 'TXN-712890',
      type: 'DEPOSIT',
      title: 'Plan Subscription Deposit',
      amount: 5000.00,
      timestamp: new Date(Date.now() - 32 * 86400000).toISOString(),
      status: 'COMPLETED',
      meta: '30 Days Lock-in Plan (PLN-3819)',
    }
  ],
  mlmNetwork: {
    referralCode: 'AARAV101',
    preferredLeg: 'AUTO', // 'LEFT', 'RIGHT', 'AUTO'
    leftVolume: 14000,
    rightVolume: 8000,
    leftCarry: 2000,
    rightCarry: 1000,
    totalPairsMatched: 6,
    lifetimeMlmEarned: 900.00,
    dailyCappedToday: 150.00,
    dailyCapLimit: 3000.00,
    binaryPairBonusRate: 0.05, // 5% on 3,000 matched pair volume = ₹150/pair
    leftMembers: [
      { id: 'USR-201', name: 'Kabir Verma', amount: 5000, joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(), leg: 'LEFT', status: 'ACTIVE' },
      { id: 'USR-202', name: 'Sunita Rao', amount: 9000, joinedAt: new Date(Date.now() - 10 * 86400000).toISOString(), leg: 'LEFT', status: 'ACTIVE' },
    ],
    rightMembers: [
      { id: 'USR-203', name: 'Manish Gupta', amount: 5000, joinedAt: new Date(Date.now() - 8 * 86400000).toISOString(), leg: 'RIGHT', status: 'ACTIVE' },
      { id: 'USR-204', name: 'Tanvi Shah', amount: 3000, joinedAt: new Date(Date.now() - 3 * 86400000).toISOString(), leg: 'RIGHT', status: 'ACTIVE' },
    ],
  },
  loginStreak: {
    currentDay: 3, // Week 1 (Day 1: ₹1, Day 2: ₹2, Day 3: ₹3 ...)
    lastClaimedDate: new Date(Date.now() - 25 * 3600000).toISOString(),
    claimedToday: false,
    totalStreakEarned: 3.00,
    history: Array.from({ length: 30 }, (_, i) => i < 2),
  },
  gamingStats: {
    totalGamingRakeCollected: 845.00, // 10% platform house rake from matches
    totalMatchesPlayed: 169,
    userMatchesPlayed: 8,
    userMatchesWon: 5,
  },
  lastWithdrawalTime: null,
  forceSunday: true, // 24/7 payouts active
};

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved state, using default:', e);
    }
    return INITIAL_STATE;
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Derive active membership plan and tiered earning multipliers
  const activePlan = (state.plans || []).find((p) => p.status === 'active');
  const userMembershipTier = getMembershipTier(activePlan);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

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
    showToast(`Switched view to ${role === 'admin' ? '🛡️ Administrator Control Center' : '👤 Investor Dashboard'}`);
  };

  // Register / Update User Profile
  const registerUser = (userData) => {
    const newId = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password || 'password123',
      joinedDate: new Date().toISOString(),
      status: 'ACTIVE',
      suspensionReason: '',
      isVerified: true,
      totalDeposited: 0,
      walletBalance: 0.00,
    };

    setState((prev) => ({
      ...prev,
      user: newUser,
      allUsers: [newUser, ...prev.allUsers],
    }));
    showToast(`Welcome, ${userData.name}! Account registered successfully.`);
    triggerCelebration();
  };

  // Update Payout Method
  const savePayoutMethod = (methodData) => {
    setState((prev) => ({
      ...prev,
      payoutMethod: {
        ...methodData,
        savedAt: new Date().toISOString(),
      },
    }));
    showToast('Payout method updated successfully! Ready for withdrawals.');
  };

  // Subscribe to or Upgrade membership tier (User can hold only 1 active plan; can upgrade, cannot downgrade)
  const subscribePlan = ({ amount, lockinPeriod, title, utrNumber }) => {
    const numAmount = Number(amount);
    const existingActivePlan = (state.plans || []).find((p) => p.status === 'active');

    // Rule: User can hold only 1 active plan, can upgrade, but cannot downgrade!
    if (existingActivePlan) {
      if (numAmount <= existingActivePlan.amount) {
        showToast(`Downgrade not permitted. You currently hold the ₹${existingActivePlan.amount.toLocaleString()} tier. You can only upgrade to a higher tier plan.`, 'error');
        return false;
      }
    }

    const isUpgrade = Boolean(existingActivePlan);
    const depositRef = `DEP-${Math.floor(1000 + Math.random() * 9000)}`;
    const utr = utrNumber || `UTR${Date.now().toString().slice(-10)}`;

    const newDepositRequest = {
      id: depositRef,
      userId: state.user?.id || 'USR-101',
      userName: state.user?.name || 'Aarav Sharma',
      amount: numAmount,
      planMonths: lockinPeriod.months,
      planDays: lockinPeriod.days || lockinPeriod.months * 30,
      planTitle: title || `${lockinPeriod.label} Tier Plan`,
      isUpgrade: isUpgrade,
      previousPlanId: existingActivePlan?.id || null,
      utr: utr,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      rejectionReason: '',
    };

    const calc = calculateEarnings(numAmount, lockinPeriod.months, lockinPeriod.tierFactor);
    const startDate = new Date();
    const totalDays = lockinPeriod.days || lockinPeriod.months * 30;
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + totalDays);

    const newPlan = {
      id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || `${lockinPeriod.label} Tier Plan`,
      amount: numAmount,
      months: lockinPeriod.months,
      days: totalDays,
      startDate: startDate.toISOString(),
      maturityDate: maturityDate.toISOString(),
      totalExpectedGain: calc.estimatedTotalIncome,
      estimatedTotalIncome: calc.estimatedTotalIncome,
      dailyQuota: calc.estimatedDailyIncome,
      estimatedDailyQuota: calc.estimatedDailyIncome,
      earnedSoFar: 0,
      status: 'active',
      isUpgrade: isUpgrade,
      depositRef: depositRef,
    };

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'DEPOSIT',
      title: isUpgrade ? 'Membership Plan Upgrade' : 'Membership Tier Subscription',
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `${lockinPeriod.label} Tier (${newPlan.id}) - UTR: ${utr}${isUpgrade ? ` [Upgraded from ${existingActivePlan.id}]` : ''}`,
    };

    setState((prev) => {
      // Mark any previous active plan as 'superseded_upgrade' to strictly guarantee ONLY 1 active plan
      const updatedPlans = (prev.plans || []).map((p) =>
        p.status === 'active' ? { ...p, status: 'superseded_upgrade' } : p
      );

      return {
        ...prev,
        plans: [newPlan, ...updatedPlans],
        depositRequests: [newDepositRequest, ...prev.depositRequests],
        transactions: [newTxn, ...prev.transactions],
      };
    });

    if (isUpgrade) {
      showToast(`Membership upgraded to ₹${numAmount.toLocaleString()} tier! Higher estimated task income unlocked.`);
    } else {
      showToast(`Successfully subscribed to ₹${numAmount.toLocaleString()} (${lockinPeriod.label}) plan!`);
    }
    triggerCelebration();
    return newPlan;
  };

  // Complete a daily task and earn monetary reward
  const completeTask = ({ taskId, taskTitle, rewardAmount, meta }) => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Cannot perform tasks or claim rewards. Contact support.', 'error');
      return;
    }
    if (state.user?.status === 'DEACTIVATED') {
      showToast('Account deactivated: Please reactivate your account in profile.', 'error');
      return;
    }

    const numReward = Number(rewardAmount);

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'TASK_REWARD',
      title: taskTitle,
      amount: numReward,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: meta || 'Daily task completed successfully',
    };

    setState((prev) => ({
      ...prev,
      rewardWallet: +(prev.rewardWallet + numReward).toFixed(2),
      tasksCompletedToday: {
        ...prev.tasksCompletedToday,
        [taskId]: true,
      },
      dailyVideoTasks: (prev.dailyVideoTasks || []).map((t) =>
        t.id === taskId ? { ...t, totalShares: (t.totalShares || 0) + 1 } : t
      ),
      transactions: [newTxn, ...prev.transactions],
    }));

    showToast(`+₹${numReward.toFixed(2)} credited to your Reward Wallet!`);
    triggerCelebration();
  };

  // Withdraw accumulated rewards (24/7 Instant Payout Engine with ₹100 min & 24h cooldown)
  const withdrawRewards = (amountToWithdraw, methodDetails) => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Withdrawals are blocked. Contact admin.', 'error');
      return false;
    }
    if (state.user?.status === 'DEACTIVATED') {
      showToast('Account deactivated: Please reactivate your account first.', 'error');
      return false;
    }

    const amount = Number(amountToWithdraw);
    if (amount <= 0 || amount > state.rewardWallet) {
      showToast('Invalid withdrawal amount', 'error');
      return false;
    }

    // Solvency Protection Rule: Min ₹100 withdrawal to avoid payment gateway fee erosion
    if (amount < 100) {
      showToast('Minimum withdrawal amount is ₹100 to prevent payment gateway fee loss.', 'error');
      return false;
    }

    // Rate Limiting Rule: 1 withdrawal per 24 hours per user
    if (state.lastWithdrawalTime && !state.forceSunday) {
      const elapsedHours = (Date.now() - new Date(state.lastWithdrawalTime).getTime()) / (1000 * 3600);
      if (elapsedHours < 24) {
        const hoursRemaining = Math.max(1, Math.ceil(24 - elapsedHours));
        showToast(`24-Hour Limit: 1 withdrawal allowed per 24 hours. Next withdrawal unlocks in ${hoursRemaining}h (or toggle Test Mode to bypass).`, 'error');
        return false;
      }
    }

    const currentMethod = methodDetails || state.payoutMethod;
    let payoutDesc = '';
    if (currentMethod?.type === 'upi_id') {
      payoutDesc = `UPI: ${currentMethod.upiId}`;
    } else if (currentMethod?.type === 'upi_phone') {
      payoutDesc = `UPI Phone: ${currentMethod.upiPhone}`;
    } else if (currentMethod?.type === 'bank') {
      payoutDesc = `Bank: ${currentMethod.bankName} (A/C: ••••${currentMethod.accountNumber.slice(-4)})`;
    }

    const newWithdrawalRequest = {
      id: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: state.user?.id || 'USR-101',
      userName: state.user?.name || 'Aarav Sharma',
      amount: amount,
      type: 'TASK_REWARD',
      payoutDetails: {
        type: currentMethod.type,
        value: payoutDesc,
        holder: currentMethod.holderName || state.user?.name,
      },
      submittedAt: new Date().toISOString(),
      status: 'APPROVED', // Instant settlement mode
      rejectionReason: '',
      disbursedUtr: `IMPS${Date.now().toString().slice(-9)}`,
    };

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'WITHDRAWAL',
      title: '24/7 Instant Reward Payout',
      amount: amount,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `Instant IMPS transfer to ${payoutDesc}`,
      payoutMethod: currentMethod,
    };

    setState((prev) => ({
      ...prev,
      rewardWallet: +(prev.rewardWallet - amount).toFixed(2),
      totalWithdrawn: +(prev.totalWithdrawn + amount).toFixed(2),
      lastWithdrawalTime: new Date().toISOString(),
      withdrawalRequests: [newWithdrawalRequest, ...prev.withdrawalRequests],
      transactions: [newTxn, ...prev.transactions],
    }));

    showToast(`₹${amount.toLocaleString()} disbursed instantly via IMPS 24/7!`);
    triggerCelebration();
    return newTxn;
  };

  /* =========================================================================
     30-DAY PROGRESSIVE DAILY LOGIN STREAK SYSTEM (Basic ₹2,000 Plan):
     - Week 1 (Days 1–7):   ₹1 + ₹2 + ₹3 + ₹4 + ₹5 + ₹6 + ₹7
     - Week 2 (Days 8–14):  ₹2 + ₹3 + ₹4 + ₹5 + ₹6 + ₹7 + ₹8
     - Week 3 (Days 15–21): ₹3 + ₹4 + ₹5 + ₹6 + ₹7 + ₹8 + ₹9
     - Week 4 (Days 22–30): ₹4 + ₹5 + ₹6 + ₹7 + ₹8 + ₹9 + ₹10 + ₹11 + ₹12 (30 Days)
     - Completion Rule: Day 30 claims grand finish, then restarts from Day 1
     - Missed Day Rule: Missing any single day resets streak back to Day 1
     - Membership Multiplier: Scales with active plan tier (up to 4.0×)
     ========================================================================= */

  const claimDailyLoginBonus = () => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Cannot claim streak bonus. Contact support.', 'error');
      return false;
    }
    if (state.user?.status === 'DEACTIVATED') {
      showToast('Account deactivated: Please reactivate your account first.', 'error');
      return false;
    }

    const streak = state.loginStreak || {
      currentDay: 1,
      lastClaimedDate: null,
      claimedToday: false,
      totalStreakEarned: 0,
      history: Array(30).fill(false),
    };

    if (streak.claimedToday) {
      showToast("Today's bonus has already been claimed! Next reward unlocks tomorrow.", 'warning');
      return false;
    }

    const currentDay = Math.min(30, Math.max(1, streak.currentDay || 1));
    const baseReward = STREAK_REWARDS[currentDay] || (currentDay >= 30 ? 12 : 1);
    const reward = Math.round(baseReward * userMembershipTier.loginMultiplier);

    const newHistory = [...(streak.history || Array(30).fill(false))];
    newHistory[currentDay - 1] = true;

    // Next day advances: if Day 30 was claimed, user completed full 30-day streak! Loops back to Day 1
    const isCompletedMonth = currentDay >= 30;
    const nextDay = isCompletedMonth ? 1 : currentDay + 1;

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'LOGIN_BONUS',
      title: `Daily Login Streak Bonus (Day ${currentDay} of 30)`,
      amount: reward,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `Attendance bonus: ₹${reward.toFixed(2)} (${userMembershipTier.tierBadge} ${userMembershipTier.loginMultiplier}× Multiplier) credited! ${isCompletedMonth ? '🎉 Completed full 30-day streak cycle! Restarting Day 1 tomorrow.' : `Next reward: Day ${nextDay} (₹${Math.round((STREAK_REWARDS[nextDay] || 1) * userMembershipTier.loginMultiplier)})`}`,
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

    if (isCompletedMonth) {
      showToast(`🎉 Day 30 Grand Finish Claimed! +₹${reward.toFixed(2)} added! 30-day cycle complete, restarts Day 1.`);
    } else {
      showToast(`🎉 Day ${currentDay} Bonus Claimed! +₹${reward.toFixed(2)} added to your Task Wallet.`);
    }
    triggerCelebration();
    return true;
  };

  const resetDailyStreak = () => {
    setState((prev) => ({
      ...prev,
      loginStreak: {
        currentDay: 1,
        lastClaimedDate: null,
        claimedToday: false,
        totalStreakEarned: prev.loginStreak?.totalStreakEarned || 0,
        history: Array(30).fill(false),
      },
    }));
    showToast('Streak broken! Simulated missed day — reset to Day 1.', 'warning');
  };

  const fastForwardNextDay = () => {
    setState((prev) => {
      const cur = prev.loginStreak || {};
      return {
        ...prev,
        loginStreak: {
          ...cur,
          claimedToday: false,
          lastClaimedDate: new Date(Date.now() - 25 * 3600000).toISOString(),
        },
        lastWithdrawalTime: null, // also resets withdrawal cooldown for testing!
      };
    });
    showToast('Fast-forwarded 24 hours! Daily login bonus and withdrawal cooldown unlocked.');
  };

  // Withdraw principal for matured plan
  const withdrawPrincipal = (planId) => {
    const plan = state.plans.find((p) => p.id === planId);
    if (!plan) return false;

    const newWithdrawalRequest = {
      id: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: state.user?.id || 'USR-101',
      userName: state.user?.name || 'Aarav Sharma',
      amount: plan.amount,
      type: 'PRINCIPAL_WITHDRAWAL',
      planId: planId,
      payoutDetails: {
        type: state.payoutMethod?.type || 'upi_id',
        value: state.payoutMethod?.upiId || 'Bank/UPI',
        holder: state.user?.name,
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
      plans: prev.plans.map((p) =>
        p.id === planId ? { ...p, status: 'principal_withdrawn' } : p
      ),
      totalWithdrawn: +(prev.totalWithdrawn + plan.amount).toFixed(2),
      withdrawalRequests: [newWithdrawalRequest, ...prev.withdrawalRequests],
      transactions: [newTxn, ...prev.transactions],
    }));

    showToast(`Full principal ₹${plan.amount.toLocaleString()} refunded to your account!`);
    triggerCelebration();
    return true;
  };

  /* =========================================================================
     SKILL GAMING & PVP MULTIPLAYER ENGINE:
     - Strict Wallet Separation: Entry fees deducted strictly from Task Wallet
     - Membership/Deposit Principal is 100% locked & safe (cannot be gambled)
     - 10% Platform House Rake: Deducted from gross pool before winner payout
     - Solo Puzzle Games: Solved within countdown wins prize
     - Multiplayer PvP: 1st Rank takes net pool (90% after 10% platform commission)
     ========================================================================= */

  const playSoloSkillGame = ({ gameId, gameTitle, entryFee, rewardAmount, won }) => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Cannot play games. Contact support.', 'error');
      return false;
    }

    const fee = Number(entryFee) || 0;
    const reward = Number(rewardAmount) || 0;

    // Deduct entry fee when starting match
    if (fee > 0) {
      if (state.rewardWallet < fee) {
        showToast(`Insufficient Task Wallet! Entry fee is ₹${fee}. You cannot use locked membership capital.`, 'error');
        return false;
      }

      const feeTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'GAME_ENTRY',
        title: `${gameTitle} Entry Fee`,
        amount: -fee,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        meta: `Skill game entry fee deducted from Task Wallet (100% safe)`,
      };

      setState((prev) => ({
        ...prev,
        rewardWallet: +(prev.rewardWallet - fee).toFixed(2),
        transactions: [feeTxn, ...prev.transactions],
        gamingStats: {
          ...prev.gamingStats,
          totalMatchesPlayed: (prev.gamingStats?.totalMatchesPlayed || 0) + 1,
          userMatchesPlayed: (prev.gamingStats?.userMatchesPlayed || 0) + 1,
        },
      }));

      return true;
    }

    // Handle game win settlement
    if (won && reward > 0) {
      const winTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'TASK_REWARD',
        title: `🏆 ${gameTitle} Win Prize`,
        amount: reward,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        meta: `Solved puzzle within countdown time limit! Reward credited.`,
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
      return true;
    }

    return true;
  };

  const playMultiplayerPvPMatch = ({ gameTitle, playersCount, entryFee, userRank }) => {
    if (state.user?.status === 'SUSPENDED') {
      showToast('Account suspended: Cannot join PvP arenas. Contact support.', 'error');
      return false;
    }

    const fee = Number(entryFee) || 5;
    const players = Number(playersCount) || 2;
    const grossPot = fee * players;
    const platformCommission = +(grossPot * 0.10).toFixed(2); // 10% platform house rake
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

  /* =========================================================================
     MLM 2:1 BINARY REFERRAL ENGINE:
     - 2:1 or 1:2 Pair Matching on Deposit Business Volume
     - Solvency Protection: 5% on matched pair volume (₹150 / ₹3000 pair)
     - Daily capping of ₹3,000 / day to protect admin against unlimited liabilities
     - Lifetime bonus crediting directly to wallet
     ========================================================================= */

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
    const memberName = name?.trim() || `Downline-${Math.floor(100 + Math.random() * 900)}`;

    setState((prev) => {
      const mlm = prev.mlmNetwork || {
        referralCode: 'AARAV101',
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

      // Determine placement leg: if AUTO, place in the weaker carry leg to maximize pair matches!
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

      // 2:1 or 1:2 Pair Matching Algorithm:
      // Standard binary unit = ₹1,000. 1 Pair requires 2000 on Left & 1000 on Right OR 1000 on Left & 2000 on Right (₹3,000 paired volume).
      let pairsMatchedNow = 0;
      let bonusEarnedNow = 0;
      const PAIR_BONUS = 150; // ₹150 per matched pair (5% on ₹3,000 paired volume)

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

      // Solvency Protection: Daily Cap check
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

    showToast(`New downline added to ${leg || 'weaker'} leg with ₹${depositAmt.toLocaleString()}!`);
    triggerCelebration();
  };

  /* =========================================================================
     ADMIN CONTROL METHODS:
     - User activation, deactivation, suspension, deletion, password reset
     - Deposit and withdrawal approvals
     ========================================================================= */

  const activateUser = (userId) => {
    setState((prev) => {
      const updatedUsers = prev.allUsers.map((u) =>
        u.id === userId ? { ...u, status: 'ACTIVE', suspensionReason: '' } : u
      );
      const updatedCurUser = prev.user?.id === userId ? { ...prev.user, status: 'ACTIVE', suspensionReason: '' } : prev.user;
      return { ...prev, allUsers: updatedUsers, user: updatedCurUser };
    });
    showToast(`User ${userId} has been ACTIVATED.`);
  };

  const deactivateUser = (userId) => {
    setState((prev) => {
      const updatedUsers = prev.allUsers.map((u) =>
        u.id === userId ? { ...u, status: 'DEACTIVATED', suspensionReason: 'Deactivated by Administrator' } : u
      );
      const updatedCurUser = prev.user?.id === userId ? { ...prev.user, status: 'DEACTIVATED', suspensionReason: 'Deactivated by Administrator' } : prev.user;
      return { ...prev, allUsers: updatedUsers, user: updatedCurUser };
    });
    showToast(`User ${userId} has been DEACTIVATED.`, 'warning');
  };

  const suspendUser = (userId, reason) => {
    const suspReason = reason || 'Policy violation / Security audit';
    setState((prev) => {
      const updatedUsers = prev.allUsers.map((u) =>
        u.id === userId ? { ...u, status: 'SUSPENDED', suspensionReason: suspReason } : u
      );
      const updatedCurUser = prev.user?.id === userId ? { ...prev.user, status: 'SUSPENDED', suspensionReason: suspReason } : prev.user;
      return { ...prev, allUsers: updatedUsers, user: updatedCurUser };
    });
    showToast(`User ${userId} SUSPENDED: ${suspReason}`, 'error');
  };

  const deleteUser = (userId) => {
    setState((prev) => ({
      ...prev,
      allUsers: prev.allUsers.filter((u) => u.id !== userId),
    }));
    showToast(`User ${userId} permanently DELETED from database.`, 'error');
  };

  const resetUserPassword = (userId, newPassword) => {
    setState((prev) => ({
      ...prev,
      allUsers: prev.allUsers.map((u) =>
        u.id === userId ? { ...u, password: newPassword } : u
      ),
    }));
    showToast(`Password for ${userId} reset to: "${newPassword}"`);
  };

  const approveDeposit = (depositId) => {
    setState((prev) => {
      const dep = prev.depositRequests.find((d) => d.id === depositId);
      if (!dep) return prev;

      const calc = calculateEarnings(dep.amount, dep.planMonths);
      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setDate(startDate.getDate() + dep.planMonths * 30);

      const approvedPlan = {
        id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
        title: dep.planTitle,
        amount: dep.amount,
        months: dep.planMonths,
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
        totalExpectedGain: calc.estimatedTotalIncome,
        estimatedTotalIncome: calc.estimatedTotalIncome,
        dailyQuota: calc.estimatedDailyIncome,
        estimatedDailyQuota: calc.estimatedDailyIncome,
        earnedSoFar: 0,
        status: 'active',
        depositRef: dep.id,
      };

      const newTxn = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'DEPOSIT',
        title: 'Membership Tier Deposit Verified & Approved',
        amount: dep.amount,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        meta: `Approved by Admin • Ref: ${dep.id} (UTR: ${dep.utr})`,
      };

      // Only 1 active plan permitted: mark any other active plan as superseded
      const updatedPlans = (prev.plans || []).map((p) =>
        p.status === 'active' ? { ...p, status: 'superseded_upgrade' } : p
      );

      return {
        ...prev,
        plans: [approvedPlan, ...updatedPlans],
        depositRequests: prev.depositRequests.map((d) =>
          d.id === depositId ? { ...d, status: 'APPROVED' } : d
        ),
        transactions: [newTxn, ...prev.transactions],
      };
    });
    showToast(`Deposit ${depositId} APPROVED! Plan activated.`);
    triggerCelebration();
  };

  const rejectDeposit = (depositId, reason) => {
    const rejReason = reason || 'Payment UTR verification failed';
    setState((prev) => ({
      ...prev,
      depositRequests: prev.depositRequests.map((d) =>
        d.id === depositId ? { ...d, status: 'REJECTED', rejectionReason: rejReason } : d
      ),
    }));
    showToast(`Deposit ${depositId} REJECTED: ${rejReason}`, 'error');
  };

  const approveWithdrawal = (withdrawalId, customUtr) => {
    const utr = customUtr || `IMPS${Date.now().toString().slice(-9)}`;
    setState((prev) => ({
      ...prev,
      withdrawalRequests: prev.withdrawalRequests.map((w) =>
        w.id === withdrawalId ? { ...w, status: 'APPROVED', disbursedUtr: utr } : w
      ),
    }));
    showToast(`Withdrawal ${withdrawalId} APPROVED & Disbursed! IMPS UTR: ${utr}`);
    triggerCelebration();
  };

  const rejectWithdrawal = (withdrawalId, reason) => {
    const rejReason = reason || 'Invalid UPI / Bank Account details provided';
    setState((prev) => {
      const req = prev.withdrawalRequests.find((w) => w.id === withdrawalId);
      if (!req) return prev;

      // Revert funds back to user's wallet
      const refundAmount = req.amount;
      return {
        ...prev,
        rewardWallet: +(prev.rewardWallet + refundAmount).toFixed(2),
        totalWithdrawn: Math.max(0, +(prev.totalWithdrawn - refundAmount).toFixed(2)),
        withdrawalRequests: prev.withdrawalRequests.map((w) =>
          w.id === withdrawalId ? { ...w, status: 'REJECTED', rejectionReason: rejReason } : w
        ),
      };
    });
    showToast(`Withdrawal ${withdrawalId} REJECTED. Funds reverted to user wallet.`, 'error');
  };

  // Toggle force Sunday for demoing/testing
  const toggleForceSunday = () => {
    setState((prev) => {
      const next = !prev.forceSunday;
      showToast(next ? '⚡ Sunday Mode Activated! Withdrawals are now open.' : 'Sunday Mode disabled. Real-time countdown restored.');
      return { ...prev, forceSunday: next };
    });
  };

  // Reset demo state if needed
  const resetDemoState = () => {
    setState(INITIAL_STATE);
    showToast('Platform reset to fresh state.');
  };

  // Admin Task Orchestrator: Apply preset combo (e.g. Video + Song + 3x3, Video + 2 Games + Walk)
  const applyTaskRosterPreset = (presetId) => {
    const preset = TASK_ROSTER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setState((prev) => {
      const roster = prev.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER;
      const updated = roster.map((t) => ({
        ...t,
        status: preset.activeIds.includes(t.id) ? 'ACTIVE' : 'PAUSED',
      }));
      showToast(`✓ Applied Daily Task Combo: "${preset.name}"!`);
      return {
        ...prev,
        dailyTaskRoster: updated,
      };
    });
  };

  // Admin Task Management: Add new custom task of ANY type
  const addCustomDailyTask = (taskData) => {
    const type = taskData.type || 'video';
    const newId = `task_${type}_${Date.now().toString().slice(-4)}`;
    const newTask = {
      id: newId,
      type: type,
      title: taskData.title || 'Daily Engagement Task',
      category: taskData.category || (type === 'video' ? 'Video & Share' : type === 'walk' ? 'Fitness Tracker' : type === 'slide3' ? 'Skill Puzzle' : type === 'memory' ? 'Brain Game' : type === 'music' ? 'Focus Audio' : 'Special Task'),
      platform: taskData.platform || (type === 'video' ? 'YouTube' : 'EarnFlow App'),
      videoUrl: taskData.videoUrl || (type === 'video' ? 'https://www.youtube.com/watch?v=y9u2eQy5fmg' : ''),
      youtubeId: type === 'video' ? extractYoutubeId(taskData.videoUrl || 'y9u2eQy5fmg') : '',
      reward: Number(taskData.reward) || 35.00,
      duration: Number(taskData.duration) || (type === 'walk' ? 600 : type === 'slide3' || type === 'memory' ? 60 : 20),
      shareRequired: taskData.shareRequired !== false,
      sharePlatform: taskData.sharePlatform || 'Facebook & Friends',
      status: 'ACTIVE',
      totalShares: 0,
      description: taskData.description || (
        type === 'walk' ? 'Walk for 10 minutes (1,200 steps) to verify health activity.' :
        type === 'slide3' ? 'Arrange numbers 1-8 in 3x3 grid within 60s.' :
        type === 'memory' ? 'Pair 6 wealth icons within 60s countdown.' :
        type === 'music' ? 'Listen to ambient audio for 20s.' :
        'Watch video and share to your social network.'
      ),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      dailyTaskRoster: [newTask, ...(prev.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER)],
    }));

    showToast(`✓ New task "${newTask.title}" published!`);
    return newTask;
  };

  // Admin Task Management: Update existing task
  const updateDailyTask = (taskId, updatedData) => {
    setState((prev) => ({
      ...prev,
      dailyTaskRoster: (prev.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER).map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...updatedData,
              youtubeId: updatedData.videoUrl ? extractYoutubeId(updatedData.videoUrl) : t.youtubeId,
            }
          : t
      ),
    }));
    showToast('Task updated successfully.');
  };

  // Admin Task Management: Delete task
  const deleteDailyTask = (taskId) => {
    setState((prev) => ({
      ...prev,
      dailyTaskRoster: (prev.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER).filter((t) => t.id !== taskId),
    }));
    showToast('Task removed from platform.', 'warning');
  };

  // Admin Task Management: Toggle task active/paused status
  const toggleDailyTaskStatus = (taskId) => {
    setState((prev) => ({
      ...prev,
      dailyTaskRoster: (prev.dailyTaskRoster || INITIAL_DAILY_TASK_ROSTER).map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          showToast(`Task is now ${nextStatus === 'ACTIVE' ? 'ACTIVE (Visible to users)' : 'PAUSED (Hidden from users)'}`);
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    }));
  };

  // Legacy aliases for backward compatibility
  const addVideoTask = (taskData) => addCustomDailyTask({ ...taskData, type: 'video' });
  const updateVideoTask = updateDailyTask;
  const deleteVideoTask = deleteDailyTask;
  const toggleVideoTaskStatusLegacy = toggleDailyTaskStatus;

  const sundayStatus = getNextSundayStatus();
  // 24/7 Anytime Payouts are active per investor policy (Min ₹100 • 1/day)
  const isWithdrawalAllowed = true;

  const totalLockedPrincipal = state.plans
    .filter((p) => p.status === 'active' || p.status === 'matured')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDailyQuota = state.plans
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.dailyQuota, 0);

  return (
    <AppContext.Provider
      value={{
        ...state,
        dailyVideoTasks: state.dailyVideoTasks || INITIAL_VIDEO_TASKS,
        totalLockedPrincipal,
        totalDailyQuota,
        isWithdrawalAllowed,
        sundayStatus,
        switchRole,
        registerUser,
        savePayoutMethod,
        subscribePlan,
        completeTask,
        withdrawRewards,
        withdrawPrincipal,
        toggleForceSunday,
        resetDemoState,
        showToast,
        toastMessage,
        // Daily Login Streak methods
        claimDailyLoginBonus,
        resetDailyStreak,
        fastForwardNextDay,
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
        // Admin Dynamic Task Orchestrator & Presets
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
        // Membership Plan Tier Scaling
        userMembershipTier,
        activePlan,
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
