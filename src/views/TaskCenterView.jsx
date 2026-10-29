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
  Globe
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
import LudoArenaModal from '../components/LudoArenaModal';
import CardGamesArenaModal from '../components/CardGamesArenaModal';
import SixteenGutiModal from '../components/SixteenGutiModal';
import CustomTaskModal from '../components/CustomTaskModal';
import { getLocalDateString, formatFullReadableDate, getTimeUntilMidnight } from '../utils/dateUtils';

export default function TaskCenterView({ onOpenWithdraw }) {
  const { 
    rewardWallet, 
    tasksCompletedToday, 
    totalDailyQuota, 
    isWithdrawalAllowed, 
    dailyTaskRoster,
    userMembershipTier
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
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(getTimeUntilMidnight());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilMidnight(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Skill Gaming & PvP Arena Modals (Unlimited player matches)
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const [isLudoOpen, setIsLudoOpen] = useState(false);
  const [isCardGamesOpen, setIsCardGamesOpen] = useState(false);
  const [is16GutiOpen, setIs16GutiOpen] = useState(false);

  const taskMultiplier = userMembershipTier?.taskMultiplier || 1.0;

  // Active tasks for today dynamically controlled by Admin Roster
  const activeRosterTasks = (dailyTaskRoster && dailyTaskRoster.length > 0)
    ? dailyTaskRoster.filter((t) => t.status === 'ACTIVE')
    : [];

  const safeCompletedTasks = tasksCompletedToday || {};
  const completedCount = activeRosterTasks.filter((t) => safeCompletedTasks[t.id]).length;
  const totalCount = activeRosterTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalPotentialIncentive = activeRosterTasks.reduce((sum, t) => sum + Math.round((Number(t.reward) || 0) * taskMultiplier), 0);

  // Helper for task type badges and icons
  const getTaskVisuals = (task, effectiveReward) => {
    const rewardVal = effectiveReward !== undefined ? effectiveReward : task.reward;
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
      case 'spin':
        return {
          icon: <RotateCw size={20} />,
          badgeClass: 'badge-gold',
          badgeText: 'Instant Spin',
          accentColor: '#fbbf24',
          bgGlow: 'rgba(245, 158, 11, 0.12)',
          buttonLabel: `Spin Wheel (+${formatINR(rewardVal)})`,
        };
      case 'scratch':
        return {
          icon: <Gift size={20} />,
          badgeClass: 'badge-gold',
          badgeText: 'Instant Scratch',
          accentColor: '#f59e0b',
          bgGlow: 'rgba(245, 158, 11, 0.12)',
          buttonLabel: `Scratch Card (+${formatINR(rewardVal)})`,
        };
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
                <Clock size={12} /> Auto-Switch at 00:00 hrs: {timeUntilMidnight.formatted}
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
      <DailyStreakWidget />

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
              const effectiveReward = Math.round((Number(task.reward) || 0) * taskMultiplier);
              const effectiveTask = { ...task, reward: effectiveReward };
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
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                          +{formatINR(effectiveReward)}
                        </span>
                        {taskMultiplier > 1 && (
                          <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>
                            {taskMultiplier}×
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
                        <CheckCircle2 size={12} /> Counted in Wallet (+{formatINR(effectiveReward)})
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
                      <CheckCircle2 size={16} /> Completed (+{formatINR(effectiveReward)})
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

      {/* Section 2: Skill Gaming & PvP Tournament Arena (10% House Rake) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
            <Gamepad2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Skill Gaming & P2P Tournament Arena</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Real-time skill puzzles & multiplayer battles (Speed Ludo, 29 Cards, Call Bridge). 10% platform commission deducted automatically.
            </p>
          </div>
        </div>

        {/* Open Matchmaking & Wallet Safeguard Notice */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <Globe size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#60a5fa' }}>🌐 Open-Tier Matchmaking:</strong> Any membership level (Starter to Diamond VIP) can battle against any other member! Table matching is based <strong>only on matching the Boot Amount</strong> from your Task Wallet.
            </span>
          </div>

          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <ShieldCheck size={18} color="#34d399" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#34d399' }}>Task Wallet Only:</strong> Boot amounts are funded strictly from earned task income. Under no circumstances can membership principal be wagered.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Game 1: 3x3 & 4x4 Slide Puzzle */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  <Clock size={11} /> 60s / 120s Countdown
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#818cf8' }}>
                  Win {formatINR(8)} - {formatINR(16)}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                3×3 & 4×4 Slide Number Puzzle
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Pure logic skill. Slide numbered tiles into order within the strict countdown timer. 100% mathematically solvable boards.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                🧠 Solo Skill • ₹5 (3×3) or ₹10 (4×4) Entry Fee
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }} onClick={() => setIsPuzzleOpen(true)}>
              <Grid size={16} /> Play Slide Puzzle Arena
            </button>
          </div>

          {/* Game 2: Speed Ludo PvP */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                  <Users size={11} /> 2 or 4 Players Online
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                  Win {formatINR(9)} - {formatINR(18)}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Speed Ludo PvP Arena
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Multiplayer battle. 2 or 4 players stake ₹5 each. 10% platform rake deducted from pot, winner takes 90% instant payout!
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                🎲 10% House Rake • 2P Pot: ₹9 | 4P Pot: ₹18
              </div>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', fontWeight: 700 }} onClick={() => setIsLudoOpen(true)}>
              <Dice5 size={16} /> Enter Ludo Arena
            </button>
          </div>

          {/* Game 3: 29 Cards Championship */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  <Spade size={11} /> 4-Player Trick Arena
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  1st Rank Winner
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                29 Cards Championship
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Traditional South Asian 29 trick-taking game. Strategic bidding, trump card revelation, and Jack/Nine trump points.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                ♠️ 10% House Rake • 1st Rank Takes 90% Net Pot
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }} onClick={() => setIsCardGamesOpen(true)}>
              <Spade size={16} /> Play 29 Cards
            </button>
          </div>

          {/* Game 4: Call Bridge Masters */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  <Trophy size={11} /> 4-Player Spades
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c084fc' }}>
                  Rank 1 Payout
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Call Bridge Masters Arena
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Call your bids accurately and take tricks in competitive 4-player Spades bridge tournaments.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                ♣️ 10% House Rake • Pure Skill Strategy Tournament
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }} onClick={() => setIsCardGamesOpen(true)}>
              <Trophy size={16} /> Play Call Bridge
            </button>
          </div>

          {/* Game 5: 16 Guti (Sholo Guti) Championship */}
          <div className="glass-card card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                  <Award size={11} /> 37-Node Board • Traditional
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>
                  Win {formatINR(9)} - {formatINR(45)}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                ১৬ গুটি (16 Guti / Sholo Guti)
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                Traditional South Asian strategic bead game. Authentic wooden board, bead jumping over opponent to capture, Smart AI Bot & 2-player pass & play!
              </p>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.25rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                🔴 16 Beads Each • Capture Opponent Army • 100% Real Board
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
      />

      {/* Multiplayer PvP Modals */}
      <LudoArenaModal
        isOpen={isLudoOpen}
        onClose={() => setIsLudoOpen(false)}
      />

      <CardGamesArenaModal
        isOpen={isCardGamesOpen}
        onClose={() => setIsCardGamesOpen(false)}
      />

      {/* 16 Guti Traditional Modal */}
      <SixteenGutiModal
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
