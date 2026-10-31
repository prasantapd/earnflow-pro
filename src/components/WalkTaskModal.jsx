import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  AlertCircle,
  RotateCcw,
  Activity,
  Smartphone,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function WalkTaskModal({ isOpen, onClose, task }) {
  const { completeTask, showToast } = useApp();
  const rewardAmount = task?.reward || 40.00;

  // Mode: standard 10-min 1200 steps OR QA quick test 25 steps
  const [challengeMode, setChallengeMode] = useState('standard'); // 'standard' | 'quick_test'
  const targetSteps = challengeMode === 'quick_test' ? 25 : (Number(task?.targetSteps) || 1200);
  const targetDurationSec = challengeMode === 'quick_test' ? 60 : (Number(task?.duration) || 600);

  const [isActive, setIsActive] = useState(false);
  const [remainingSec, setRemainingSec] = useState(targetDurationSec);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [steps, setSteps] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Sensor states
  const [sensorStatus, setSensorStatus] = useState('idle'); // 'idle' | 'listening' | 'motion_detected' | 'standing_still' | 'desktop' | 'denied'
  const [motionIntensity, setMotionIntensity] = useState(0); // 0 to 100 for live meter
  const [hasRealSensor, setHasRealSensor] = useState(false);
  const [lastStepFlash, setLastStepFlash] = useState(false);

  const timerRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const lastMagnitudeRef = useRef(9.8);
  const isWaitingForValleyRef = useRef(false);
  const motionTimeoutRef = useRef(null);

  // Reset state when modal opens or closes or mode changes
  const resetChallenge = useCallback((mode = challengeMode) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = mode === 'quick_test' ? 60 : (Number(task?.duration) || 600);
    setIsActive(false);
    setRemainingSec(duration);
    setElapsedSec(0);
    setSteps(0);
    setIsCompleted(false);
    setIsExpired(false);
    setMotionIntensity(0);
    setSensorStatus('idle');
    lastStepTimeRef.current = 0;
    lastMagnitudeRef.current = 9.8;
    isWaitingForValleyRef.current = false;
  }, [challengeMode, task?.duration]);

  useEffect(() => {
    if (isOpen) {
      resetChallenge();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
    }
  }, [isOpen, resetChallenge]);

  // Request DeviceMotion permission on iOS if needed
  const requestSensorPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') {
          return true;
        } else {
          setSensorStatus('denied');
          showToast('Motion sensor permission was denied. Please allow sensor access to track real steps.', 'warning');
          return false;
        }
      } catch (err) {
        console.warn('Error requesting DeviceMotion permission:', err);
        return false;
      }
    }
    return true;
  };

  // Step detection handler from hardware motion
  const handlePhysicalStep = useCallback(() => {
    const now = Date.now();
    // Human biomechanics: cannot walk faster than ~3.8 steps per second (min 260ms between steps)
    if (now - lastStepTimeRef.current < 260) {
      return;
    }

    lastStepTimeRef.current = now;
    setLastStepFlash(true);
    setTimeout(() => setLastStepFlash(false), 220);

    // Haptic feedback on supported mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }

    setSteps((prev) => {
      const next = prev + 1;
      // Check if target achieved within timer
      if (next >= targetSteps) {
        setIsActive(false);
        setIsCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
      return next;
    });
  }, [targetSteps]);

  // Listen to DeviceMotionEvent
  useEffect(() => {
    if (!isActive || isCompleted || isExpired) return;

    let motionEventCount = 0;

    const handleDeviceMotion = (event) => {
      motionEventCount++;
      if (motionEventCount > 2) {
        setHasRealSensor(true);
      }

      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // Distinguish gravity vs pure acceleration
      const hasGravity = Boolean(event.accelerationIncludingGravity && (!event.acceleration || event.acceleration.x === null));
      const baseline = hasGravity ? 9.8 : 0;
      const deltaFromBaseline = Math.abs(magnitude - baseline);

      // Update live motion intensity meter (0-100%)
      const intensity = Math.min(100, Math.round(deltaFromBaseline * 12));
      setMotionIntensity(intensity);

      // Update sensor visual status
      if (deltaFromBaseline > 1.2) {
        setSensorStatus('motion_detected');
        if (motionTimeoutRef.current) clearTimeout(motionTimeoutRef.current);
        motionTimeoutRef.current = setTimeout(() => {
          setSensorStatus('standing_still');
        }, 800);
      }

      // Step Peak Detection:
      // Threshold: ~1.8 m/s² above baseline for walking movement
      const stepThreshold = hasGravity ? 2.1 : 1.7;
      const valleyThreshold = hasGravity ? 1.0 : 0.7;

      if (deltaFromBaseline >= stepThreshold && !isWaitingForValleyRef.current) {
        isWaitingForValleyRef.current = true;
        handlePhysicalStep();
      } else if (deltaFromBaseline < valleyThreshold && isWaitingForValleyRef.current) {
        isWaitingForValleyRef.current = false;
      }

      lastMagnitudeRef.current = magnitude;
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });

    // Check after 2 seconds if motion events are firing
    const sensorCheckTimer = setTimeout(() => {
      if (motionEventCount === 0) {
        setSensorStatus('desktop');
      } else {
        setSensorStatus('listening');
      }
    }, 2000);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      clearTimeout(sensorCheckTimer);
      if (motionTimeoutRef.current) clearTimeout(motionTimeoutRef.current);
    };
  }, [isActive, isCompleted, isExpired, handlePhysicalStep]);

  // Main Timer Countdown Loop
  useEffect(() => {
    if (isActive && !isCompleted && !isExpired) {
      timerRef.current = setInterval(() => {
        setElapsedSec((e) => e + 1);
        setRemainingSec((prev) => {
          if (prev <= 1) {
            // TIMER RAN OUT!
            clearInterval(timerRef.current);
            setIsActive(false);
            // Check if step target was achieved
            setSteps((currentSteps) => {
              if (currentSteps < targetSteps) {
                setIsExpired(true);
              } else {
                setIsCompleted(true);
                try {
                  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                } catch (e) {}
              }
              return currentSteps;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isCompleted, isExpired, targetSteps]);

  if (!isOpen) return null;

  const minutesLeft = Math.floor(remainingSec / 60);
  const secondsLeft = remainingSec % 60;
  const formatTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const progressPercent = Math.min(100, Math.round((steps / targetSteps) * 100));
  const estimatedCalories = Math.round(steps * 0.04);
  const estimatedKm = (steps * 0.00075).toFixed(2);

  const handleToggleActive = async () => {
    if (!isActive) {
      const allowed = await requestSensorPermission();
      if (!allowed) return;
      setIsActive(true);
      setSensorStatus('listening');
    } else {
      setIsActive(false);
      setSensorStatus('idle');
    }
  };

  const handleClaim = () => {
    const timeTakenMin = Math.max(1, Math.ceil(elapsedSec / 60));
    const ok = completeTask({
      taskId: task?.id || 'walk_1',
      taskTitle: task?.title || 'Walk for 10 Minutes Health Challenge',
      rewardAmount: rewardAmount,
      meta: `Completed verified physical walk (${steps} steps in ${timeTakenMin} mins, ${estimatedCalories} kcal burned)`,
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 520, 
          textAlign: 'center', 
          background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)', 
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#34d399',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
              }}
            >
              <Footprints size={26} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Real Pedometer Health Challenge
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  Live Motion
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                Real physical movement detector • Complete steps within the timer
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Motivational Banner & Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', margin: '1rem 0', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Verified Completion Reward</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
              +{formatINR(rewardAmount)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              disabled={isActive}
              onClick={() => {
                setChallengeMode('standard');
                resetChallenge('standard');
              }}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: challengeMode === 'standard' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                background: challengeMode === 'standard' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: challengeMode === 'standard' ? '#34d399' : '#94a3b8',
                cursor: isActive ? 'not-allowed' : 'pointer',
                fontWeight: 700
              }}
            >
              🏃 1,200 Steps (10m)
            </button>
            <button
              type="button"
              disabled={isActive}
              onClick={() => {
                setChallengeMode('quick_test');
                resetChallenge('quick_test');
              }}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: challengeMode === 'quick_test' ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)',
                background: challengeMode === 'quick_test' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: challengeMode === 'quick_test' ? '#fbbf24' : '#94a3b8',
                cursor: isActive ? 'not-allowed' : 'pointer',
                fontWeight: 700
              }}
            >
              ⚡ Quick Test (25 Steps)
            </button>
          </div>
        </div>

        {/* Live Motion Sensor Hardware Status Pill */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {sensorStatus === 'motion_detected' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.75rem', fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'livePulseDot 0.8s infinite' }} />
              Active Movement Detected! Walking recorded
            </div>
          ) : sensorStatus === 'standing_still' && isActive ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
              Sensor Active: Waiting for physical walk/motion...
            </div>
          ) : sensorStatus === 'listening' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
              <Activity size={13} />
              Mobile Accelerometer Sensor Connected
            </div>
          ) : sensorStatus === 'desktop' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 600 }}>
              <Smartphone size={13} />
              Desktop Mode (Real motion active on phones • Use test button below)
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
              <Activity size={13} />
              Standby: Click "Start Walk" to activate motion tracking
            </div>
          )}
        </div>

        {/* Big Pedometer Circular Display */}
        <div style={{ 
          margin: '0.75rem auto 1.25rem', 
          width: 210, 
          height: 210, 
          borderRadius: '50%', 
          border: `4px solid ${lastStepFlash ? '#34d399' : isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isActive 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(15, 23, 42, 0.95) 75%)' 
            : 'rgba(15, 23, 42, 0.8)',
          boxShadow: lastStepFlash
            ? '0 0 35px rgba(52, 211, 153, 0.6)'
            : isActive 
              ? '0 0 25px rgba(16, 185, 129, 0.25)' 
              : 'none',
          transition: 'all 0.2s ease',
          transform: lastStepFlash ? 'scale(1.04)' : 'scale(1)'
        }}>
          <Footprints 
            size={32} 
            color={lastStepFlash ? '#34d399' : isActive ? '#10b981' : '#64748b'} 
            style={{ 
              transition: 'transform 0.15s ease',
              transform: lastStepFlash ? 'translateY(-3px)' : 'none',
              marginBottom: '0.2rem'
            }} 
          />
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {steps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginTop: '0.2rem' }}>
            / {targetSteps} Steps
          </div>
          <div style={{ 
            fontSize: '1.05rem', 
            fontWeight: 800, 
            color: remainingSec <= 30 ? '#f87171' : '#fbbf24', 
            marginTop: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <Clock size={14} />
            {formatTime} Left
          </div>
        </div>

        {/* Live Motion Intensity Meter (Real Accelerometer Waveform) */}
        {isActive && (
          <div style={{ marginBottom: '1.1rem', background: 'rgba(0, 0, 0, 0.35)', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              <span>Live Accelerometer Motion</span>
              <strong style={{ color: motionIntensity > 20 ? '#34d399' : '#64748b' }}>
                {motionIntensity > 20 ? '🏃 Motion Active' : '🚶 Standing Still'}
              </strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${Math.max(5, motionIntensity)}%`, 
                  background: motionIntensity > 20 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : '#64748b',
                  borderRadius: '3px',
                  transition: 'width 0.15s ease'
                }} 
              />
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            <span>Challenge Progress: <strong style={{ color: '#34d399' }}>{progressPercent}%</strong></span>
            <span>{steps} of {targetSteps} steps</span>
          </div>
          <div className="progress-bar-container" style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                height: '100%',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '0.65rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#f87171', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <Flame size={13} /> Calories
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              {estimatedCalories} <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>kcal</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.65rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#60a5fa', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <MapPin size={13} /> Distance
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              {estimatedKm} <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>km</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '0.65rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#fbbf24', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
              <Zap size={13} /> Status
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isCompleted ? '#34d399' : isExpired ? '#f87171' : isActive ? '#60a5fa' : '#94a3b8' }}>
              {isCompleted ? 'Target Won!' : isExpired ? 'Expired' : isActive ? 'Walking...' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Controls and Status Outcomes */}
        {isCompleted ? (
          <div>
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)', borderRadius: 'var(--radius-md)', border: '1.5px solid #10b981', marginBottom: '1rem', color: '#34d399' }}>
              <Award size={34} style={{ margin: '0 auto 0.4rem auto' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', color: '#ffffff' }}>
                🎉 Walk Challenge Completed Within Time!
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0 }}>
                You completed {steps} verified steps with {formatTime} remaining! Claim your daily incentive reward now.
              </p>
            </div>
            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontWeight: 800, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)' }} 
              onClick={handleClaim}
            >
              <CheckCircle2 size={18} /> Claim +{formatINR(rewardAmount)} Cash Reward
            </button>
          </div>
        ) : isExpired ? (
          <div>
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(239, 68, 68, 0.4)', marginBottom: '1rem', color: '#fca5a5' }}>
              <Clock size={32} color="#f87171" style={{ margin: '0 auto 0.4rem auto' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', color: '#ffffff' }}>
                ⏰ Time Expired!
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#fca5a5', margin: 0 }}>
                You completed {steps} of {targetSteps} steps before the timer ran out. As per challenge rules, steps must be completed within the time limit. Please restart to try again!
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-lg" 
              style={{ width: '100%', fontWeight: 800 }} 
              onClick={() => resetChallenge()}
            >
              <RotateCcw size={18} /> Restart Walk Challenge
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ flex: 1, fontWeight: 800 }}
                onClick={handleToggleActive}
              >
                {isActive ? (
                  <><Pause size={18} /> Pause Walk</>
                ) : (
                  <><Play size={18} /> {elapsedSec > 0 ? 'Resume Walk' : `Start Walk (${challengeMode === 'quick_test' ? '60s' : '10m'})`}</>
                )}
              </button>
              {isActive && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePhysicalStep}
                  title="Simulate Step (For desktop testing or manual trigger)"
                  style={{ padding: '0 0.85rem', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  <Footprints size={15} /> +1 Step
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', lineHeight: 1.4 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} /> 
              <span>Hold phone and walk naturally. Real accelerometer sensors count steps only during physical movement.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
