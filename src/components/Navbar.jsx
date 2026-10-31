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
  LogOut,
  Clock,
  Globe,
  ChevronDown,
  Check,
  User
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
    logoutUser,
    language,
    setLanguage,
    t,
    LANGUAGE_OPTIONS
  } = useApp();

  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const langRef = React.useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isLangOpen || isUserMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isLangOpen, isUserMenuOpen]);

  const activeLangOption = (LANGUAGE_OPTIONS || []).find((o) => o.code === language) || {
    code: 'en',
    label: 'English',
    native: 'English',
    flag: '🇬🇧',
  };

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
      <div className="navbar-container">
        {/* Warning banner if account is pending activation */}
        {user?.status === 'PENDING_ACTIVATION' && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.85rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#fbbf24', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={15} style={{ flexShrink: 0 }} />
              <span><strong>Account Pending Admin Activation:</strong> Payment approval is required before earning features and daily tasks unlock.</span>
            </div>
            <button 
              type="button" 
              onClick={() => setActiveTab('plans')} 
              style={{ background: 'rgba(245, 158, 11, 0.25)', border: 'none', color: '#fef3c7', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Check Plan / Deposit →
            </button>
          </div>
        )}

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
            style={{ cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <div className="brand-icon" style={{ flexShrink: 0 }}>
              <TrendingUp size={24} />
            </div>
            <div className="brand-text" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                <h1 className="gradient-text-emerald" style={{ whiteSpace: 'nowrap', margin: 0, wordBreak: 'keep-all', display: 'inline-block' }}>TaskCoin</h1>
                <span 
                  className="badge badge-emerald" 
                  style={{ fontSize: '0.62rem', cursor: 'pointer', userSelect: 'none', padding: '1px 5px', flexShrink: 0 }}
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
                <TrendingUp size={15} /> {t ? t('nav_dashboard') : 'Dashboard'}
              </button>

              <button 
                className={`nav-btn ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                <Layers size={15} /> {t ? t('nav_plans') : 'Plans'}
              </button>

              <button 
                className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <PlayCircle size={15} color="#fbbf24" /> {t ? t('nav_tasks') : 'Tasks'}
                <span className="badge badge-gold" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>EARN</span>
              </button>

              <button 
                className={`nav-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                <ArrowDownCircle size={15} /> {t ? t('nav_withdraw') : 'Payouts'}
              </button>

              <button 
                className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <History size={15} /> {t ? t('nav_history') : 'History'}
              </button>

              <button 
                className={`nav-btn ${activeTab === 'mlm' ? 'active' : ''}`}
                onClick={() => setActiveTab('mlm')}
              >
                <GitBranch size={15} /> {t ? t('nav_network') : 'MLM Network'}
              </button>
            </nav>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>
              <ShieldAlert size={16} />
              <span>{t ? t('nav_admin') : 'ADMINISTRATOR GOVERNANCE PORTAL'}</span>
            </div>
          )}

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {/* Compact Multi-Language Dropdown Selector */}
            <div style={{ position: 'relative', flexShrink: 0 }} ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="lang-globe-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '20px',
                  background: isLangOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isLangOpen ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: isLangOpen ? '#34d399' : '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Change Language / ভাষা পরিবর্তন করুন"
                aria-label="Change Language"
              >
                <Globe size={15} color="#34d399" />
                <span style={{ fontSize: '0.85rem' }}>{activeLangOption.flag}</span>
                <span style={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  {activeLangOption.code}
                </span>
                <ChevronDown 
                  size={12} 
                  style={{ 
                    transform: isLangOpen ? 'rotate(180deg)' : 'none', 
                    transition: 'transform 0.2s ease',
                    opacity: 0.7 
                  }} 
                />
              </button>

              {/* Dropdown Menu */}
              {isLangOpen && (
                <div 
                  className="lang-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: 175,
                    background: '#0f172a',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '12px',
                    padding: '0.4rem',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75), 0 0 15px rgba(16, 185, 129, 0.15)',
                    zIndex: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', padding: '0.3rem 0.5rem 0.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Language / ভাষা
                  </div>
                  {(LANGUAGE_OPTIONS || []).map((opt) => {
                    const isCurrent = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => {
                          if (setLanguage) setLanguage(opt.code);
                          setIsLangOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.55rem',
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          border: isCurrent ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                          background: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          color: isCurrent ? '#34d399' : '#f8fafc',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: isCurrent ? 800 : 500,
                          textAlign: 'left',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.05rem' }}>{opt.flag}</span>
                          <div>
                            <div style={{ fontSize: '0.82rem', lineHeight: 1.2 }}>{opt.native}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{opt.label}</div>
                          </div>
                        </div>
                        {isCurrent && <Check size={14} color="#34d399" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Wallet Pill (Investor Mode) */}
            {currentRole === 'investor' && user && (
              <button 
                onClick={() => setActiveTab('withdraw')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  padding: '0.32rem 0.55rem',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Your Task Reward Wallet — Click to withdraw"
              >
                <Wallet size={13} />
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
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  padding: '0.32rem 0.6rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Exit administrative mode"
              >
                <ShieldCheck size={14} />
                <span>Exit Admin</span>
              </button>
            )}

            {/* Unified User Account Menu Dropdown */}
            {user ? (
              <div style={{ position: 'relative', flexShrink: 0 }} ref={userMenuRef}>
                <button 
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    fontSize: '0.76rem', 
                    padding: '0.3rem 0.5rem',
                    borderRadius: '20px',
                    borderColor: user?.status === 'PENDING_ACTIVATION' ? 'rgba(245, 158, 11, 0.45)' : isUserMenuOpen ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.15)',
                    color: user?.status === 'PENDING_ACTIVATION' ? '#fbbf24' : isUserMenuOpen ? '#34d399' : '#f8fafc',
                    background: user?.status === 'PENDING_ACTIVATION' ? 'rgba(245, 158, 11, 0.12)' : isUserMenuOpen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                  title={user?.status === 'PENDING_ACTIVATION' ? 'Account Pending Admin Activation' : `Logged in as ${user?.name || 'Member'}`}
                  aria-label="User Account Menu"
                >
                  <div 
                    style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      background: user?.status === 'PENDING_ACTIVATION' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #06b6d4)', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ maxWidth: '62px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(user?.name || 'Member').split(' ')[0]}
                  </span>
                  {user?.status === 'PENDING_ACTIVATION' ? (
                    <span style={{ fontSize: '0.52rem', background: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '1px 3px', borderRadius: '4px', fontWeight: 800, flexShrink: 0 }}>
                      WAIT
                    </span>
                  ) : null}
                  <ChevronDown 
                    size={11} 
                    style={{ 
                      transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', 
                      transition: 'transform 0.2s ease',
                      opacity: 0.7,
                      flexShrink: 0
                    }} 
                  />
                </button>

                {/* User Menu Popover */}
                {isUserMenuOpen && (
                  <div className="user-dropdown-menu" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 99999 }}>
                    {/* User Card Header */}
                    <div style={{ padding: '0.35rem 0.5rem 0.55rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {user?.name || 'Member'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {user?.phone || user?.email || 'Verified Member'}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.45rem' }}>
                        {user?.status === 'PENDING_ACTIVATION' ? (
                          <span className="badge badge-amber" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={11} /> Pending Admin Activation
                          </span>
                        ) : (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <UserCheck size={11} /> Active Investor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <button
                        type="button"
                        className="user-menu-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenAuth) onOpenAuth();
                        }}
                      >
                        <User size={15} color="#34d399" />
                        <span>Account Profile & Security</span>
                      </button>

                      <button
                        type="button"
                        className="user-menu-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('withdraw');
                        }}
                        style={{ justifyContent: 'space-between' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Wallet size={15} color="#fbbf24" />
                          <span>Wallet & Payouts</span>
                        </div>
                        <strong style={{ color: '#34d399', fontSize: '0.78rem' }}>{formatINR(rewardWallet)}</strong>
                      </button>

                      <button
                        type="button"
                        className="user-menu-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('plans');
                        }}
                      >
                        <Layers size={15} color="#60a5fa" />
                        <span>My Membership Plans</span>
                      </button>

                      <button
                        type="button"
                        className="user-menu-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('tasks');
                        }}
                      >
                        <PlayCircle size={15} color="#fbbf24" />
                        <span>Daily Earning Tasks</span>
                      </button>

                      <button
                        type="button"
                        className="user-menu-btn"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('mlm');
                        }}
                      >
                        <GitBranch size={15} color="#a78bfa" />
                        <span>Referral & Team Network</span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.25rem', marginTop: '0.15rem' }}>
                      <button
                        type="button"
                        className="user-menu-btn logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logoutUser();
                        }}
                        style={{ color: '#f87171' }}
                      >
                        <LogOut size={14} color="#f87171" />
                        <span>Log Out of Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.78rem', padding: '0.32rem 0.65rem', whiteSpace: 'nowrap', flexShrink: 0 }}
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
