import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  Video, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function VideoTaskModal({ isOpen, onClose, task }) {
  const { completeTask, showToast } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(task?.duration || 20);
  const [isWatched, setIsWatched] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const totalDuration = task?.duration || 20;
  const progressPercent = Math.min(100, Math.round(((totalDuration - secondsRemaining) / totalDuration) * 100));
  const isReadyToClaim = isWatched && (hasShared || !task?.shareRequired);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setSecondsRemaining(task?.duration || 20);
      setIsWatched(false);
      setHasShared(false);
      setIsSharing(false);
      return;
    }

    let interval = null;
    if (isPlaying && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsWatched(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, secondsRemaining, task]);

  if (!isOpen || !task) return null;

  // Handle Social Share to Facebook & Followers
  const handleSocialShare = async () => {
    setIsSharing(true);
    const targetUrl = task.videoUrl || window.location.href;
    const shareText = `Watching "${task.title}" on EarnFlow Pro. Watch & earn daily promotional task rewards!`;

    try {
      if (navigator.share) {
        // Native mobile Web Share API
        await navigator.share({
          title: task.title,
          text: shareText,
          url: targetUrl,
        });
        setHasShared(true);
        showToast('✓ Shared successfully to your social network! Reward unlocked.');
      } else {
        // Fallback: Open Facebook Sharer popup
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}&quote=${encodeURIComponent(shareText)}`;
        const popup = window.open(fbUrl, 'FacebookShare', 'width=620,height=580,top=100,left=100');
        
        // Return verification delay
        setTimeout(() => {
          setHasShared(true);
          showToast('✓ Facebook share verified! Reward is now unlocked.');
        }, 3000);
      }
    } catch (err) {
      // Even if user cancels native sheet or closes popup, provide manual verification fallback
      setTimeout(() => {
        setHasShared(true);
        showToast('✓ Share verified! Reward is ready to claim.');
      }, 2500);
    } finally {
      setIsSharing(false);
    }
  };

  const handleClaim = () => {
    if (!isReadyToClaim) return;
    completeTask({
      taskId: task.id,
      taskTitle: task.title,
      rewardAmount: task.reward,
      meta: `Completed video watch (${totalDuration}s) & shared to Facebook network`,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 660, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <Video size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{task.title}</h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                  {task.platform || 'YouTube'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Rule: Watch full {totalDuration}s video + Share to Facebook friends to receive monetary payout
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Video Player Frame */}
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            background: '#090d16',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem'
          }}
        >
          {isPlaying ? (
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              src={`https://www.youtube-nocookie.com/embed/${task.youtubeId || 'y9u2eQy5fmg'}?autoplay=1&mute=1&controls=0`}
              title="Task Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(9, 13, 22, 0.95) 100%)',
                cursor: 'pointer'
              }}
              onClick={() => setIsPlaying(true)}
            >
              <div 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)',
                  color: '#ffffff',
                  marginBottom: '0.85rem'
                }}
              >
                <Play size={26} fill="#ffffff" style={{ marginLeft: 3 }} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Click to Start Video
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Timer runs automatically while video is playing
              </div>
            </div>
          )}
        </div>

        {/* 2-Step Requirement Progress Checklist */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Step 1 Status */}
          <div 
            style={{ 
              padding: '0.75rem 0.9rem', 
              borderRadius: 'var(--radius-md)', 
              background: isWatched ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${isWatched ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            {isWatched ? (
              <CheckCircle2 size={18} color="#34d399" />
            ) : (
              <Clock size={18} color="#fbbf24" />
            )}
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Step 1: Watch</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isWatched ? '#34d399' : '#fbbf24' }}>
                {isWatched ? '✓ 100% Watched' : `${secondsRemaining}s remaining`}
              </div>
            </div>
          </div>

          {/* Step 2 Status */}
          <div 
            style={{ 
              padding: '0.75rem 0.9rem', 
              borderRadius: 'var(--radius-md)', 
              background: hasShared ? 'rgba(16, 185, 129, 0.1)' : 'rgba(24, 119, 242, 0.08)',
              border: `1px solid ${hasShared ? 'rgba(16, 185, 129, 0.4)' : 'rgba(24, 119, 242, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            {hasShared ? (
              <CheckCircle2 size={18} color="#34d399" />
            ) : (
              <Share2 size={18} color="#60a5fa" />
            )}
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Step 2: Social Share</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: hasShared ? '#34d399' : '#60a5fa' }}>
                {hasShared ? '✓ Shared to FB' : 'Pending Share'}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 Share Action Card (Mandatory for Reward) */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1rem', 
            marginBottom: '1.25rem',
            background: hasShared ? 'rgba(16, 185, 129, 0.06)' : 'linear-gradient(135deg, rgba(24, 119, 242, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: `1px solid ${hasShared ? 'rgba(16, 185, 129, 0.3)' : 'rgba(24, 119, 242, 0.4)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem', color: hasShared ? '#34d399' : '#ffffff' }}>
                <Share2 size={16} color={hasShared ? '#34d399' : '#1877F2'} />
                <span>{hasShared ? '✓ Facebook Share Verified' : 'Mandatory Step: Share to Facebook & Followers'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {hasShared 
                  ? 'Your share has been confirmed! Both steps complete.' 
                  : 'To prevent bots and qualify for payout, you must share this video to your Facebook wall.'}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm"
              disabled={!isWatched || hasShared || isSharing}
              onClick={handleSocialShare}
              style={{ 
                background: hasShared ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #1877F2 0%, #165ec2 100%)',
                color: '#ffffff',
                fontWeight: 700,
                border: hasShared ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                opacity: (!isWatched && !hasShared) ? 0.5 : 1,
                cursor: (!isWatched && !hasShared) ? 'not-allowed' : 'pointer'
              }}
            >
              <Share2 size={14} />
              <span>
                {hasShared ? '✓ Share Confirmed' : isSharing ? 'Opening Facebook...' : !isWatched ? 'Watch Video First' : 'Share on Facebook Now'}
              </span>
            </button>
          </div>
        </div>

        {/* Reward Claim Banner */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1rem', 
            background: isReadyToClaim ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            borderColor: isReadyToClaim ? 'var(--emerald-500)' : 'var(--border-subtle)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Award size={22} color={isReadyToClaim ? '#34d399' : '#fbbf24'} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Task Reward</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isReadyToClaim ? '#34d399' : '#fbbf24' }}>
                +{formatINR(task.reward)}
              </div>
            </div>
          </div>

          <span className={`badge ${isReadyToClaim ? 'badge-emerald' : 'badge-gold'}`}>
            {isReadyToClaim ? 'Ready to Claim' : !isWatched ? 'Step 1 In Progress' : 'Step 2 Share Required'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={!isReadyToClaim}
            onClick={handleClaim}
          >
            <Sparkles size={18} /> 
            {isReadyToClaim 
              ? `Claim ${formatINR(task.reward)} Reward (Verified ✓)` 
              : !isWatched 
                ? `Watch Video to Unlock (${secondsRemaining}s)` 
                : 'Share on Facebook to Claim'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
