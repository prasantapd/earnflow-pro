import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Award,
  KeyRound,
  CheckCircle2,
  Gift,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthView({ onOpenAdminLogin }) {
  const { registerUser, loginUser, requestPasswordReset, showToast, allUsers } = useApp();
  const [isLoginMode, setIsLoginMode] = useState(false); // Default to register or toggle to login

  // Password visibility states
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration form (No OTP required!)
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  // Login form
  const [loginForm, setLoginForm] = useState({
    identifier: '', // email or phone
    password: '',
  });

  // Auto-detect referral code from URL or storage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#\/?/, '?'));
      const urlRef = params.get('ref') || params.get('referral') || params.get('referralCode') || params.get('sponsor') || hashParams.get('ref') || hashParams.get('referral');
      const storedRef = sessionStorage.getItem('taskcoin_ref_code') || localStorage.getItem('taskcoin_ref_code');
      const effectiveRef = (urlRef || storedRef || '').trim().toUpperCase();

      if (effectiveRef) {
        sessionStorage.setItem('taskcoin_ref_code', effectiveRef);
        localStorage.setItem('taskcoin_ref_code', effectiveRef);
        setRegForm((prev) => ({
          ...prev,
          referralCode: effectiveRef,
        }));
        setIsLoginMode(false); // Direct recipient straight to registration form

        const leg = params.get('leg') || hashParams.get('leg');
        if (leg) {
          sessionStorage.setItem('taskcoin_ref_leg', leg.trim().toUpperCase());
        }
      }
    } catch (e) {
      console.warn('Error reading referral params:', e);
    }
  }, []);

  // Sponsor lookup based on current referral code
  const activeSponsor = (allUsers || []).find(
    (u) => (u.referralCode && u.referralCode.toUpperCase() === regForm.referralCode.trim().toUpperCase()) ||
           (u.phone && u.phone === regForm.referralCode.trim().toUpperCase()) ||
           (u.id && u.id.toUpperCase() === regForm.referralCode.trim().toUpperCase())
  );

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [unregisteredPhone, setUnregisteredPhone] = useState(null); // When number not registered
  const [forgotError, setForgotError] = useState('');

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.phone.trim() || !regForm.password.trim()) {
      showToast('Please fill in your Name, Mobile Number, and Password.', 'error');
      return;
    }
    if (regForm.password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    const emailValue = regForm.email.trim()
      ? regForm.email.trim().toLowerCase()
      : `${regForm.phone.replace(/\D/g, '') || 'user'}@earnflow.app`;

    const legValue = sessionStorage.getItem('taskcoin_ref_leg') || undefined;
    const refCodeSubmitted = regForm.referralCode.trim().toUpperCase() || undefined;

    const success = registerUser({
      name: regForm.name.trim(),
      email: emailValue,
      phone: regForm.phone.trim(),
      password: regForm.password,
      referralCode: refCodeSubmitted,
      referredBy: refCodeSubmitted,
      leg: legValue,
    });

    if (success) {
      sessionStorage.removeItem('taskcoin_ref_code');
      sessionStorage.removeItem('taskcoin_ref_leg');
      localStorage.removeItem('taskcoin_ref_code');
      showToast('Welcome! Your account is active. Instant login (No OTP required)!', 'success');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setUnregisteredPhone(null);

    const cleanInput = forgotPhone.trim();
    if (!cleanInput) {
      setForgotError('Please enter your mobile number.');
      return;
    }

    let res = requestPasswordReset(cleanInput);

    if (!res || !res.found) {
      // Check live server directly in case user registered on another device/browser
      try {
        const apiRes = await fetch('/api/password-reset/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanInput }),
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && apiData.success) {
            res = { success: true, found: true, user: apiData.user };
          }
        }
      } catch (err) {
        // Fallback
      }
    }

    if (res && res.success && res.found) {
      // User found and registered!
      setForgotSubmitted(true);
      setUnregisteredPhone(null);
    } else if (res && res.found === false) {
      // Number NOT registered!
      setUnregisteredPhone(cleanInput);
      setForgotSubmitted(false);
    } else {
      setForgotError('Please enter a valid 10-digit mobile number.');
    }
  };

  const handleGoToRegisterWithPhone = (phoneNum) => {
    // Fill phone into reg form
    setRegForm((prev) => ({
      ...prev,
      phone: phoneNum || prev.phone
    }));
    // Close modal
    setIsForgotModalOpen(false);
    setUnregisteredPhone(null);
    setForgotSubmitted(false);
    // Switch to Registration mode
    setIsLoginMode(false);
    showToast(`Mobile number ${phoneNum} pre-filled. Complete registration to start earning!`, 'info');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
      showToast('Please enter your Mobile/Email and Password.', 'error');
      return;
    }

    const success = loginUser({
      identifier: loginForm.identifier.trim(),
      password: loginForm.password,
    });

    if (!success) {
      showToast('Invalid Mobile/Email or Password. Please check or Register.', 'error');
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '85vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem 1rem' 
      }}
    >
      <div 
        className="glass-card" 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          padding: '2.25rem', 
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.15)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div 
            style={{ 
              width: 54, 
              height: 54, 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              margin: '0 auto 0.75rem auto',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Coins size={30} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
            <h1 className="gradient-text-emerald" style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              TaskCoin
            </h1>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px' }}>
              PRO
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Task Monetization, Progressive Streaks & Community Rewards
          </p>
        </div>

        {/* User-friendly Trust & Highlights Strip */}
        <div className="trust-strip">
          <div className="trust-strip-item" style={{ color: '#34d399' }}>
            <Zap size={13} />
            <span>24/7 UPI Payouts</span>
          </div>
          <div className="trust-strip-item" style={{ color: '#fbbf24' }}>
            <Gift size={13} />
            <span>2-Day Free Trial</span>
          </div>
          <div className="trust-strip-item" style={{ color: '#22d3ee' }}>
            <ShieldCheck size={13} />
            <span>100% Capital Refund</span>
          </div>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div 
          style={{ 
            display: 'flex', 
            background: 'rgba(0, 0, 0, 0.4)', 
            padding: '0.3rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <button
            type="button"
            onClick={() => setIsLoginMode(false)}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: !isLoginMode ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: !isLoginMode ? '#ffffff' : '#94a3b8',
              boxShadow: !isLoginMode ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={() => setIsLoginMode(true)}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isLoginMode ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : 'transparent',
              color: isLoginMode ? '#ffffff' : '#94a3b8',
              boxShadow: isLoginMode ? '0 2px 10px rgba(6, 182, 212, 0.3)' : 'none'
            }}
          >
            Log In
          </button>
        </div>

        {/* REGISTRATION FORM */}
        {!isLoginMode && (
          <form onSubmit={handleRegisterSubmit}>
            {regForm.referralCode && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                  <Gift size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Referral Invitation Verified</span>
                    <CheckCircle2 size={15} />
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    Registering under sponsor: <strong style={{ color: '#fbbf24' }}>{activeSponsor ? `${activeSponsor.name} (${regForm.referralCode})` : regForm.referralCode}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <span>Full Name *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <span>Mobile Phone (10 digits) *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                <span>Email Address (Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="Optional (e.g. you@example.com)"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Password *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem', fontSize: '0.85rem' }}
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Confirm Password *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem', fontSize: '0.85rem' }}
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <span>Referral Code (Optional)</span>
                </label>
                {regForm.referralCode && (
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={12} /> Pre-filled from Referral Link
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Gift size={16} color="#fbbf24" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. TC100 (optional)"
                  className="input-field"
                  style={{ 
                    paddingLeft: '2.5rem', 
                    fontFamily: 'monospace', 
                    textTransform: 'uppercase',
                    borderColor: regForm.referralCode ? 'rgba(52, 211, 153, 0.5)' : undefined,
                    background: regForm.referralCode ? 'rgba(16, 185, 129, 0.05)' : undefined
                  }}
                  value={regForm.referralCode}
                  onChange={(e) => setRegForm({ ...regForm, referralCode: e.target.value.toUpperCase() })}
                />
              </div>
              {activeSponsor && (
                <div style={{ fontSize: '0.74rem', color: '#34d399', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>👤 Sponsor: <strong>{activeSponsor.name}</strong> ({activeSponsor.phone || activeSponsor.id})</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontWeight: 800, padding: '0.75rem', marginBottom: '1rem' }}
            >
              <span>Create Account & Start Earning (No OTP)</span>
              <ArrowRight size={17} />
            </button>

            {/* Quick Switch / Forgot Password Helper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0 0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>Already have an account?</span>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#34d399',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Log In
                </button>
                <span style={{ color: '#475569' }}>|</span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPhone(regForm.phone || '');
                    setForgotSubmitted(false);
                    setUnregisteredPhone(null);
                    setForgotError('');
                    setIsForgotModalOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </form>
        )}

        {/* LOGIN FORM */}
        {isLoginMode && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label">
                <span>Mobile Number or Email *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="Enter registered mobile or email"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">
                <span>Security Password *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Need access?</span>
              <button
                type="button"
                onClick={() => {
                  setForgotPhone(loginForm.identifier || '');
                  setForgotSubmitted(false);
                  setUnregisteredPhone(null);
                  setForgotError('');
                  setIsForgotModalOpen(true);
                }}
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <KeyRound size={13} />
                <span>Forgot Password? (পাসওয়ার্ড রিসেট)</span>
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontWeight: 800, padding: '0.75rem', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' }}
            >
              <span>Log In to TaskCoin</span>
              <ArrowRight size={17} />
            </button>
          </form>
        )}

        {/* Bottom Security Footer & Admin Switch */}
        <div 
          style={{ 
            marginTop: '1.75rem', 
            paddingTop: '1.25rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>256-Bit SSL Encrypted</span>
          </div>

          <button
            type="button"
            onClick={onOpenAdminLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.74rem',
              textDecoration: 'underline'
            }}
          >
            🛡️ Admin Login
          </button>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL (No OTP - Admin SMS Reset) */}
      {isForgotModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            className="glass-card"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <KeyRound size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Password Reset Request</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsForgotModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Case 1: Number NOT Registered -> Show message and redirect button */}
            {unregisteredPhone ? (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <AlertCircle size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>
                  মোবাইল নম্বরটি রেজিস্টার্ড নয়!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  আপনার দেওয়া নম্বর (<strong style={{ color: '#38bdf8' }}>{unregisteredPhone}</strong>) দিয়ে কোনো অ্যাকাউন্ট খোলা নেই। পাসওয়ার্ড পাওয়ার আগে আপনাকে প্রথমে একটি অ্যাকাউন্ট তৈরি করতে হবে।
                </p>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, marginBottom: '0.2rem' }}>
                    💡 কোনো OTP লাগবে না!
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    এই নম্বরে সাথে সাথে নতুন অ্যাকাউন্ট তৈরি করে আজ থেকেই ইনকাম শুরু করুন।
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    onClick={() => handleGoToRegisterWithPhone(unregisteredPhone)}
                  >
                    <UserPlus size={16} />
                    <span>নতুন অ্যাকাউন্ট খুলুন (Register Now)</span>
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setUnregisteredPhone(null);
                      setForgotError('');
                    }}
                  >
                    অন্য নম্বর দিয়ে চেষ্টা করুন
                  </button>
                </div>
              </div>
            ) : !forgotSubmitted ? (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  কোনো OTP লাগবে না। আপনার রেজিস্টার্ড মোবাইল নম্বর দিলে অ্যাডমিন টিম আপনার নম্বরে সাধারণ <strong style={{ color: '#38bdf8' }}>SMS</strong> করে নতুন পাসওয়ার্ড পাঠিয়ে দেবে।
                </p>

                {forgotError && (
                  <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    {forgotError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">
                    <span>Registered Mobile Number *</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setIsForgotModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.5, fontWeight: 700, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                  >
                    Send Request
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem' }}>
                  রিকোয়েস্ট সফলভাবে জমা হয়েছে!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  অ্যাডমিন টিম আপনার রেজিস্টার্ড মোবাইল নম্বর (<strong style={{ color: '#38bdf8' }}>{forgotPhone}</strong>) এ একটি নতুন পাসওয়ার্ড সহ SMS পাঠাবে। আপনি সেই পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।
                </p>
                <button 
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', fontWeight: 700 }}
                  onClick={() => setIsForgotModalOpen(false)}
                >
                  OK (লগইন পেজে যান)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
