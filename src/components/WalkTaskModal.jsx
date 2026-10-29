import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Footprints, 
  Play, 
  Pause, 
  Flame, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Award,
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function WalkTaskModal({ isOpen, onClose, task }) {
  const { completeTask } = useApp();
  const rewardAmount = task?.reward || 40.00;
  const targetDurationSec = Number(task?.duration) || 600; // 10 minutes = 600 seconds
  const targetSteps = 1200; // ~120 steps/min for 10 mins

  const [isActive, setIsActive] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [steps, setSteps] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsActive(false);
      setElapsedSec(0);
      setSteps(0);
      setIsCompleted(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isActive && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1;
          // Step increment: ~2 steps per second
          setSteps((s) => Math.min(targetSteps, s + Math.floor(Math.random() * 2) + 1));

          if (next >= targetDurationSec) {
            clearInterval(timerRef.current);
            setIsActive(false);
            setIsCompleted(true);
            setSteps(targetSteps);
            return targetDurationSec;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isCompleted, targetDurationSec]);

  if (!isOpen) return null;

  const remainingSec = Math.max(0, targetDurationSec - elapsedSec);
  const minutesLeft = Math.floor(remainingSec / 60);
  const secondsLeft = remainingSec % 60;
  const formatTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const progressPercent = Math.min(100, Math.round((elapsedSec / targetDurationSec) * 100));
  const estimatedCalories = Math.round(steps * 0.04);
  const estimatedKm = (steps * 0.00075).toFixed(2);

  const handleClaim = () => {
    const ok = completeTask({
      taskId: task?.id || 'walk_1',
      taskTitle: task?.title || 'Walk for 10 Minutes Health Challenge',
      rewardAmount: rewardAmount,
      meta: `Completed 10-minute fitness walk (${targetSteps} steps, ${estimatedCalories} kcal burned)`,
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, textAlign: 'center' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Footprints size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Walk for 10 Minutes</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Health Pedometer & Motion Activity Tracker
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Motivational Banner */}
        <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Health Incentive</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
              +{formatINR(rewardAmount)}
            </div>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
            <Clock size={11} /> 10 Mins / 1,200 Steps
          </span>
        </div>

        {/* Big Pedometer Circular Display */}
        <div style={{ 
          margin: '1.5rem auto', 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          border: '4px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isActive ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 70%)' : 'rgba(15, 23, 42, 0.6)',
          boxShadow: isActive ? '0 0 25px rgba(16, 185, 129, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <Footprints 
            size={32} 
            color={isActive ? '#34d399' : '#64748b'} 
            style={{ 
              animation: isActive ? 'pulse 1s infinite' : 'none',
              marginBottom: '0.3rem'
            }} 
          />
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
            {steps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            / {targetSteps} Steps
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.2rem' }}>
            {formatTime}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            <span>Target Progress: {progressPercent}%</span>
            <span>{remainingSec > 0 ? `${remainingSec}s remaining` : 'Target Achieved!'}</span>
          </div>
          <div className="progress-bar-container" style={{ height: 8, background: 'rgba(255,255,255,0.06)' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' 
              }} 
            />
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#f87171', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <Flame size={14} /> Calories
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              {estimatedCalories} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>kcal</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#60a5fa', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <MapPin size={14} /> Distance
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              {estimatedKm} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>km</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#fbbf24', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <Zap size={14} /> Status
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isCompleted ? '#34d399' : isActive ? '#60a5fa' : '#94a3b8' }}>
              {isCompleted ? 'Finished' : isActive ? 'Walking...' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Controls */}
        {isCompleted ? (
          <div>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981', marginBottom: '1rem', color: '#34d399' }}>
              <Award size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem' }}>
                10-Minute Walk Challenge Completed!
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                You completed 1,200 steps and maintained active movement for 10 minutes. Claim your verified health reward now!
              </p>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', fontWeight: 800, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} onClick={handleClaim}>
              <CheckCircle2 size={18} /> Claim +{formatINR(rewardAmount)} Cash Reward
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ flex: 1, fontWeight: 700 }}
                onClick={() => setIsActive(!isActive)}
              >
                {isActive ? <><Pause size={18} /> Pause Walk</> : <><Play size={18} /> {elapsedSec > 0 ? 'Resume Walk' : 'Start 10-Min Walk'}</>}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <AlertCircle size={13} /> Keep phone or browser open while walking to record steps accurately.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
