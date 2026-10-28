import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function CustomTaskModal({ task, onClose }) {
  const { completeTask, showToast, userMembershipTier } = useApp();

  const duration = Number(task.duration) || 20;
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasVisitedLink, setHasVisitedLink] = useState(false);
  const [hasShared, setHasShared] = useState(!task.shareRequired);
  const [isVerifying, setIsVerifying] = useState(false);

  const taskMultiplier = userMembershipTier?.taskMultiplier || 1.0;
  const effectiveReward = Math.round((Number(task.reward) || 25) * taskMultiplier);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (timerRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning, secondsLeft]);

  const handleOpenLink = () => {
    setHasVisitedLink(true);
    setTimerRunning(true);
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handleSocialShare = () => {
    const shareUrl = task.actionUrl || window.location.origin;
    const shareText = `Complete daily verified tasks on TaskCoin Pro and earn daily rewards! Task: ${task.title}`;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
    setHasShared(true);
    showToast('Social share recorded! Verification in progress.');
  };

  const handleClaim = () => {
    if (secondsLeft > 0) {
      showToast(`Please wait for the timer to finish (${secondsLeft}s remaining).`, 'error');
      return;
    }
    if (task.shareRequired && !hasShared) {
      showToast('Please share to social network to claim your reward.', 'error');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      completeTask({
        taskId: task.id,
        taskTitle: task.title,
        rewardAmount: effectiveReward,
        meta: `Custom Task: ${task.title} (${task.category || 'Special Task'})`,
      });
      setIsVerifying(false);
      onClose();
    }, 600);
  };

  const timerProgress = Math.round(((duration - secondsLeft) / duration) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-emerald">
                {task.category || 'Special Engagement Task'}
              </span>
              <span className="badge badge-gold">
                +{formatINR(effectiveReward)}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              {task.title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-sm" 
            style={{ borderRadius: '50%', width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Description */}
        <div 
          style={{ 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(255, 255, 255, 0.04)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '0.88rem',
            color: '#cbd5e1',
            lineHeight: 1.5,
            marginBottom: '1.25rem'
          }}
        >
          {task.description || 'Follow instructions and complete the verification timer to claim your guaranteed reward.'}
        </div>

        {/* Action Link button if task has URL */}
        {task.actionUrl && (
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
              onClick={handleOpenLink}
            >
              <ExternalLink size={16} />
              <span>{hasVisitedLink ? 'Link Opened ✓ (Click to Re-open)' : 'Open Task Action Link ↗'}</span>
            </button>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.35rem' }}>
              Opens target website or channel in a new tab.
            </div>
          </div>
        )}

        {/* Verification Timer Box */}
        <div 
          style={{ 
            padding: '1.25rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Clock size={16} />
            <span>Verification Timer: {secondsLeft > 0 ? `${secondsLeft}s Remaining` : 'Timer Complete! ✓'}</span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div 
              style={{ 
                width: `${timerProgress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)', 
                transition: 'width 1s linear' 
              }} 
            />
          </div>

          {!timerRunning && secondsLeft === duration && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleStartTimer}
              style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
            >
              Start {duration}s Verification Timer
            </button>
          )}

          {secondsLeft === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> Verification requirements met!
            </div>
          )}
        </div>

        {/* Social Share Requirement (if enabled) */}
        {task.shareRequired && (
          <div 
            style={{ 
              padding: '0.85rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(24, 119, 242, 0.08)', 
              border: '1px solid rgba(24, 119, 242, 0.3)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60a5fa' }}>
                Mandatory Social Share
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {hasShared ? 'Share completed ✓' : 'Share to Facebook or friends to unlock claim.'}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSocialShare}
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Share2 size={13} />
              <span>{hasShared ? 'Shared ✓' : 'Share Now'}</span>
            </button>
          </div>
        )}

        {/* Claim / Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ flex: 1 }} 
            onClick={onClose}
          >
            Close
          </button>
          <button 
            type="button" 
            className="btn btn-gold btn-lg" 
            style={{ flex: 2, fontWeight: 800 }}
            disabled={secondsLeft > 0 || (task.shareRequired && !hasShared) || isVerifying}
            onClick={handleClaim}
          >
            <Sparkles size={16} />
            <span>{isVerifying ? 'Verifying...' : `Claim +${formatINR(effectiveReward)} Reward`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
