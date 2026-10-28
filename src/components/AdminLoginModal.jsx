import React, { useState } from 'react';
import { ShieldAlert, X, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const { switchRole, showToast, adminPassword } = useApp();
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const activeKey = (adminPassword || 'admin123').trim();
    if (passcode.trim() === activeKey) {
      setErrorMsg('');
      setPasscode('');
      switchRole('admin');
      if (onSuccess) onSuccess();
      onClose();
      showToast('🛡️ Administrator verified. Control center unlocked.');
    } else {
      setErrorMsg('Unauthorized: Invalid administrator master key.');
      showToast('Access denied: Incorrect administrative key.', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 420, padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>Admin Security Gate</h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Restricted access for system administrators</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              <span>Enter Master Security Key</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <KeyRound size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontSize: '0.95rem' }}
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errorMsg && (
              <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '0.4rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.5rem' }}>
              🔒 Restricted System • All Administrative Sessions Are Monitored
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              type="submit" 
              className="btn btn-danger btn-lg" 
              style={{ flex: 1, fontWeight: 700 }}
            >
              <Lock size={16} /> Authenticate Admin
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
