import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Brain, RefreshCw, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

const ICONS = ['💎', '🪙', '📈', '🏦', '🚀', '👑'];
const TIME_LIMIT_SECONDS = 60;

export default function MemoryGameModal({ isOpen, onClose, task }) {
  const { completeTask } = useApp();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef(null);

  const rewardAmount = task?.reward || 35.00;

  const shuffleCards = () => {
    const paired = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon }));
    setCards(paired);
    setFlipped([]);
    setMatched([]);
    setIsWon(false);
    setTimeLeft(TIME_LIMIT_SECONDS);
    setIsTimeUp(false);
  };

  useEffect(() => {
    if (isOpen) {
      shuffleCards();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Countdown timer effect
  useEffect(() => {
    if (isOpen && !isWon && !isTimeUp) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isWon, isTimeUp]);

  const handleCardClick = (index) => {
    if (isTimeUp || isWon) return;
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setMatched((prev) => {
          const next = [...prev, first, second];
          if (next.length === cards.length) {
            setIsWon(true);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return next;
        });
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  if (!isOpen) return null;

  const handleClaim = () => {
    if (!isWon || isTimeUp) return;
    completeTask({
      taskId: task?.id || 'memory_1',
      taskTitle: task?.title || 'Wealth Icon Memory Match Challenge',
      rewardAmount: rewardAmount,
      meta: `Matched all 6 pairs in ${TIME_LIMIT_SECONDS - timeLeft}s (Skill Verified)`,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Brain size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Wealth Icon Match</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Flip & pair 6 symbols before 60s countdown expires
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Live Timer and Pairs Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.6rem 1rem', background: isTimeUp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: isTimeUp ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 800, color: timeLeft <= 15 ? '#f87171' : '#fbbf24' }}>
            <Clock size={16} /> {timeLeft}s Left
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Pairs Found: <strong style={{ color: '#34d399' }}>{matched.length / 2} / 6</strong>
          </span>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={shuffleCards}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            <RefreshCw size={12} /> Reset
          </button>
        </div>

        {/* 4x3 Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.25rem', opacity: isTimeUp ? 0.45 : 1, pointerEvents: isTimeUp ? 'none' : 'auto' }}>
          {cards.map((card, idx) => {
            const isCardFlipped = flipped.includes(idx) || matched.includes(idx);
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                style={{
                  height: 72,
                  borderRadius: 'var(--radius-md)',
                  background: isCardFlipped 
                    ? matched.includes(idx) 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)' 
                      : 'rgba(59, 130, 246, 0.25)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1.5px solid ${isCardFlipped ? (matched.includes(idx) ? 'var(--emerald-500)' : '#3b82f6') : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  cursor: isCardFlipped ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  transform: isCardFlipped ? 'scale(1)' : 'scale(0.96)',
                  boxShadow: isCardFlipped ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                {isCardFlipped ? card.icon : '❓'}
              </div>
            );
          })}
        </div>

        {/* Failure / Timeout Banner */}
        {isTimeUp && (
          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.15)', 
              borderColor: 'rgba(239, 68, 68, 0.4)',
              marginBottom: '1.25rem',
              color: '#f87171'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
              <AlertTriangle size={18} /> Time Expired (Task Incomplete)
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              You did not complete all 6 pairs within 60 seconds. Reward is forfeited for this round. Practice and try again tomorrow!
            </p>
          </div>
        )}

        {/* Victory Card */}
        {isWon && (
          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem', 
              background: 'rgba(16, 185, 129, 0.15)', 
              borderColor: 'rgba(16, 185, 129, 0.4)',
              marginBottom: '1.25rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              All 6 Pairs Matched in {TIME_LIMIT_SECONDS - timeLeft}s!
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '0.15rem 0' }}>
              +{formatINR(rewardAmount)}
            </div>
            <span className="badge badge-emerald">Pure Skill Verification Passed</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isTimeUp ? (
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              style={{ flex: 1 }}
              onClick={shuffleCards}
            >
              <RefreshCw size={16} /> Try Practice Mode
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={!isWon}
              onClick={handleClaim}
            >
              <Sparkles size={18} /> {isWon ? `Claim ${formatINR(rewardAmount)} Reward` : 'Match All 6 Pairs to Win'}
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
