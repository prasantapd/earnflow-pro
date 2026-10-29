import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Gift, Wand2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

const SCRATCH_PRIZE_POOL = [
  { amount: 15, weight: 45, tier: 'High Chance (45%)' },
  { amount: 25, weight: 35, tier: 'High Chance (35%)' },
  { amount: 35, weight: 12, tier: 'Moderate (12%)' },
  { amount: 50, weight: 6, tier: 'Low Chance (6%)' },
  { amount: 75, weight: 1.5, tier: 'Rare (1.5%)' },
  { amount: 150, weight: 0.5, tier: 'Jackpot (0.5%)' },
];

export default function ScratchCardModal({ isOpen, onClose, task }) {
  const { completeTask, userMembershipTier } = useApp();
  const taskMultiplier = userMembershipTier?.taskMultiplier || 1.0;
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [prizeInfo, setPrizeInfo] = useState(() => ({ 
    amount: Math.round(25 * (userMembershipTier?.taskMultiplier || 1.0)), 
    tier: 'High Chance' 
  }));
  const isDrawingRef = useRef(false);

  const pickWeightedPrize = () => {
    const totalWeight = SCRATCH_PRIZE_POOL.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let picked = SCRATCH_PRIZE_POOL[0];
    for (let i = 0; i < SCRATCH_PRIZE_POOL.length; i++) {
      if (rand < SCRATCH_PRIZE_POOL[i].weight) {
        picked = SCRATCH_PRIZE_POOL[i];
        break;
      }
      rand -= SCRATCH_PRIZE_POOL[i].weight;
    }
    const scaledAmount = Math.round(picked.amount * taskMultiplier);
    return {
      amount: scaledAmount,
      tier: picked.tier,
    };
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Fill with metallic silver gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#64748b');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SCRATCH HERE TO REVEAL ⚡', width / 2, height / 2 - 5);
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Drag cursor or touch to uncover', width / 2, height / 2 + 18);
  };

  useEffect(() => {
    if (isOpen) {
      setIsScratched(false);
      const selected = pickWeightedPrize();
      setPrizeInfo(selected);
      setTimeout(initCanvas, 50);
    }
  }, [isOpen]);

  const scratch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI);
    ctx.fill();

    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4 * 16) {
      if (pixels[i] === 0) transparent++;
    }

    const totalSampled = pixels.length / (4 * 16);
    if (transparent / totalSampled > 0.45) {
      revealFull();
    }
  };

  const revealFull = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsScratched(true);
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  if (!isOpen) return null;

  const handleClaim = () => {
    const ok = completeTask({
      taskId: task?.id || 'scratch_1',
      taskTitle: 'Scratch & Win Golden Card',
      rewardAmount: prizeInfo.amount,
      meta: `Scratched card and won ${formatINR(prizeInfo.amount)} (${prizeInfo.tier})`,
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
              <Gift size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Scratch & Win Card</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Scratch to unveil your instant monetary reward
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
          <span>Provably Fair RNG Odds: ₹15–₹25 (80%), Mega Prize up to ₹150</span>
        </div>

        {/* Scratch Card Container */}
        <div 
          style={{ 
            position: 'relative', 
            width: 320, 
            height: 180, 
            margin: '1rem auto 1.25rem', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(245, 158, 11, 0.25)',
            border: '2px solid rgba(251, 191, 36, 0.4)'
          }}
        >
          {/* Underneath Revealed Content */}
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'radial-gradient(circle, #78350f 0%, #1c1917 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              color: '#ffffff'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Instant Cash Prize
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
              {formatINR(prizeInfo.amount)}
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              {prizeInfo.tier}
            </span>
          </div>

          {/* Canvas Scratch Surface */}
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              cursor: 'crosshair',
              touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) => {
              isDrawingRef.current = true;
              if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (isDrawingRef.current && e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Quick reveal button */}
        {!isScratched && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={revealFull}
            style={{ marginBottom: '1.25rem', fontSize: '0.78rem' }}
          >
            <Wand2 size={13} /> Auto-Reveal Card
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={!isScratched}
            onClick={handleClaim}
          >
            <Sparkles size={18} /> {isScratched ? `Claim ${formatINR(prizeInfo.amount)} Reward` : 'Scratch 50% to Reveal'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
