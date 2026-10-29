import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { calculateEarnings, getNextSundayStatus, extractYoutubeId, getMembershipTier, formatINR } from '../utils/finance';
import { getLocalDateString, getUpcoming7Days } from '../utils/dateUtils';

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
  passwordResetRequests: [],
};

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

  // Derive active membership plan and tiered earning multipliers
  const activePlan = (state.plans || []).find((p) => p.status === 'active');
  const pendingPlan = (state.plans || []).find((p) => p.status === 'pending_approval');
  const pendingDeposit = (state.depositRequests || []).find(
    (d) => d.status === 'PENDING' && (d.userId === state.user?.id || d.userName === state.user?.name)
  );
  const userMembershipTier = getMembershipTier(activePlan);
  const isUserActivated = state.user?.status === 'ACTIVE';
  const canUserEarn = isUserActivated && Boolean(activePlan) && activePlan.status === 'active';

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state]);

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
    const refCode = userData.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) + Math.floor(100 + Math.random() * 900);
    
    const newUser = {
      id: newId,
      name: userData.name.trim(),
      email: emailLower,
      phone: phoneTrim,
      password: userData.password,
      referralCode: userData.referralCode || refCode,
      joinedDate: new Date().toISOString(),
      status: 'PENDING_ACTIVATION',
      isActivated: false,
      suspensionReason: '',
      isVerified: false,
      totalDeposited: 0,
      walletBalance: 0.00,
    };

    setState((prev) => ({
      ...prev,
      user: newUser,
      allUsers: [newUser, ...(prev.allUsers || [])],
    }));

    showToast(`Registration successful! Account created. Please select an Investment Plan and submit payment for Admin activation.`, 'info');
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
      payoutMethod: matched.payoutMethod || prev.payoutMethod || null,
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
  const subscribePlan = ({ amount, lockinPeriod, title, utrNumber }) => {
    const numAmount = Number(amount);
    const existingActivePlan = (state.plans || []).find((p) => p.status === 'active');

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
      userId: state.user?.id || 'USR-GUEST',
      userName: state.user?.name || 'Member',
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
      status: 'pending_approval', // STRICT: Requires Admin approval before becoming 'active'
      isUpgrade: isUpgrade,
      depositRef: depositRef,
      utr: utr,
    };

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'DEPOSIT',
      title: isUpgrade ? 'Plan Upgrade (Pending Admin Approval)' : 'Plan Deposit (Pending Admin Approval)',
      amount: numAmount,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      meta: `${lockinPeriod.label} Tier (${newPlan.id}) - UTR: ${utr} [Awaiting Admin Payment Verification]`,
    };

    setState((prev) => {
      return {
        ...prev,
        plans: [newPlan, ...(prev.plans || [])],
        depositRequests: [newDepositRequest, ...prev.depositRequests],
        transactions: [newTxn, ...prev.transactions],
      };
    });

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

    if (state.user?.status === 'PENDING_ACTIVATION') {
      showToast('Account pending activation! Payment approval by Admin is required before you can earn task rewards.', 'error');
      return false;
    }

    if (!activePlan || activePlan.status !== 'active') {
      showToast('Payment approval required! Your deposit must be verified and approved by Admin to activate task earnings.', 'error');
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

    if (amount < 100) {
      showToast('Minimum withdrawal amount is ₹100.', 'error');
      return false;
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

    setState((prev) => ({
      ...prev,
      rewardWallet: +(prev.rewardWallet - amount).toFixed(2),
      totalWithdrawn: +(prev.totalWithdrawn + amount).toFixed(2),
      lastWithdrawalTime: new Date().toISOString(),
      withdrawalRequests: [newWithdrawalRequest, ...prev.withdrawalRequests],
      transactions: [newTxn, ...prev.transactions],
    }));

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

    if (state.user?.status === 'PENDING_ACTIVATION') {
      showToast('Account pending activation! Payment approval by Admin is required to claim daily login bonus.', 'error');
      return false;
    }

    if (!activePlan || activePlan.status !== 'active') {
      showToast('Payment approval required! Please subscribe to an investment plan (₹2,000+) and get Admin payment verification to unlock daily bonus.', 'error');
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
     ADMIN USER & REQUEST CONTROLS
     ========================================================================= */
  const activateUser = (userId) => {
    setState((prev) => {
      const targetUser = (prev.allUsers || []).find((u) => u.id === userId);
      const updatedUsers = (prev.allUsers || []).map((u) =>
        u.id === userId ? { ...u, status: 'ACTIVE', isActivated: true, suspensionReason: '' } : u
      );
      const isCur = prev.user?.id === userId || (targetUser && prev.user?.email === targetUser.email);
      const updatedCurUser = isCur 
        ? { ...prev.user, status: 'ACTIVE', isActivated: true, suspensionReason: '' } 
        : prev.user;

      // Also activate any pending plan for this user
      const updatedPlans = (prev.plans || []).map((p) => {
        if (p.status === 'pending_approval' && (isCur || p.depositRef)) {
          return { ...p, status: 'active' };
        }
        return p;
      });

      return { ...prev, allUsers: updatedUsers, user: updatedCurUser, plans: updatedPlans };
    });
    showToast(`User ${userId} successfully ACTIVATED by Admin!`);
    triggerCelebration();
  };

  const deactivateUser = (userId) => {
    setState((prev) => {
      const updatedUsers = prev.allUsers.map((u) =>
        u.id === userId ? { ...u, status: 'DEACTIVATED', suspensionReason: 'Deactivated by Administrator' } : u
      );
      const updatedCurUser = prev.user?.id === userId ? { ...prev.user, status: 'DEACTIVATED', suspensionReason: 'Deactivated by Administrator' } : prev.user;
      return { ...prev, allUsers: updatedUsers, user: updatedCurUser };
    });
    showToast(`User ${userId} DEACTIVATED.`);
  };

  const suspendUser = (userId, reason) => {
    const r = reason || 'Suspended by Administrator';
    setState((prev) => {
      const updatedUsers = prev.allUsers.map((u) =>
        u.id === userId ? { ...u, status: 'SUSPENDED', suspensionReason: r } : u
      );
      const updatedCurUser = prev.user?.id === userId ? { ...prev.user, status: 'SUSPENDED', suspensionReason: r } : prev.user;
      return { ...prev, allUsers: updatedUsers, user: updatedCurUser };
    });
    showToast(`User ${userId} has been SUSPENDED.`);
  };

  const deleteUser = (userId) => {
    setState((prev) => {
      const updatedUsers = prev.allUsers.filter((u) => u.id !== userId);
      const updatedCurUser = prev.user?.id === userId ? null : prev.user;
      return { ...prev, allUsers: updatedUsers, user: updatedCurUser };
    });
    showToast(`User ${userId} deleted permanently.`, 'warning');
  };

  const resetUserPassword = (userId, newPassword) => {
    setState((prev) => {
      const updatedUsers = prev.allUsers.map((u) =>
        u.id === userId ? { ...u, password: newPassword } : u
      );
      return { ...prev, allUsers: updatedUsers };
    });
    showToast(`Password for user ${userId} reset successfully!`);
  };

  const updateStreakRewards = (newRewards) => {
    setState((prev) => ({
      ...prev,
      streakRewards: { ...prev.streakRewards, ...newRewards },
    }));
    showToast('Daily login streak rewards successfully updated by Admin!', 'success');
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

    setState((prev) => ({
      ...prev,
      passwordResetRequests: [newReq, ...(prev.passwordResetRequests || [])],
    }));

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

    // Reset user password
    resetUserPassword(req.userId, tempPass);

    // Update request state
    setState((prev) => ({
      ...prev,
      passwordResetRequests: (prev.passwordResetRequests || []).map((r) =>
        r.id === requestId
          ? { ...r, status: 'RESOLVED', resolvedAt: new Date().toISOString(), tempPassword: tempPass }
          : r
      ),
    }));

    return {
      success: true,
      phone: req.userPhone,
      name: req.userName,
      tempPassword: tempPass,
    };
  };

  const approveDeposit = (depositId) => {
    setState((prev) => {
      const req = prev.depositRequests.find((d) => d.id === depositId);
      if (!req) return prev;

      const calc = calculateEarnings(req.amount, req.planMonths, 1.0);
      const startDate = new Date();
      const totalDays = req.planDays || req.planMonths * 30;
      const maturityDate = new Date();
      maturityDate.setDate(startDate.getDate() + totalDays);

      const approvedPlan = {
        id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
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
        depositRef: req.id,
        utr: req.utr,
      };

      // Filter out any pending plan that was linked to this deposit
      const nonMatchingPlans = (prev.plans || []).filter((p) => p.depositRef !== req.id);
      const updatedPlans = nonMatchingPlans.map((p) =>
        req.isUpgrade && p.status === 'active' ? { ...p, status: 'superseded_upgrade' } : p
      );

      // Activate User in allUsers and current user!
      const updatedUsers = (prev.allUsers || []).map((u) => {
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

      const isCurrent = prev.user && (
        prev.user.id === req.userId ||
        prev.user.name === req.userName ||
        (prev.user.phone && req.userPhone && prev.user.phone === req.userPhone)
      );
      const updatedCurUser = isCurrent
        ? {
            ...prev.user,
            status: 'ACTIVE',
            isActivated: true,
            isVerified: true,
            suspensionReason: '',
            totalDeposited: (prev.user.totalDeposited || 0) + req.amount,
          }
        : prev.user;

      // Update matching transactions
      const updatedTxns = (prev.transactions || []).map((t) => {
        if (t.type === 'DEPOSIT' && (t.meta?.includes(req.utr) || t.title?.includes('Pending'))) {
          return { ...t, status: 'COMPLETED', title: req.isUpgrade ? 'Membership Plan Upgrade' : 'Membership Tier Subscription' };
        }
        return t;
      });

      return {
        ...prev,
        plans: [approvedPlan, ...updatedPlans],
        depositRequests: prev.depositRequests.map((d) =>
          d.id === depositId ? { ...d, status: 'APPROVED' } : d
        ),
        allUsers: updatedUsers,
        user: updatedCurUser,
        transactions: updatedTxns,
      };
    });
    showToast(`Deposit ${depositId} APPROVED! User account and membership plan activated.`);
    triggerCelebration();
  };

  const rejectDeposit = (depositId, reason) => {
    const rejReason = reason || 'Invalid UTR / Payment not received in bank account';
    setState((prev) => {
      // Remove or mark pending plan as rejected
      const updatedPlans = (prev.plans || []).filter((p) => p.depositRef !== depositId);
      return {
        ...prev,
        plans: updatedPlans,
        depositRequests: prev.depositRequests.map((d) =>
          d.id === depositId ? { ...d, status: 'REJECTED', rejectionReason: rejReason } : d
        ),
      };
    });
    showToast(`Deposit ${depositId} REJECTED. Reason: ${rejReason}`, 'error');
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
  const isWithdrawalAllowed = true;

  const totalLockedPrincipal = (state.plans || [])
    .filter((p) => p.status === 'active' || p.status === 'matured')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDailyQuota = (state.plans || [])
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.dailyQuota, 0);

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
        // Payment & Banking Gateway Settings
        paymentSettings: state.paymentSettings || INITIAL_PAYMENT_SETTINGS,
        updatePaymentSettings,
        // Admin Broadcast Announcement
        adminAnnouncement: state.adminAnnouncement || INITIAL_ADMIN_ANNOUNCEMENT,
        updateAdminAnnouncement,
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
