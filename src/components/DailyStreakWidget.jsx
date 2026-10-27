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
  CalendarCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STREAK_SCHEDULE, STREAK_REWARDS } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function DailyStreakWidget() {
  const { 
    loginStreak, 
    claimDailyLoginBonus, 
    resetDailyStreak, 
    fastForwardNextDay 
  } = useApp();

  const [showDemoTools, setShowDemoTools] = useState(false);

  const streak = loginStreak || {
    currentDay: 1,
    lastClaimedDate: null,
    claimedToday: false,
    totalStreakEarned: 0,
    history: [false, false, false, false, false, false, false],
  };

  const currentDay = Math.min(7, Math.max(1, streak.currentDay || 1));
  const claimedToday = streak.claimedToday;
  const currentReward = STREAK_REWARDS[currentDay] || 5;

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
          width: 140, 
          height: 140, 
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
              width: 44, 
              height: 44, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Flame size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Daily Login Streak Bonus
              </h3>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                🔥 Day {claimedToday ? currentDay - 1 || 7 : currentDay} of 7
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Log in daily to earn cash rewards. Miss 1 day and streak resets to Day 1!
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

          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDemoTools(!showDemoTools)}
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
          >
            <Zap size={12} color="#fbbf24" />
            <span>{showDemoTools ? 'Hide Controls' : 'Demo Tools'}</span>
          </button>
        </div>
      </div>

      {/* 7 Days Progress Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
          gap: '0.65rem', 
          marginBottom: '1.25rem' 
        }}
      >
        {STREAK_SCHEDULE.map((item, idx) => {
          const dayNum = item.day;
          const isGrandJackpot = dayNum === 7;
          
          // Determine status
          const isDone = (streak.history && streak.history[idx]) === true;
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
            cardBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.25) 100%)';
            borderColor = '#f59e0b';
            statusText = 'Ready!';
            statusColor = '#fbbf24';
          } else if (isGrandJackpot) {
            cardBg = 'rgba(168, 85, 247, 0.08)';
            borderColor = 'rgba(168, 85, 247, 0.3)';
          }

          return (
            <div
              key={dayNum}
              style={{
                background: cardBg,
                border: `1.5px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isCurrent ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
                transform: isCurrent ? 'scale(1.02)' : 'none'
              }}
            >
              {isGrandJackpot && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -4, 
                    background: '#a855f7', 
                    color: '#ffffff', 
                    fontSize: '0.55rem', 
                    fontWeight: 800, 
                    padding: '1px 5px', 
                    borderRadius: '10px' 
                  }}
                >
                  JACKPOT
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.25rem' }}>
                Day {dayNum}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginBottom: '0.35rem' }}>
                {isGrandJackpot ? (
                  <Trophy size={16} color="#fbbf24" />
                ) : (
                  <Sparkles size={14} color="#f59e0b" />
                )}
                <span 
                  style={{ 
                    fontSize: isGrandJackpot ? '1.15rem' : '1.05rem', 
                    fontWeight: 800, 
                    color: isGrandJackpot ? '#fbbf24' : '#ffffff' 
                  }}
                >
                  ₹{item.reward}
                </span>
              </div>

              <div 
                style={{ 
                  fontSize: '0.68rem', 
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

      {/* Main Claim Button Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <AlertCircle size={15} color="#fbbf24" />
          <span>
            <strong>Schedule:</strong> Days 1–3: ₹5/day • Days 4–6: ₹7/day • Day 7: ₹10
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {claimedToday ? (
            <div 
              style={{ 
                padding: '0.55rem 1.25rem', 
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
              <span>Claimed for Today ✓ (Next reward tomorrow)</span>
            </div>
          ) : (
            <button 
              className="btn btn-gold btn-lg"
              onClick={claimDailyLoginBonus}
              style={{ 
                padding: '0.65rem 1.5rem', 
                fontSize: '0.92rem', 
                fontWeight: 700,
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Sparkles size={18} />
              <span>Claim Day {currentDay} Bonus (+₹{currentReward}.00) Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo simulation toolbar */}
      {showDemoTools && (
        <div 
          style={{ 
            marginTop: '1.25rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            🛠️ <strong>Evaluation & Demo Sandbox:</strong> Test streak bonus behaviors instantly without waiting 24 real hours.
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={fastForwardNextDay}
              style={{ fontSize: '0.72rem' }}
              title="Fast forwards 24 hours so next day's bonus and withdrawal cooldown unlock"
            >
              <FastForward size={13} color="#34d399" />
              <span>Fast-Forward 24 Hours</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={resetDailyStreak}
              style={{ fontSize: '0.72rem' }}
              title="Simulates missing a day to verify reset to Day 1"
            >
              <RotateCcw size={13} color="#f87171" />
              <span>Simulate Missed Day (Reset to Day 1)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
