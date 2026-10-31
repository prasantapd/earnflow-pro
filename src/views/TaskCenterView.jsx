import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Video, 
  Music, 
  Gamepad2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  Gift, 
  Brain, 
  Wallet, 
  ArrowDownCircle, 
  Share2,
  Grid,
  Dice5,
  Trophy,
  Spade,
  Users,
  Zap,
  ShieldCheck,
  Footprints,
  Flame,
  Award,
  Crown,
  Globe,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';
import VideoTaskModal from '../components/VideoTaskModal';
import MusicTaskModal from '../components/MusicTaskModal';
import SpinWheelModal from '../components/SpinWheelModal';
import ScratchCardModal from '../components/ScratchCardModal';
import MemoryGameModal from '../components/MemoryGameModal';
import WalkTaskModal from '../components/WalkTaskModal';
import DailyStreakWidget from '../components/DailyStreakWidget';
import SlidePuzzleModal from '../components/SlidePuzzleModal';
import RealLudoModal from '../components/RealLudoModal';
import Real29CardsModal from '../components/Real29CardsModal';
import RealCallBridgeModal from '../components/RealCallBridgeModal';
import Real16GutiModal from '../components/Real16GutiModal';
import CustomTaskModal from '../components/CustomTaskModal';
import { getLocalDateString, formatFullReadableDate, getTimeUntilMidnight } from '../utils/dateUtils';

