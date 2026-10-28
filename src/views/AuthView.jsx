import React, { useState } from 'react';
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
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthView({ onOpenAdminLogin }) {
  const { registerUser, loginUser, showToast } = useApp();
  const [isLoginMode, setIsLoginMode] = useState(false); // Default to register or toggle to login

  // Registration form
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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.phone.trim() || !regForm.password.trim()) {
      showToast('Please fill in all required fields.', 'error');
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

    const success = registerUser({
      name: regForm.name.trim(),
      email: regForm.email.trim().toLowerCase(),
      phone: regForm.phone.trim(),
      password: regForm.password,
      referralCode: regForm.referralCode.trim().toUpperCase() || undefined,
    });

    if (success) {
      showToast('Welcome to TaskCoin Pro! Your account is active and ready.', 'success');
    }
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
                <span>Email Address *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
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
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Confirm Password *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Repeat"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                <span>Referral Code (Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Gift size={16} color="#fbbf24" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. TC100 (optional)"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  value={regForm.referralCode}
                  onChange={(e) => setRegForm({ ...regForm, referralCode: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', fontWeight: 800, padding: '0.75rem' }}
            >
              <span>Create Account & Start Earning</span>
              <ArrowRight size={17} />
            </button>
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

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">
                <span>Security Password *</span>
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
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
    </div>
  );
}
