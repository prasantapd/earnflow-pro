import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthModal({ isOpen, onClose }) {
  const { user, registerUser, requestPasswordReset, showToast } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '••••••••',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast('Please fill in Name, Email, and Phone Number.', 'error');
      return;
    }
    registerUser(formData);
    onClose();
  };

  const loadSampleUser = (sample) => {
    setFormData(sample);
    registerUser(sample);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {isRegisterMode ? 'Create New Account' : 'User Account & Profile'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {isRegisterMode ? 'Register to start depositing and earning daily rewards' : 'Manage your verified investor identity'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current profile status badge */}
        {!isRegisterMode && (
          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem', 
              marginBottom: '1.5rem', 
              background: 'rgba(16, 185, 129, 0.08)', 
              borderColor: 'rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{user?.email}</div>
                <div style={{ fontSize: '0.78rem', color: '#34d399' }}>{user?.phone}</div>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsRegisterMode(true)}
              style={{ fontSize: '0.78rem' }}
            >
              Switch / New
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              <span>Full Name</span>
              <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Required</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. Priya Patel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
              <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Account Notifications</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label">
              <span>Phone Number</span>
              <span style={{ fontSize: '0.72rem', color: '#10b981' }}>UPI / OTP Authentication</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <span>Security Password</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (formData.phone) {
                    requestPasswordReset(formData.phone);
                  } else {
                    showToast('Please enter mobile number to reset password.', 'error');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot / Reset Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isRegisterMode ? 'Complete Registration' : 'Save Profile Changes'}
            </button>
            {isRegisterMode && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsRegisterMode(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Quick Demo Pre-sets */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} color="#f59e0b" /> Quick Demo Profiles:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadSampleUser({
                name: 'Aarav Sharma',
                email: 'aarav.sharma@wealth.in',
                phone: '+91 98765 43210',
                password: '••••••••'
              })}
            >
              Aarav Sharma
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadSampleUser({
                name: 'Rohan Mehta',
                email: 'rohan.mehta@invest.io',
                phone: '+91 91234 56789',
                password: '••••••••'
              })}
            >
              Rohan Mehta
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadSampleUser({
                name: 'Ananya Roy',
                email: 'ananya.roy@growth.net',
                phone: '+91 99887 76655',
                password: '••••••••'
              })}
            >
              Ananya Roy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
