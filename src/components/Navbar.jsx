import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Lock, 
  Calendar, 
  PlayCircle, 
  ArrowDownCircle, 
  History, 
  Info, 
  UserCheck, 
  Zap, 
  Layers,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  GitBranch
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenPayout, onOpenDeposit, onOpenAdminLogin }) {
  const { 
    user, 
    rewardWallet, 
    totalLockedPrincipal, 
    isWithdrawalAllowed, 
    sundayStatus, 
    forceSunday, 
    toggleForceSunday,
    currentRole,
    switchRole
  } = useApp();

  const [secretClicks, setSecretClicks] = React.useState(0);

  const handleSecretTrigger = (e) => {
    e.stopPropagation();
    const nextCount = secretClicks + 1;
    if (nextCount >= 3) {
      setSecretClicks(0);
      if (onOpenAdminLogin) onOpenAdminLogin();
    } else {
      setSecretClicks(nextCount);
      setTimeout(() => setSecretClicks(0), 1800);
    }
  };

  return (
    <header className="navbar">
      <div className="app-container" style={{ paddingBottom: 0 }}>
        {/* Warning banner if account is suspended/deactivated */}
        {user?.status === 'SUSPENDED' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#fca5a5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} />
              <span><strong>Account Suspended:</strong> {user.suspensionReason || 'Please contact platform support.'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.25)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 600 }}>
              Support: helpdesk@earnflow.pro
            </span>
          </div>
        )}

        <div className="navbar-inner">
          {/* Logo & Brand */}
          <div 
            className="brand" 
            onClick={() => {
              if (currentRole === 'admin') switchRole('investor');
              setActiveTab('dashboard');
            }} 
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon">
              <TrendingUp size={24} />
            </div>
            <div className="brand-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h1 className="gradient-text-emerald">EarnFlow</h1>
                <span 
                  className="badge badge-emerald" 
                  style={{ fontSize: '0.65rem', cursor: 'pointer', userSelect: 'none' }}
                  onClick={handleSecretTrigger}
                  title="EarnFlow Pro Verified Network"
                >
                  PRO
                </span>
              </div>
              <span className="brand-tag">Community Monetization & Task Engine</span>
            </div>
          </div>

          {/* Quick Wallet Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Task Wallet */}
            <div 
              className="glass-card" 
              style={{ 
                padding: '0.45rem 0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.08)'
              }}
              title="Accumulated task earnings withdrawable every Sunday"
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <Wallet size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Task Wallet</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>{formatINR(rewardWallet)}</div>
              </div>
            </div>

            {/* Principal Locked */}
            <div 
              className="glass-card" 
              style={{ 
                padding: '0.45rem 0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                background: 'rgba(6, 182, 212, 0.06)'
              }}
              title="Locked deposit capital earning monthly compound return"
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
                <Lock size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Locked Principal</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22d3ee' }}>{formatINR(totalLockedPrincipal)}</div>
              </div>
            </div>

            {/* 24/7 Payouts Status */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}
              title="24/7 Anytime Payouts are enabled with Min ₹100 and 1 withdrawal per 24 hours"
            >
              <Zap size={14} color="#34d399" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
                24/7 Payouts Active
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                Min ₹100
              </span>
            </div>

            {/* Exit Admin Mode button - ONLY visible when admin is authenticated */}
            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  switchRole('investor');
                  setActiveTab('dashboard');
                }}
                className="btn btn-sm btn-danger"
                style={{ 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem'
                }}
                title="Exit administrative mode"
              >
                <ShieldCheck size={14} />
                <span>Exit Admin Mode</span>
              </button>
            )}

            {/* User Profile Button */}
            <button 
              onClick={onOpenAuth}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserCheck size={14} color="#34d399" />
              <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Investor View) */}
        {currentRole === 'investor' ? (
          <nav className="nav-links" style={{ marginTop: '1rem', width: 'fit-content' }}>
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <TrendingUp size={16} /> Dashboard
            </button>

            <button 
              className={`nav-btn ${activeTab === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              <Layers size={16} /> Membership Tiers
            </button>

            <button 
              className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <PlayCircle size={16} /> Task Center
              <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem' }}>EARN</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              <ArrowDownCircle size={16} /> Withdraw
            </button>

            <button 
              className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} /> History
            </button>

            <button 
              className={`nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
              onClick={() => setActiveTab('mlm')}
            >
              <GitBranch size={16} /> 2:1 Binary MLM
              <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem' }}>BONUS</span>
            </button>

            <button 
              className={`nav-btn ${activeTab === 'economics' ? 'active' : ''}`}
              onClick={() => setActiveTab('economics')}
            >
              <Info size={16} /> Reward Model
            </button>
          </nav>
        ) : (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>
              <ShieldAlert size={18} />
              <span>ADMINISTRATOR MODE: Full Control Over Users, Deposits & Withdrawals</span>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                switchRole('investor');
                setActiveTab('dashboard');
              }}
              style={{ fontSize: '0.75rem' }}
            >
              Return to Investor Dashboard →
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
