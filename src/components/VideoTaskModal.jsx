import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle, Clock, Award, Video, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function VideoTaskModal({ isOpen, onClose, task }) {
  const { completeTask } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(task?.duration || 20);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalDuration = task?.duration || 20;
  const progressPercent = Math.min(100, Math.round(((totalDuration - secondsRemaining) / totalDuration) * 100));

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setSecondsRemaining(task?.duration || 20);
      setIsCompleted(false);
      return;
    }

    let interval = null;
    if (isPlaying && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsCompleted(true);
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

  const handleClaim = () => {
    completeTask({
      taskId: task.id,
      taskTitle: task.title,
      rewardAmount: task.reward,
      meta: `Completed video watch (${totalDuration}s required)`,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <Video size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{task.title}</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Watch the educational wealth video for {totalDuration}s to unlock your reward
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Video Frame Simulation */}
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            background: '#090d16',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem'
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
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
                  color: '#ffffff',
                  marginBottom: '1rem',
                  transition: 'var(--transition)'
                }}
              >
                <Play size={28} fill="#ffffff" style={{ marginLeft: 3 }} />
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Click to Start Video
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Timer runs automatically while video is playing
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar & Countdown Timer */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
              <Clock size={16} color="#fbbf24" />
              <span>Watch Progress: {progressPercent}%</span>
            </div>
            <div style={{ fontWeight: 700, color: isCompleted ? '#34d399' : '#fbbf24' }}>
              {isCompleted ? '✓ Completed!' : `${secondsRemaining}s remaining`}
            </div>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                borderRadius: '4px',
                transition: 'width 0.5s ease-out'
              }}
            />
          </div>
        </div>

        {/* Reward Claim Banner */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1rem', 
            background: isCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            borderColor: isCompleted ? 'var(--emerald-500)' : 'var(--border-subtle)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Award size={22} color={isCompleted ? '#34d399' : '#fbbf24'} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Task Reward</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isCompleted ? '#34d399' : '#fbbf24' }}>
                +{formatINR(task.reward)}
              </div>
            </div>
          </div>

          <span className={`badge ${isCompleted ? 'badge-emerald' : 'badge-gold'}`}>
            {isCompleted ? 'Ready to Claim' : 'In Progress'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={!isCompleted}
            onClick={handleClaim}
          >
            <Sparkles size={18} /> {isCompleted ? `Claim ${formatINR(task.reward)} Reward` : `Watch to Unlock (${secondsRemaining}s)`}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
