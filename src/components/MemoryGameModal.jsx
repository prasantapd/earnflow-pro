import React, { useState, useEffect } from 'react';
import { X, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

const ICONS = ['💎', '🪙', '📈', '🏦', '🚀', '👑'];

export default function MemoryGameModal({ isOpen, onClose, task }) {
  const { completeTask } = useApp();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const rewardAmount = task?.reward || 50;

  const shuffleCards = () => {
    const paired = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon }));
    setCards(paired);
    setFlipped([]);
    setMatched([]);
    setIsWon(false);
  };

  useEffect(() => {
    if (isOpen) {
      shuffleCards();
    }
  }, [isOpen]);

  const handleCardClick = (index) => {
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
          }
          return next;
        });
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (!isOpen) return null;

  const handleClaim = () => {
    completeTask({
      taskId: task?.id || 'memory_1',
      taskTitle: 'Wealth Match Mini-Game',
      rewardAmount: rewardAmount,
      meta: 'Matched all memory pairs and won cash reward',
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
                Flip and pair all 6 wealth symbols to earn your reward
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Game Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
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
              All Pairs Matched!
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '0.15rem 0' }}>
              +{formatINR(rewardAmount)}
            </div>
            <span className="badge badge-emerald">Ready to Deposit to Wallet</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={!isWon}
            onClick={handleClaim}
          >
            <Sparkles size={18} /> {isWon ? `Claim ${formatINR(rewardAmount)} Reward` : 'Match All 6 Pairs to Win'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
