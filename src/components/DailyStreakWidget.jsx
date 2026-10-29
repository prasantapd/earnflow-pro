import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Trophy, 
  AlertCircle, 
  RotateCcw, 
  FastForward, 
  Coins, 
  Zap,
  CalendarCheck,
  ChevronRight,
  Layers,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STREAK_SCHEDULE, STREAK_REWARDS, STREAK_WEEKS } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function DailyStreakWidget() {
  const { 
    loginStreak, 
    claimDailyLoginBonus, 
    resetDailyStreak, 
    fastForwardNextDay,
    userMembershipTier,
    streakRewards,
    setState,
    showToast
  } = useApp();

  const streak = loginStreak || {
    currentDay: 1,
    lastClaimedDate: null,
    claimedToday: false,
    totalStreakEarned: 0,
    history: Array(30).fill(false),
  };

  const activeRewards = streakRewards || STREAK_REWARDS;
  const loginMultiplier = userMembershipTier?.loginMultiplier || 1.0;
  const currentDay = Math.min(30, Math.max(1, streak.currentDay || 1));
  const claimedToday = streak.claimedToday;
  const baseReward = activeRewards[currentDay] || (currentDay >= 30 ? 12 : 1);
  const currentReward = Math.round(baseReward * loginMultiplier);

  // Dynamic schedule derived from active admin-configured streak rewards
  const dynamicSchedule = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const reward = activeRewards[day] ?? STREAK_REWARDS[day] ?? 1;
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

  // Determine current active week (1 to 4)
  const currentWeekNum = currentDay <= 7 ? 1 : currentDay <= 14 ? 2 : currentDay <= 21 ? 3 : 4;
  
  const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'full30'
  const [showDemoTools, setShowDemoTools] = useState(false);

  // Active items based on view mode
  const displayedSchedule = viewMode === 'full30' 
    ? dynamicSchedule 
    : dynamicSchedule.filter(item => {
        const week = STREAK_WEEKS.find(w => w.weekNum === selectedWeek);
        return week && item.day >= week.startDay && item.day <= week.endDay;
      });

  // Calculate overall 30-day completion progress
  const completedCount = (streak.history || []).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedCount / 30) * 100));

  // Quick jump helper for testing
  const jumpToDay29 = () => {
    setState(prev => ({
      ...prev,
      loginStreak: {
        ...prev.loginStreak,
        currentDay: 29,
        claimedToday: false,
        history: Array.from({ length: 30 }, (_, i) => i < 28)
      }
    }));
    setSelectedWeek(4);
    showToast('Sandbox: Fast-forwarded to Day 29 (1 day before 30-Day Grand Finish)!', 'info');
  };

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '1.5rem', 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(234, 88, 12, 0.06) 50%, rgba(16, 185, 129, 0.08) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient glow */}
      <div 
        style={{ 
          position: 'absolute', 
          top: -30, 
          right: -30, 
          width: 160, 
          height: 160, 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} 
      />

      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{ 
              width: 46, 
              height: 46, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Flame size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                30-Day Progressive Daily Login Streak
              </h3>
              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                🔥 Day {claimedToday ? (currentDay > 1 ? currentDay - 1 : 30) : currentDay} of 30
              </span>
              <span className={`badge ${userMembershipTier?.badgeClass || 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                {userMembershipTier?.tierBadge || 'Starter'} • {loginMultiplier}× Boost
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Basic ₹2,000 Plan: <strong>W1</strong> (1→7) • <strong>W2</strong> (2→8) • <strong>W3</strong> (3→9) • <strong>W4</strong> (4→12 for 30 Days). Miss 1 day and streak resets to Day 1! Complete Day 30 to restart fresh.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div 
            style={{ 
              padding: '0.4rem 0.85rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(16, 185, 129, 0.12)', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Coins size={15} color="#34d399" />
            <div style={{ fontSize: '0.78rem' }}>
              <span style={{ color: '#94a3b8' }}>Lifetime Earned: </span>
              <strong style={{ color: '#34d399' }}>{formatINR(streak.totalStreakEarned || 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Overall Progress Bar */}
      <div style={{ marginBottom: '1.25rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>30-Day Cycle Progress:</span>
            <strong style={{ color: '#fbbf24' }}>{completedCount} of 30 Days Completed</strong>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#34d399' }}>{progressPercent}% Complete</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Next reset: <strong style={{ color: '#cbd5e1' }}>Day 30 Finish</strong>
          </div>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${Math.max(3, progressPercent)}%`, 
              background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Week Selector Tabs & View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* 4 Week Tabs */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {STREAK_WEEKS.map((w) => {
            const isSelected = viewMode === 'weekly' && selectedWeek === w.weekNum;
            const isCurrentWeek = currentWeekNum === w.weekNum;
            const scaledWeekSum = Math.round(w.baseSum * loginMultiplier);

            return (
              <button
                key={w.weekNum}
                type="button"
                onClick={() => {
                  setViewMode('weekly');
                  setSelectedWeek(w.weekNum);
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(234, 88, 12, 0.3) 100%)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#fbbf24' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.15rem',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>{w.title}</span>
                  {isCurrentWeek && (
                    <span 
                      style={{ 
                        background: '#10b981', 
                        color: '#ffffff', 
                        fontSize: '0.58rem', 
                        fontWeight: 800, 
                        padding: '1px 5px', 
                        borderRadius: '6px' 
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.68rem', color: isSelected ? '#ffffff' : '#94a3b8' }}>
                  {w.range} • <strong style={{ color: '#34d399' }}>₹{scaledWeekSum}</strong>
                </div>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Week view vs All 30 Days */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.2rem', borderRadius: '8px' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setViewMode('weekly')}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              background: viewMode === 'weekly' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: viewMode === 'weekly' ? '#ffffff' : '#94a3b8',
              border: 'none'
            }}
          >
            <Calendar size={12} /> Week View
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setViewMode('full30')}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.72rem',
              background: viewMode === 'full30' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
              color: viewMode === 'full30' ? '#fbbf24' : '#94a3b8',
              border: 'none'
            }}
          >
            <Layers size={12} /> All 30 Days
          </button>
        </div>
      </div>

      {/* Days Progress Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'full30' 
            ? 'repeat(auto-fit, minmax(95px, 1fr))' 
            : 'repeat(auto-fit, minmax(105px, 1fr))', 
          gap: '0.6rem', 
          marginBottom: '1.25rem' 
        }}
      >
        {displayedSchedule.map((item) => {
          const dayNum = item.day;
          const isGrandFinish = item.isGrandFinish; // Day 30
          const isWeeklyFinish = item.isWeeklyFinish; // Day 7, 14, 21
          const scaledReward = Math.round(item.reward * loginMultiplier);
          
          // Determine status
          const isDone = (streak.history && streak.history[dayNum - 1]) === true;
          const isCurrent = !claimedToday && dayNum === currentDay;
          const isLocked = !isDone && !isCurrent;

          let cardBg = 'rgba(255, 255, 255, 0.03)';
          let borderColor = 'rgba(255, 255, 255, 0.08)';
          let statusText = 'Upcoming';
          let statusColor = '#64748b';

          if (isDone) {
            cardBg = 'rgba(16, 185, 129, 0.12)';
            borderColor = 'rgba(16, 185, 129, 0.4)';
            statusText = 'Claimed ✓';
            statusColor = '#34d399';
          } else if (isCurrent) {
            cardBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(234, 88, 12, 0.28) 100%)';
            borderColor = '#f59e0b';
            statusText = 'Ready!';
            statusColor = '#fbbf24';
          } else if (isGrandFinish) {
            cardBg = 'rgba(245, 158, 11, 0.08)';
            borderColor = 'rgba(245, 158, 11, 0.35)';
          } else if (isWeeklyFinish) {
            cardBg = 'rgba(168, 85, 247, 0.06)';
            borderColor = 'rgba(168, 85, 247, 0.25)';
          }

          return (
            <div
              key={dayNum}
              style={{
                background: cardBg,
                border: `1.5px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.45rem',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isCurrent 
                  ? '0 0 16px rgba(245, 158, 11, 0.35)' 
                  : isGrandFinish 
                    ? '0 0 10px rgba(245, 158, 11, 0.15)' 
                    : 'none',
                transform: isCurrent ? 'scale(1.03)' : 'none'
              }}
            >
              {isGrandFinish && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -4, 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
                    color: '#ffffff', 
                    fontSize: '0.52rem', 
                    fontWeight: 900, 
                    padding: '1px 5px', 
                    borderRadius: '10px',
                    letterSpacing: '0.5px'
                  }}
                >
                  30D FINISH
                </div>
              )}

              {isWeeklyFinish && !isGrandFinish && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -4, 
                    background: '#a855f7', 
                    color: '#ffffff', 
                    fontSize: '0.52rem', 
                    fontWeight: 800, 
                    padding: '1px 5px', 
                    borderRadius: '10px' 
                  }}
                >
                  W{item.week} FINISH
                </div>
              )}

              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>
                Day {dayNum}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginBottom: '0.2rem' }}>
                {isGrandFinish ? (
                  <Trophy size={16} color="#fbbf24" />
                ) : isWeeklyFinish ? (
                  <Sparkles size={14} color="#c084fc" />
                ) : (
                  <Sparkles size={13} color="#f59e0b" />
                )}
                <span 
                  style={{ 
                    fontSize: isGrandFinish ? '1.18rem' : '1.05rem', 
                    fontWeight: 800, 
                    color: isGrandFinish ? '#fbbf24' : '#ffffff' 
                  }}
                >
                  ₹{scaledReward}
                </span>
              </div>

              {loginMultiplier > 1 && (
                <div style={{ fontSize: '0.6rem', color: '#34d399', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {loginMultiplier}× Boost
                </div>
              )}

              <div 
                style={{ 
                  fontSize: '0.66rem', 
                  fontWeight: 700, 
                  color: statusColor, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.2rem' 
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={12} color="#34d399" />
                ) : isCurrent ? (
                  <Zap size={12} color="#fbbf24" />
                ) : (
                  <Lock size={11} color="#64748b" />
                )}
                <span>{statusText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Claim Button Bar & Reset Rules */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1', maxWidth: '680px' }}>
          <AlertCircle size={17} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span>
            <strong>Progression Rule:</strong> Week 1 (₹1→₹7) • Week 2 (₹2→₹8) • Week 3 (₹3→₹9) • Week 4 (₹4→₹12 for 30 Days). Miss 1 day and streak strictly resets to Day 1. Completing Day 30 loops to Day 1.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {claimedToday ? (
            <div 
              style={{ 
                padding: '0.6rem 1.25rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(16, 185, 129, 0.15)', 
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <CalendarCheck size={16} />
              <span>Claimed for Today ✓ (Day {currentDay === 30 ? 1 : currentDay + 1} unlocks tomorrow)</span>
            </div>
          ) : (
            <button 
              className="btn btn-gold btn-lg"
              onClick={claimDailyLoginBonus}
              style={{ 
                padding: '0.68rem 1.6rem', 
                fontSize: '0.92rem', 
                fontWeight: 800,
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Sparkles size={18} />
              <span>Claim Day {currentDay} Bonus (+₹{currentReward}.00) Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
