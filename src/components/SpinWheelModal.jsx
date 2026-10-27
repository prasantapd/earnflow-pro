import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Award, RotateCw, ShieldCheck, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

// Weighted Probability Segments (Low amounts = High chance, Mega amounts = Low chance to protect admin treasury)
const SEGMENTS = [
  { text: '₹15', value: 15, color: '#6366f1', weight: 42, tier: 'High Chance (42%)' },
  { text: '₹25', value: 25, color: '#10b981', weight: 32, tier: 'High Chance (32%)' },
  { text: '₹35', value: 35, color: '#06b6d4', weight: 12, tier: 'Moderate (12%)' },
  { text: '₹40', value: 40, color: '#14b8a6', weight: 7, tier: 'Moderate (7%)' },
  { text: '₹50', value: 50, color: '#3b82f6', weight: 4, tier: 'Low Chance (4%)' },
  { text: '₹75', value: 75, color: '#8b5cf6', weight: 2, tier: 'Rare (2%)' },
  { text: '₹100', value: 100, color: '#f59e0b', weight: 0.8, tier: 'Very Rare (0.8%)' },
  { text: '₹200', value: 200, color: '#ec4899', weight: 0.2, tier: 'Jackpot (0.2%)' },
];

export default function SpinWheelModal({ isOpen, onClose, task }) {
  const { completeTask } = useApp();
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const rotationRef = useRef(0);

  const drawWheel = (currentRotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 15;

    ctx.clearRect(0, 0, width, height);

    const numSegments = SEGMENTS.length;
    const arc = (2 * Math.PI) / numSegments;

    // Draw slices
    SEGMENTS.forEach((seg, i) => {
      const angle = currentRotation + i * arc;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillText(seg.text, radius - 25, 6);
      ctx.restore();
    });

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  useEffect(() => {
    if (isOpen) {
      setWonPrize(null);
      setIsSpinning(false);
      setTimeout(() => drawWheel(rotationRef.current), 50);
    }
  }, [isOpen]);

  const spin = () => {
    if (isSpinning || wonPrize) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Weighted Probability Selection:
    // Low amounts have high probability, high amounts have low probability
    const totalWeight = SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < SEGMENTS.length; i++) {
      if (rand < SEGMENTS[i].weight) {
        winningIndex = i;
        break;
      }
      rand -= SEGMENTS[i].weight;
    }

    const winningSegment = SEGMENTS[winningIndex];

    const numSegments = SEGMENTS.length;
    const arc = (2 * Math.PI) / numSegments;

    // Target angle where pointer (at top: 3*PI/2) points to winning segment
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 spins
    const targetOffset = (3 * Math.PI) / 2 - (winningIndex * arc + arc / 2);
    const totalRotation = fullSpins * 2 * Math.PI + targetOffset;

    const startRotation = rotationRef.current % (2 * Math.PI);
    const delta = totalRotation - startRotation;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRotation + delta * easeOut;
      rotationRef.current = currentRot;

      drawWheel(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWonPrize(winningSegment);
      }
    };

    requestAnimationFrame(animate);
  };

  if (!isOpen) return null;

  const handleClaim = () => {
    if (!wonPrize) return;
    completeTask({
      taskId: task?.id || 'spin_1',
      taskTitle: 'Lucky Spin Wheel Task',
      rewardAmount: wonPrize.value,
      meta: `Won ${wonPrize.text} from Lucky Wealth Spin Wheel (RNG Tier: ${wonPrize.tier})`,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <RotateCw size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lucky Spin & Win</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Weighted RNG: Daily task reward with jackpot chance
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Weighted RNG Transparency Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.72rem', color: '#34d399', margin: '0 auto 0.5rem', width: 'fit-content' }}>
          <ShieldCheck size={13} />
          <span>Balanced Odds: High probability for ₹15–₹25, rare jackpot on ₹200</span>
        </div>

        {/* Wheel Container with Pointer */}
        <div style={{ position: 'relative', width: 300, height: 300, margin: '1rem auto' }}>
          {/* Top Indicator Arrow */}
          <div 
            style={{ 
              position: 'absolute', 
              top: -10, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 10,
              width: 0,
              height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '24px solid #f59e0b',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }} 
          />

          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            style={{ borderRadius: '50%', boxShadow: '0 0 35px rgba(245, 158, 11, 0.25)' }}
          />
        </div>

        {/* Win Status Banner */}
        {wonPrize && (
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
              Congratulations! You Won
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: '0.15rem 0' }}>
              {formatINR(wonPrize.value)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <span className="badge badge-emerald">Ready to Deposit to Wallet</span>
              <span style={{ color: '#94a3b8' }}>• Tier: {wonPrize.tier}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          {!wonPrize ? (
            <button
              type="button"
              className="btn btn-gold btn-lg"
              style={{ flex: 1 }}
              disabled={isSpinning}
              onClick={spin}
            >
              <RotateCw size={18} className={isSpinning ? 'spin-icon' : ''} />
              <span>{isSpinning ? 'Spinning...' : 'Spin the Wheel Now!'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleClaim}
            >
              <Sparkles size={18} /> Claim {formatINR(wonPrize.value)} Reward
            </button>
          )}

          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