export default function TaskCenterView({ onOpenWithdraw, onOpenDeposit, setActiveTab }) {
  const { 
    user,
    rewardWallet, 
    tasksCompletedToday, 
    totalDailyQuota, 
    isWithdrawalAllowed, 
    dailyTaskRoster,
    userMembershipTier,
    activePlan,
    pendingPlan,
    pendingDeposit,
    isUserActivated,
    canUserEarn,
    freeTrialStatus,
    showToast
  } = useApp();

  // Active modals for daily tasks
  const [activeVideoTask, setActiveVideoTask] = useState(null);
  const [activeMusicTask, setActiveMusicTask] = useState(null);
  const [activeSpinTask, setActiveSpinTask] = useState(null);
  const [activeScratchTask, setActiveScratchTask] = useState(null);
  const [activeMemoryTask, setActiveMemoryTask] = useState(null);
  const [activeWalkTask, setActiveWalkTask] = useState(null);
  const [activeDailyPuzzleTask, setActiveDailyPuzzleTask] = useState(null);
  const [activeCustomTask, setActiveCustomTask] = useState(null);

  // Time remaining until 00:00 midnight auto-switch
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(() => getTimeUntilMidnight() || { hours: '00', minutes: '00', seconds: '00', formatted: '00h 00m 00s' });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilMidnight(getTimeUntilMidnight() || { hours: '00', minutes: '00', seconds: '00', formatted: '00h 00m 00s' });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real Skill Gaming Modals
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [isLudoOpen, setIsLudoOpen] = useState(false);
  const [is29CardsOpen, setIs29CardsOpen] = useState(false);
  const [isCallBridgeOpen, setIsCallBridgeOpen] = useState(false);
  const [is16GutiOpen, setIs16GutiOpen] = useState(false);

  const taskMultiplier = userMembershipTier?.taskMultiplier || 1.0;

  // Active tasks for today dynamically controlled by Admin Roster
  const activeRosterTasks = Array.isArray(dailyTaskRoster)
    ? dailyTaskRoster.filter((t) => t && t.status === 'ACTIVE')
    : [];

  const safeCompletedTasks = tasksCompletedToday || {};
  const completedCount = activeRosterTasks.filter((t) => t && safeCompletedTasks[t.id]).length;
  const totalCount = activeRosterTasks.length;
  const getTaskMultiplier = (task) => {
    if (task && Number(task.multiplierOverride) > 0) {
      return Number(task.multiplierOverride);
    }
    return taskMultiplier;
  };

  const totalPotentialIncentive = activeRosterTasks.reduce((sum, t) => {
    const mult = getTaskMultiplier(t);
    return sum + Math.round((Number(t?.reward) || 0) * mult);
  }, 0);

  // Helper for task type badges and icons
  const getTaskVisuals = (task, effectiveReward) => {
    if (!task) {
      return {
        icon: <Sparkles size={20} />,
        badgeClass: 'badge-indigo',
        badgeText: 'Task',
        accentColor: '#a78bfa',
        bgGlow: 'rgba(139, 92, 246, 0.12)',
        buttonLabel: 'Complete Task',
      };
    }
    const rewardVal = effectiveReward !== undefined ? effectiveReward : (task.reward || 0);
    switch (task.type) {
      case 'video':
        return {
          icon: <Video size={20} />,
          badgeClass: 'badge-gold',
          badgeText: `${task.duration || 20}s Video`,
          accentColor: '#f87171',
          bgGlow: 'rgba(239, 68, 68, 0.12)',
          buttonLabel: `Watch & Share (+${formatINR(rewardVal)})`,
        };
      case 'music':
        return {
          icon: <Music size={20} />,
          badgeClass: 'badge-indigo',
          badgeText: `${task.duration || 20}s Audio`,
          accentColor: '#818cf8',
          bgGlow: 'rgba(99, 102, 241, 0.12)',
          buttonLabel: `Listen Focus Track (+${formatINR(rewardVal)})`,
        };
      case 'slide3':
        return {
          icon: <Grid size={20} />,
          badgeClass: 'badge-emerald',
          badgeText: `${task.duration || 60}s Countdown`,
          accentColor: '#34d399',
          bgGlow: 'rgba(16, 185, 129, 0.12)',
          buttonLabel: `Play 3×3 Puzzle (+${formatINR(rewardVal)})`,
        };
      case 'memory':
        return {
          icon: <Brain size={20} />,
          badgeClass: 'badge-indigo',
          badgeText: `${task.duration || 60}s Countdown`,
          accentColor: '#60a5fa',
          bgGlow: 'rgba(59, 130, 246, 0.12)',
          buttonLabel: `Match Icons (+${formatINR(rewardVal)})`,
        };
      case 'walk':
        return {
          icon: <Footprints size={20} />,
          badgeClass: 'badge-emerald',
          badgeText: '10 Mins / 1,200 Steps',
          accentColor: '#10b981',
          bgGlow: 'rgba(16, 185, 129, 0.15)',
          buttonLabel: `Start 10-Min Walk (+${formatINR(rewardVal)})`,
        };
      case 'spin': {
        const minSpin = Math.round(15 * taskMultiplier);
        const maxSpin = Math.round(200 * taskMultiplier);
        return {
          icon: <RotateCw size={20} />,
          badgeClass: 'badge-gold',
          badgeText: `Lucky Wheel (₹${minSpin}–₹${maxSpin})`,
          accentColor: '#fbbf24',
          bgGlow: 'rgba(245, 158, 11, 0.12)',
          buttonLabel: `🎲 Spin Wheel & Win (Up to ₹${maxSpin})`,
        };
      }
      case 'scratch': {
        const minScratch = Math.round(15 * taskMultiplier);
        const maxScratch = Math.round(150 * taskMultiplier);
        return {
          icon: <Gift size={20} />,
          badgeClass: 'badge-gold',
          badgeText: `Scratch Card (₹${minScratch}–₹${maxScratch})`,
          accentColor: '#f59e0b',
          bgGlow: 'rgba(245, 158, 11, 0.12)',
          buttonLabel: `🎁 Scratch Card & Win (Up to ₹${maxScratch})`,
        };
      }
      default:
        return {
          icon: <Sparkles size={20} />,
          badgeClass: 'badge-indigo',
          badgeText: 'Special Task',
          accentColor: '#a78bfa',
          bgGlow: 'rgba(139, 92, 246, 0.12)',
          buttonLabel: `Complete Task (+${formatINR(rewardVal)})`,
        };
    }
  };

  const handleLaunchTask = (task) => {
    if (!canUserEarn) {
      if (setActiveTab) {
        setActiveTab('plans');
      } else if (onOpenDeposit) {
        onOpenDeposit();
      }
      showToast(freeTrialStatus?.isExpired ? 'Your 2-Day Free Trial has expired. Subscribe to the ₹300 Trial Plan or Membership Plan to continue earning.' : 'Payment approval required! Your deposit must be verified and approved by Admin before you can start daily tasks.', 'warning');
      return;
    }

    switch (task.type) {
      case 'video':
        setActiveVideoTask(task);
        break;
      case 'music':
        setActiveMusicTask(task);
        break;
      case 'slide3':
        setActiveDailyPuzzleTask(task);
        break;
      case 'memory':
        setActiveMemoryTask(task);
        break;
      case 'walk':
        setActiveWalkTask(task);
        break;
      case 'spin':
        setActiveSpinTask(task);
        break;
      case 'scratch':
        setActiveScratchTask(task);
        break;
      case 'custom':
        setActiveCustomTask(task);
        break;
      default:
        if (task.videoUrl) {
          setActiveVideoTask(task);
        } else {
          setActiveCustomTask(task);
        }
        break;
    }
  };

  return (
    <div>
      {/* FREE REGISTRATION 2-DAY PASS ACTIVE BANNER */}
      {freeTrialStatus?.canEarn && !activePlan && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            marginBottom: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(234, 88, 12, 0.14) 100%)', 
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  🎁 New User Free Pass (Day {freeTrialStatus.dayNumber} of 2 Active)
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                  Daily Tasks & Bonus Unlocked!
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  1.0× ₹2,000 Reward Rates
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                Welcome to TaskCoin! As a newly registered member, you can complete all daily tasks and claim daily login bonuses for <strong>2 consecutive days</strong>. Earnings accumulate directly to your Task Wallet. To unlock withdrawals, activate the <strong>₹300 3-Day Trial Plan</strong> or a regular Membership Plan!
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('plans')}
                  style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', borderColor: '#f472b6' }}
                >
                  ⚡ View ₹300 Trial Pass (Withdrawal Unlock) →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENDING ACTIVATION / PAYMENT APPROVAL BANNER (Only when user cannot earn) */}
      {!canUserEarn && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            marginBottom: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(234, 88, 12, 0.12) 100%)', 
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  {pendingDeposit ? '⏳ Payment Approval in Progress' : freeTrialStatus?.isExpired ? '⏰ 2-Day Free Trial Ended' : '⚠️ Account Pending Activation / Payment Approval'}
                </h3>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.3)', color: '#fef08a', fontSize: '0.65rem' }}>
                  Daily Tasks Locked
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                {pendingDeposit 
                  ? `Your payment of ₹${pendingDeposit.amount?.toLocaleString()} (UTR: ${pendingDeposit.utr}) has been submitted. Admin verification takes 5–15 minutes. Once approved, all daily task cash rewards will unlock!`
                  : freeTrialStatus?.isExpired
                    ? 'Your 2-Day Free Registration Pass has expired. Subscribe to the ₹300 3-Day Trial Plan or a regular Membership Plan to continue earning daily task rewards and unlock withdrawals.'
                    : 'Without an approved membership deposit, you cannot earn daily task rewards, login streak bonuses, or skill game prizes. Subscribe to a plan and submit your payment UTR for instant Admin activation.'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('plans')}
                  style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                >
                  {pendingDeposit ? 'Check Plans & Status →' : '👉 Choose Plan & Activate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(99, 102, 241, 0.08) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">Daily Reward Engine</span>
              <span className="badge badge-emerald">⚡ 24/7 Payouts</span>
              <span className="badge badge-cyan">📅 {formatFullReadableDate(getLocalDateString(0))}</span>
              <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> Auto-Switch at 00:00 hrs: {timeUntilMidnight?.formatted || '00h 00m 00s'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Task Earning Center</h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '650px', marginTop: '0.3rem' }}>
              Tasks are scheduled daily and automatically change at <strong>00:00 hrs midnight</strong>. Complete today's tasks to claim verified rewards. Withdraw anytime 24/7!
            </p>
          </div>

          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem 1.5rem', 
              background: 'rgba(15, 23, 42, 0.75)', 
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              minWidth: '220px'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Reward Wallet
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
              {formatINR(rewardWallet)}
            </div>
            <button 
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '0.8rem' }}
              onClick={onOpenWithdraw}
              disabled={rewardWallet < 100}
            >
              <ArrowDownCircle size={14} /> Withdraw (Min ₹100)
            </button>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ color: '#cbd5e1' }}>
              Today's Task Completion: <strong>{completedCount} / {totalCount} Done</strong> • Estimated Potential: <strong style={{ color: '#34d399' }}>{formatINR(totalPotentialIncentive)}</strong>
            </span>
            <span style={{ fontWeight: 700, color: '#34d399' }}>
              {progressPercent}% Complete
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} 
            />
          </div>
        </div>

        {/* Strict Task Completion Rule Notice */}
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            <strong style={{ color: '#60a5fa' }}>Pay-Per-Completion Rule:</strong> Payout is strictly eligible ONLY for tasks you <strong>actually complete</strong>. Any task you fail to finish, skip, or fail within the timer generates <strong style={{ color: '#f87171' }}>₹0.00 income</strong> and cannot be counted or withdrawn.
          </div>
        </div>

        {/* Membership Tier Reward Scaling Banner */}
        <div style={{ marginTop: '0.85rem', padding: '0.75rem 1.15rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc', flexShrink: 0 }}>
              <Crown size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>Membership Plan Tier:</strong>
                <span className={`badge ${userMembershipTier?.badgeClass || 'badge-cyan'}`}>{userMembershipTier?.tierBadge || 'Starter Member'}</span>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>{taskMultiplier}× Task Multiplier</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                Daily task & login streak payouts scale automatically based on your active plan tier.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Higher plans unlock up to <strong style={{ color: '#34d399' }}>4.0× task cash yield</strong>
          </span>
        </div>
      </div>

      {/* Daily Login Streak Attendance Bonus Widget */}
      <DailyStreakWidget onOpenDeposit={onOpenDeposit} />

      {/* Active Membership Plan Required Warning Banner */}
      {!activePlan && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            marginBottom: '2rem', 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '1rem' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0 }}>
              <Lock size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                Subscription Plan Required to Earn
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0 }}>
                You do not have an active membership plan yet. Daily task income and daily streak bonuses require an active plan (Starting from ₹2,000). Principal is 100% refundable at maturity!
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              if (onOpenDeposit) onOpenDeposit();
              else if (setActiveTab) setActiveTab('plans');
            }}
            style={{ fontWeight: 700 }}
          >
            Explore Plans & Subscribe →
          </button>
        </div>
      )}

      {/* Section 1: Today's Active Tasks Roster (Dynamic Admin Orchestrated) */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Today's Active Task Roster</h3>
                {taskMultiplier > 1 && (
                  <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                    {taskMultiplier}× Multiplied
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Complete these {totalCount} assigned tasks to unlock your daily monetary incentive
              </p>
            </div>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            {completedCount}/{totalCount} Completed Today
          </span>
        </div>

        {activeRosterTasks.length === 0 ? (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
            <Clock size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p>Admin is currently preparing today's task roster. Check back shortly!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {activeRosterTasks.map((task) => {
              const thisMultiplier = getTaskMultiplier(task);
              const effectiveReward = Math.round((Number(task.reward) || 0) * thisMultiplier);
              const effectiveTask = { ...task, reward: effectiveReward, multiplier: thisMultiplier };
              const isDone = Boolean(safeCompletedTasks[task.id]);
              const visuals = getTaskVisuals(task, effectiveReward);

              return (
                <div 
                  key={task.id} 
                  className="glass-card card-interactive"
                  style={{ 
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                    background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${visuals.badgeClass}`} style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={11} /> {visuals.badgeText}
                        </span>
                        {task.shareRequired && (
                          <span className="badge" style={{ fontSize: '0.68rem', background: 'rgba(24, 119, 242, 0.15)', color: '#60a5fa', border: '1px solid rgba(24, 119, 242, 0.3)' }}>
                            <Share2 size={11} /> FB Share
                          </span>
                        )}
                        {(task.type === 'slide3' || task.type === 'memory') && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            Pure Skill
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {isDone ? (
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                            +{formatINR(typeof safeCompletedTasks[task.id] === 'number' ? safeCompletedTasks[task.id] : effectiveReward)}
                          </span>
                        ) : (task.type === 'spin' || task.type === 'scratch') ? (
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 800, 
                            color: '#fbbf24',
                            background: 'rgba(245, 158, 11, 0.12)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            🎁 Win ₹{Math.round(15 * taskMultiplier)}–₹{Math.round((task.type === 'spin' ? 200 : 150) * taskMultiplier)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                            +{formatINR(effectiveReward)}
                          </span>
                        )}
                        {thisMultiplier > 1 && (
                          <span className={`badge ${task.multiplierOverride > 0 ? 'badge-gold' : 'badge-indigo'}`} style={{ fontSize: '0.62rem' }}>
                            {thisMultiplier}× {task.multiplierOverride > 0 ? 'Booster' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.4rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '8px', background: visuals.bgGlow, color: visuals.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        {visuals.icon}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                        {task.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem', paddingLeft: '42px' }}>
                      {task.description}
                    </p>
                  </div>

                  <div style={{ marginBottom: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: '#94a3b8' }}>Payout Status:</span>
                    {isDone ? (
                      <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> Counted in Wallet (+{formatINR(typeof safeCompletedTasks[task.id] === 'number' ? safeCompletedTasks[task.id] : effectiveReward)})
                      </span>
                    ) : (task.type === 'spin' || task.type === 'scratch') ? (
                      <span style={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={12} /> Mystery Lucky Reward • Spin Wheel to Win
                      </span>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 700 }}>
                        Incomplete • ₹0.00 Counted
                      </span>
                    )}
                  </div>

                  {isDone ? (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ width: '100%', color: '#34d399', cursor: 'default' }}
                      disabled
                    >
                      <CheckCircle2 size={16} /> Completed (+{formatINR(typeof safeCompletedTasks[task.id] === 'number' ? safeCompletedTasks[task.id] : effectiveReward)})
                    </button>
                  ) : !canUserEarn ? (
                    <button 
                      className="btn btn-secondary"
                      style={{ 
                        width: '100%', 
                        fontWeight: 700, 
                        borderColor: 'rgba(245, 158, 11, 0.4)', 
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontSize: '0.82rem'
                      }}
                      onClick={() => {
                        showToast(freeTrialStatus?.isExpired ? 'Your 2-Day Free Trial has ended. Please subscribe to continue earning.' : 'Payment approval required! Your deposit must be verified and approved by Admin to earn task rewards.', 'error');
                        setActiveTab('plans');
                      }}
                    >
                      <Lock size={15} /> {pendingDeposit ? 'Payment Pending Approval' : freeTrialStatus?.isExpired ? 'Trial Expired (Subscribe Plan)' : 'Activate Plan to Earn'}
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      style={{ width: '100%', fontWeight: 700 }}
                      onClick={() => handleLaunchTask(effectiveTask)}
                    >
                      {visuals.buttonLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Real Skill Gaming & Tournament Arena (Task Wallet Only) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
            <Gamepad2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Real Skill Gaming & Tournament Arena</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Authentic traditional games with real board rules (Real Ludo, 29 Cards, Call Bridge, 16 Guti & 4×4 Slide Puzzle). 10% platform commission deducted automatically.
            </p>
          </div>
        </div>

        {/* Wallet Safeguard Notice */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <ShieldCheck size={18} color="#34d399" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#34d399' }}>Task Wallet Only:</strong> Boot fees are deducted strictly from earned winnings in your Task Wallet. Under no circumstances can membership principal be wagered.
            </span>
          </div>

          <div style={{ padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <Sparkles size={18} color="#818cf8" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#818cf8' }}>Unlimited Matches:</strong> Play continuously as long as you have winnings balance. 100% authentic real-life game rules!
            </span>
          </div>
        </div>

        {/* 5 Real Games Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Game 1: 4x4 Slide Puzzle Arena */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(99, 102, 241, 0.35)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  <Clock size={11} /> 120s Countdown • Pure Skill
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8' }}>
                  Win {formatINR(16)} (Boot {formatINR(10)})
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
                4×4 Slide Number Puzzle Arena
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Unlimited skill matches! Arrange numbers 1 to 15 within 120 seconds. 100% solvable board. Play continuously with winnings balance.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                ♾️ Unlimited Replays • Boot: ₹10 | Win: ₹16 • Winnings Wallet Only
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }} onClick={() => setIsPuzzleOpen(true)}>
              <Grid size={16} /> Enter 4×4 Slide Arena
            </button>
          </div>

          {/* Game 2: Real Ludo PvP Arena */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(239, 68, 68, 0.35)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                  <Users size={11} /> 15×15 Real Board • Roll 6 To Open
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                  Win {formatINR(18)} (Boot {formatINR(10)})
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
                Real Ludo PvP Arena
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Genuine Ludo with 15×15 board, pawns, safe star squares, cutting opponent pawns back to base, bonus rolls, and home runway finish!
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                🎲 Real Pawns • Cut Opponent • 10% House Rake • Win: ₹18
              </div>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', fontWeight: 700 }} onClick={() => setIsLudoOpen(true)}>
              <Dice5 size={16} /> Play Real Ludo
            </button>
          </div>

          {/* Game 3: 29 Cards Championship */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  <Trophy size={11} /> 32 Cards (J=3, 9=2, A=1, 10=1)
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  Win {formatINR(36)} (Boot {formatINR(10)})
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
                29 Cards Championship
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Traditional South Asian 29 trick-taking game. Bidding 16 to 28, secret trump placed face down, ask to reveal trump, and 28+1 pt total!
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                ♠️ Bidding 16-28 • Hidden Trump • 10% Platform Rake • 4 Players
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }} onClick={() => setIs29CardsOpen(true)}>
              <Trophy size={16} /> Play 29 Cards
            </button>
          </div>

          {/* Game 4: Call Bridge Masters */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(139, 92, 246, 0.35)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  <Spade size={11} /> 13 Hands • Spades Trump
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c084fc' }}>
                  Win {formatINR(36)} (Boot {formatINR(10)})
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
                Call Bridge Masters Arena
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                52 cards dealt (13 cards each). Call bidding (1-8), Spades are permanent trump, must follow suit, cut tricks with Spades, authentic scoring!
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                ♣️ 13 Hands • Call Bidding 1-8 • Rank 1 Net Pot: 90%
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }} onClick={() => setIsCallBridgeOpen(true)}>
              <Spade size={16} /> Play Call Bridge
            </button>
          </div>

          {/* Game 5: 16 Guti (Sholo Guti) Championship */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                  <Award size={11} /> 37-Node Wooden Board
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                  Win {formatINR(18)} (Boot {formatINR(10)})
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
                ১৬ গুটি (16 Guti / Sholo Guti)
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Traditional South Asian strategic bead game. 16 beads each, move 1 step along board lines, jump over opponent to capture, eliminate all 16 to win!
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                🔴 16 Beads • Jump Captures • 10% Platform Cut • Real AI Bot
              </div>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', fontWeight: 700 }} onClick={() => setIs16GutiOpen(true)}>
              <Award size={16} /> Play ১৬ গুটি (Sholo Guti)
            </button>
          </div>
        </div>
      </div>

      {/* Daily Task Modals */}
      <VideoTaskModal
        isOpen={Boolean(activeVideoTask)}
        onClose={() => setActiveVideoTask(null)}
        task={activeVideoTask}
      />

      <MusicTaskModal
        isOpen={Boolean(activeMusicTask)}
        onClose={() => setActiveMusicTask(null)}
        task={activeMusicTask}
      />

      <SpinWheelModal
        isOpen={Boolean(activeSpinTask)}
        onClose={() => setActiveSpinTask(null)}
        task={activeSpinTask}
      />

      <ScratchCardModal
        isOpen={Boolean(activeScratchTask)}
        onClose={() => setActiveScratchTask(null)}
        task={activeScratchTask}
      />

      <MemoryGameModal
        isOpen={Boolean(activeMemoryTask)}
        onClose={() => setActiveMemoryTask(null)}
        task={activeMemoryTask}
      />

      <WalkTaskModal
        isOpen={Boolean(activeWalkTask)}
        onClose={() => setActiveWalkTask(null)}
        task={activeWalkTask}
      />

      {/* Slide Puzzle (Handles Daily Task Mode & Solo Betting Mode) */}
      <SlidePuzzleModal
        isOpen={Boolean(activeDailyPuzzleTask) || isPuzzleOpen}
        onClose={() => {
          setActiveDailyPuzzleTask(null);
          setIsPuzzleOpen(false);
        }}
        isDailyTask={Boolean(activeDailyPuzzleTask)}
        task={activeDailyPuzzleTask}
        onOpenDeposit={onOpenDeposit}
        setActiveTab={setActiveTab}
      />

      {/* Real Skill Games Modals */}
      <RealLudoModal
        isOpen={isLudoOpen}
        onClose={() => setIsLudoOpen(false)}
      />

      <Real29CardsModal
        isOpen={is29CardsOpen}
        onClose={() => setIs29CardsOpen(false)}
      />

      <RealCallBridgeModal
        isOpen={isCallBridgeOpen}
        onClose={() => setIsCallBridgeOpen(false)}
      />

      <Real16GutiModal
        isOpen={is16GutiOpen}
        onClose={() => setIs16GutiOpen(false)}
      />

      {/* Custom Task Execution Modal */}
      {activeCustomTask && (
        <CustomTaskModal
          task={activeCustomTask}
          onClose={() => setActiveCustomTask(null)}
        />
      )}
    </div>
  );
}
