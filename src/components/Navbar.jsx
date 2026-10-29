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
  GitBranch,
  LogOut
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
    switchRole,
    logoutUser
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
              Support: support@taskcoin.in
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
                <h1 className="gradient-text-emerald">TaskCoin</h1>
                <span 
                  className="badge badge-emerald" 
                  style={{ fontSize: '0.65rem', cursor: 'pointer', userSelect: 'none' }}
                  onClick={handleSecretTrigger}
                  title="TaskCoin Pro Verified Network"
                >
                  PRO
                </span>
              </div>
              <span className="brand-tag">Daily Task Rewards & Community Platform</span>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          {currentRole === 'investor' ? (
            <nav className="nav-links" style={{ margin: 0, overflowX: 'auto', maxWidth: '100%' }}>
              <button 
                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <TrendingUp size={15} /> Dashboard
              </button>

              <button 
                className={`nav-btn ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                <Layers size={15} /> Plans
              </button>

              <button 
                className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <PlayCircle size={15} color="#fbbf24" /> Tasks
                <span className="badge badge-gold" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>EARN</span>
              </button>

              <button 
                className={`nav-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                <ArrowDownCircle size={15} /> Payouts
              </button>

              <button 
                className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={15} /> History
              </button>

              <button 
                className={`nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
                onClick={() => setActiveTab('mlm')}
              >
                <GitBranch size={15} /> MLM Network
              </button>
            </nav>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>
              <ShieldAlert size={16} />
              <span>ADMINISTRATOR GOVERNANCE PORTAL</span>
            </div>
          )}

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            {/* Quick Wallet Pill (Investor Mode) */}
            {currentRole === 'investor' && user && (
              <button 
                onClick={() => setActiveTab('withdraw')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
                title="Your Task Reward Wallet — Click to withdraw"
              >
                <Wallet size={14} />
                <span>{formatINR(rewardWallet)}</span>
              </button>
            )}

            {/* Exit Admin Mode button */}
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
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem'
                }}
                title="Exit administrative mode"
              >
                <ShieldCheck size={14} />
                <span>Exit Admin</span>
              </button>
            )}

            {/* User Profile & Logout Controls */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button 
                  onClick={onOpenAuth}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  title={`Logged in as ${user?.name || 'Member'} (${user?.email || user?.phone || 'Verified'})`}
                >
                  <UserCheck size={14} color="#34d399" />
                  <span>{(user?.name || 'Member').split(' ')[0]}</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.3rem',
                    color: '#f87171',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.65rem'
                  }}
                  title="Log out of TaskCoin Pro"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                <UserCheck size={14} />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
