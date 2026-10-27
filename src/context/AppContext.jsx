import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { calculateEarnings, getNextSundayStatus } from '../utils/finance';

const AppContext = createContext();

const STORAGE_KEY = 'earnflow_pro_state_v6';

export const STREAK_REWARDS = {
  1: 5,
  2: 5,
  3: 5,
  4: 7,
  5: 7,
  6: 7,
  7: 10,
};

export const STREAK_SCHEDULE = [
  { day: 1, reward: 5, label: 'Day 1' },
  { day: 2, reward: 5, label: 'Day 2' },
  { day: 3, reward: 5, label: 'Day 3' },
  { day: 4, reward: 7, label: 'Day 4' },
  { day: 5, reward: 7, label: 'Day 5' },
  { day: 6, reward: 7, label: 'Day 6' },
  { day: 7, reward: 10, label: 'Day 7' },
];

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
    planMonthlyRate: 0.055,
    planTitle: '1 Month Starter Sprint',
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
    video_1: true,
    music_1: false,
    spin_1: false,
    scratch_1: false,
    memory_1: false,
  },
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
      meta: '3 Months Lock-in Plan (PLN-9421)',
    },
    {
      id: 'TXN-712890',
      type: 'DEPOSIT',
      title: 'Plan Subscription Deposit',
      amount: 5000.00,
      timestamp: new Date(Date.now() - 32 * 86400000).toISOString(),
      status: 'COMPLETED',
      meta: '1 Month Lock-in Plan (PLN-3819)',
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
    currentDay: 3, // Day 1-3 = ₹5, Day 4-6 = ₹7, Day 7 = ₹10
    lastClaimedDate: new Date(Date.now() - 25 * 3600000).toISOString(),
    claimedToday: false,
    totalStreakEarned: 10.00,
    history: [true, true, false, false, false, false, false],
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
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + lockinPeriod.months * 30);

    const newPlan = {
      id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || `${lockinPeriod.label} Tier Plan`,
      amount: numAmount,
      months: lockinPeriod.months,
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
     DAILY LOGIN STREAK BONUS SYSTEM:
     - Day 1-3: ₹5/day
     - Day 4-6: ₹7/day
     - Day 7: ₹10 (Grand Weekly Jackpot Bonus)
     - Reset rule: If a day is missed, streak restarts at Day 1
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
      history: [false, false, false, false, false, false, false],
    };

    if (streak.claimedToday) {
      showToast("Today's bonus has already been claimed! Next reward unlocks tomorrow.", 'warning');
      return false;
    }

    const currentDay = Math.min(7, Math.max(1, streak.currentDay || 1));
    const reward = STREAK_REWARDS[currentDay] || 5;

    const newHistory = [...(streak.history || [false, false, false, false, false, false, false])];
    newHistory[currentDay - 1] = true;

    // Next day advances: if Day 7 was claimed, user completed full 7-day streak! Loops back to Day 1
    const nextDay = currentDay >= 7 ? 1 : currentDay + 1;

    const newTxn = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'LOGIN_BONUS',
      title: `Daily Login Streak Bonus (Day ${currentDay})`,
      amount: reward,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      meta: `Attendance bonus: ₹${reward.toFixed(2)} credited! ${currentDay === 7 ? '🎉 Completed 7-day streak milestone!' : `Next reward: ₹${STREAK_REWARDS[nextDay]}/day`}`,
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
        history: newHistory,
      },
    }));

    showToast(`🎉 Day ${currentDay} Bonus Claimed! +₹${reward.toFixed(2)} added to your Task Wallet.`);
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
        history: [false, false, false, false, false, false, false],
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
