import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Music, Volume2, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function MusicTaskModal({ isOpen, onClose, task }) {
  const { completeTask } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(task?.duration || 20);
  const [isCompleted, setIsCompleted] = useState(false);
  const audioCtxRef = useRef(null);
  const oscNodesRef = useRef([]);

  const totalDuration = task?.duration || 20;
  const progressPercent = Math.min(100, Math.round(((totalDuration - secondsRemaining) / totalDuration) * 100));

  // Synthesize relaxing lo-fi ambient audio using Web Audio API
  const startAudioSynth = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Play soft ambient chords
      const freqs = [220, 277.18, 329.63, 440]; // A major ambient chord
      oscNodesRef.current = freqs.map((f) => {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        return { osc, gain };
      });
    } catch (e) {
      console.warn('Audio synthesis note:', e);
    }
  };

  const stopAudioSynth = () => {
    try {
      oscNodesRef.current.forEach(({ osc, gain }) => {
        gain.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
        setTimeout(() => {
          try { osc.stop(); } catch (err) {}
        }, 150);
      });
      oscNodesRef.current = [];
    } catch (e) {}
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudioSynth();
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
            stopAudioSynth();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, secondsRemaining, task]);

  const togglePlay = () => {
    if (!isPlaying) {
      startAudioSynth();
      setIsPlaying(true);
    } else {
      stopAudioSynth();
      setIsPlaying(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleClaim = () => {
    completeTask({
      taskId: task.id,
      taskTitle: task.title,
      rewardAmount: task.reward,
      meta: `Completed music listening task (${totalDuration}s duration)`,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Music size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{task.title}</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Listen to the focus track for {totalDuration}s to unlock your reward
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Music Album Artwork & Equalizer Card */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '2rem 1.5rem', 
            textAlign: 'center', 
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Vinyl Disc Animation */}
          <div 
            style={{ 
              width: 130, 
              height: 130, 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, #312e81 0%, #1e1b4b 60%, #0f172a 100%)',
              border: '3px solid rgba(165, 180, 252, 0.4)',
              boxShadow: isPlaying ? '0 0 35px rgba(99, 102, 241, 0.6)' : '0 10px 25px rgba(0, 0, 0, 0.5)',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isPlaying ? 'spinDisc 6s linear infinite' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Music size={20} />
            </div>
          </div>

          <style>
            {`
              @keyframes spinDisc {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes waveBar {
                0%, 100% { height: 6px; }
                50% { height: 28px; }
              }
            `}
          </style>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            Alpha Mindset Lo-Fi Stream
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Curated Wealth Frequencies (432Hz Ambient)
          </div>

          {/* Equalizer Waveform Bars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '32px', marginBottom: '1.25rem' }}>
            {[14, 22, 10, 26, 18, 28, 16, 24, 12, 20, 28, 15].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  borderRadius: '2px',
                  background: isPlaying ? 'linear-gradient(180deg, #818cf8, #6366f1)' : 'rgba(255, 255, 255, 0.15)',
                  height: isPlaying ? `${h}px` : '6px',
                  animation: isPlaying ? `waveBar 1.${(i % 5) + 2}s infinite ease-in-out` : 'none',
                  animationDelay: `${i * 0.1}s`,
                  transition: 'height 0.2s ease'
                }}
              />
            ))}
          </div>

          {/* Audio Play/Pause Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={togglePlay}
            style={{ 
              borderRadius: 'var(--radius-full)', 
              padding: '0.65rem 1.75rem',
              background: isPlaying ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: isPlaying ? '0 4px 15px rgba(244, 63, 94, 0.4)' : '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#ffffff" />}
            <span>{isPlaying ? 'Pause Track' : 'Play Music & Start Timer'}</span>
          </button>
        </div>

        {/* Progress & Countdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
              <Clock size={16} color="#818cf8" />
              <span>Listening Progress: {progressPercent}%</span>
            </div>
            <div style={{ fontWeight: 700, color: isCompleted ? '#34d399' : '#818cf8' }}>
              {isCompleted ? '✓ 100% Completed!' : `${secondsRemaining}s remaining`}
            </div>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #818cf8)',
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
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Task Cash Reward</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isCompleted ? '#34d399' : '#818cf8' }}>
              +{formatINR(task.reward)}
            </div>
          </div>

          <span className={`badge ${isCompleted ? 'badge-emerald' : 'badge-indigo'}`}>
            {isCompleted ? 'Ready to Claim' : 'Listening...'}
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
            <Sparkles size={18} /> {isCompleted ? `Claim ${formatINR(task.reward)} Reward` : `Listen to Unlock (${secondsRemaining}s)`}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
