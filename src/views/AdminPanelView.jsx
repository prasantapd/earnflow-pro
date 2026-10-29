import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Key, 
  Trash2, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  CreditCard, 
  Phone, 
  Mail, 
  Lock, 
  Unlock, 
  ShieldCheck,
  Send,
  Sliders,
  FileText,
  Video,
  Share2,
  ExternalLink,
  Clock,
  Play,
  Gamepad2,
  Footprints,
  Music,
  Brain,
  Grid,
  Sparkles,
  Zap,
  Activity,
  Building2,
  QrCode,
  Megaphone,
  Copy,
  Check,
  Save,
  Calendar,
  Globe,
  Eye,
  EyeOff,
  KeyRound,
  Flame,
  CalendarCheck,
  MessageSquare,
  PhoneCall,
  Coins,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';
import { getLocalDateString, getUpcoming7Days, formatFullReadableDate, formatReadableDate } from '../utils/dateUtils';

export default function AdminPanelView() {
  const { 
    allUsers, 
    depositRequests, 
    withdrawalRequests, 
    activateUser, 
    deactivateUser, 
    suspendUser, 
    deleteUser, 
    resetUserPassword, 
    approveDeposit, 
    rejectDeposit, 
    approveWithdrawal, 
    rejectWithdrawal,
    totalLockedPrincipal,
    forceSunday,
    toggleForceSunday,
    showToast,
    dailyTaskRoster,
    dailyVideoTasks,
    taskRosterPresets,
    applyTaskRosterPreset,
    addCustomDailyTask,
    updateDailyTask,
    deleteDailyTask,
    toggleDailyTaskStatus,
    gamingStats,
    paymentSettings,
    updatePaymentSettings,
    adminAnnouncement,
    updateAdminAnnouncement,
    // 7-Day Date-Wise Task Scheduling
    scheduledTasksByDate,
    addTaskForDate,
    updateTaskForDate,
    deleteTaskForDate,
    toggleTaskStatusForDate,
    copyTasksToDate,
    applyPresetToDate,
    // Admin Master Authentication & Password
    adminPassword,
    updateAdminPassword,
    switchRole,
    // Daily Login Streak Configuration
    streakRewards,
    updateStreakRewards,
    // Password Reset via SMS Requests
    passwordResetRequests,
    resolvePasswordReset
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users', 'deposits', 'withdrawals', 'settings', 'tasks', 'payments', 'broadcast', 'security', 'streak', 'reset_requests'
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Daily Streak Rewards Editor Local State
  const [editableStreak, setEditableStreak] = useState(() => ({ ...(streakRewards || {}) }));
  const [streakPreviewTier, setStreakPreviewTier] = useState(2000); // 2000 (1.0x Base), 5000 (2.5x), 10000 (5.0x), etc.

  // Keep in sync when streakRewards changes from context
  React.useEffect(() => {
    if (streakRewards) {
      setEditableStreak({ ...streakRewards });
    }
  }, [streakRewards]);

  // Handle saving streak rewards
  const handleSaveStreakRewards = (e) => {
    e.preventDefault();
    updateStreakRewards(editableStreak);
  };

  // Preset generator for Daily Streak Rewards
  const handleApplyStreakPreset = (type) => {
    let preset = {};
    if (type === 'conservative') {
      for (let i = 1; i <= 30; i++) {
        preset[i] = ((i - 1) % 7) + 1;
      }
    } else if (type === 'generous') {
      for (let i = 1; i <= 30; i++) {
        preset[i] = 3 + ((i - 1) % 7) * 2;
      }
    } else if (type === 'highroller') {
      for (let i = 1; i <= 30; i++) {
        preset[i] = 5 + ((i - 1) % 7) * 5;
      }
    }
    setEditableStreak(preset);
    updateStreakRewards(preset);
  };

  // Handle Dispatch SMS for password reset
  const handleDispatchSmsReset = (reqId) => {
    const res = resolvePasswordReset(reqId);
    if (!res) return;
    const cleanPhone = (res.phone || '').replace(/\s+/g, '');
    const smsMessage = encodeURIComponent(
      `Hello ${res.name}, Your password has been reset to: ${res.tempPassword}. Login now at TaskCoin / EarnFlow.`
    );
    // Trigger native SMS link
    const smsUrl = `sms:${cleanPhone}?body=${smsMessage}`;
    window.location.href = smsUrl;
  };

  // Admin Master Password Form state
  const [adminPassForm, setAdminPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showAdminPassFields, setShowAdminPassFields] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passChangeStatus, setPassChangeStatus] = useState({ error: '', success: false });

  // 7-Day Schedule Selector state
  const upcoming7Days = getUpcoming7Days();
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(() => getLocalDateString(0));
  const [copyModal, setCopyModal] = useState({ isOpen: false, targetDate: upcoming7Days[1]?.dateStr || '' });

  // Banking Gateway Form state
  const [bankingForm, setBankingForm] = useState(() => ({
    upiId: paymentSettings?.upiId || 'taskcoin@icici',
    upiPayeeName: paymentSettings?.upiPayeeName || 'TaskCoin Pro Treasury',
    bankName: paymentSettings?.bankName || 'HDFC Bank',
    accountName: paymentSettings?.accountName || 'TaskCoin Technologies Private Limited',
    accountNumber: paymentSettings?.accountNumber || '50200098412849',
    ifscCode: paymentSettings?.ifscCode || 'HDFC0001234',
    branch: paymentSettings?.branch || 'BKC Corporate Financial Centre, Mumbai',
    instructions: paymentSettings?.instructions || '',
  }));

  // Announcement Broadcast Form state
  const [announcementForm, setAnnouncementForm] = useState(() => ({
    active: adminAnnouncement?.active ?? true,
    title: adminAnnouncement?.title || '',
    message: adminAnnouncement?.message || '',
    type: adminAnnouncement?.type || 'info',
    broadcastBy: adminAnnouncement?.broadcastBy || 'Admin Treasury Desk',
  }));

  const handleUpdateAdminPassword = (e) => {
    e.preventDefault();
    setPassChangeStatus({ error: '', success: false });

    if (!adminPassForm.currentPassword) {
      setPassChangeStatus({ error: 'Please enter your current admin password.', success: false });
      return;
    }

    const currentExpected = (adminPassword || 'admin123').trim();
    if (adminPassForm.currentPassword.trim() !== currentExpected) {
      setPassChangeStatus({ error: 'Current admin password does not match.', success: false });
      return;
    }

    if (!adminPassForm.newPassword || adminPassForm.newPassword.trim().length < 4) {
      setPassChangeStatus({ error: 'New password must be at least 4 characters long.', success: false });
      return;
    }

    if (adminPassForm.newPassword.trim() !== adminPassForm.confirmPassword.trim()) {
      setPassChangeStatus({ error: 'New password and confirmation do not match.', success: false });
      return;
    }

    const res = updateAdminPassword(adminPassForm.newPassword.trim(), adminPassForm.currentPassword.trim());
    if (res && res.success) {
      setPassChangeStatus({ error: '', success: true });
      setAdminPassForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      setPassChangeStatus({ error: res?.error || 'Failed to update admin password.', success: false });
    }
  };

  // Modals inside admin
  const [suspensionModal, setSuspensionModal] = useState({ isOpen: false, user: null, reason: '' });
  const [passwordResetModal, setPasswordResetModal] = useState({ isOpen: false, user: null, newPassword: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, type: '', id: '', reason: '' });
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    targetDate: getLocalDateString(0),
    type: 'video',
    title: '',
    category: '',
    platform: 'YouTube',
    videoUrl: '',
    actionUrl: '',
    duration: 20,
    reward: 35,
    shareRequired: true,
    sharePlatform: 'Facebook & Friends',
    description: '',
  });

  // Filtered users with safe fallback arrays
  const usersList = allUsers || [];
  const depList = depositRequests || [];
  const withList = withdrawalRequests || [];

  const filteredUsers = usersList.filter((u) => {
    if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchId = u.id?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchId) return false;
    }
    return true;
  });

  const pendingDeposits = depList.filter((d) => d.status === 'PENDING');
  const pendingWithdrawals = withList.filter((w) => w.status === 'PENDING');

  const handleOpenSuspension = (user) => {
    setSuspensionModal({
      isOpen: true,
      user,
      reason: 'Suspicious multiple login IP anomalies or AML compliance review',
    });
  };

  const handleConfirmSuspension = (e) => {
    e.preventDefault();
    if (!suspensionModal.user) return;
    suspendUser(suspensionModal.user.id, suspensionModal.reason);
    setSuspensionModal({ isOpen: false, user: null, reason: '' });
  };

  const handleOpenPasswordReset = (user) => {
    setPasswordResetModal({
      isOpen: true,
      user,
      newPassword: `EarnFlow@${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const handleConfirmPasswordReset = (e) => {
    e.preventDefault();
    if (!passwordResetModal.user) return;
    resetUserPassword(passwordResetModal.user.id, passwordResetModal.newPassword);
    setPasswordResetModal({ isOpen: false, user: null, newPassword: '' });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (rejectModal.type === 'deposit') {
      rejectDeposit(rejectModal.id, rejectModal.reason);
    } else if (rejectModal.type === 'withdrawal') {
      rejectWithdrawal(rejectModal.id, rejectModal.reason);
    }
    setRejectModal({ isOpen: false, type: '', id: '', reason: '' });
  };

  return (
    <div>
      {/* Admin Header Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(15, 23, 42, 0.95) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-emerald" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                Master Admin Portal
              </span>
              <span className="badge badge-indigo">Full Governance Access</span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Platform Administration Center</h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '650px', marginTop: '0.3rem' }}>
              Manage investor user accounts (activation, deactivation, suspension, deletion, password reset), approve incoming deposits, and disburse Sunday withdrawals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeAdminTab === 'security' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              onClick={() => setActiveAdminTab('security')}
            >
              <Key size={15} color="#fca5a5" /> Change Admin Password
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={toggleForceSunday}
            >
              Sunday Mode: {forceSunday ? '🟢 ACTIVE' : '⚪ Standard'}
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => showToast('User database and audit log exported!')}
            >
              <FileText size={15} /> Export Audit Ledger
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Users</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
            {allUsers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
            {allUsers.filter((u) => u.status === 'ACTIVE').length} Active • {allUsers.filter((u) => u.status === 'SUSPENDED').length} Suspended
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pending Deposits</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
            {pendingDeposits.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            Volume: {formatINR(pendingDeposits.reduce((acc, d) => acc + d.amount, 0))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pending Withdrawals</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', margin: '0.2rem 0' }}>
            {pendingWithdrawals.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            Volume: {formatINR(pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Platform Treasury AUM</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa', margin: '0.2rem 0' }}>
            {formatINR(totalLockedPrincipal + 50000)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
            10% Mo Generation active
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ec4899', background: 'rgba(236, 72, 153, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: '#f472b6', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Gamepad2 size={13} /> 10% House Rake (PvP)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f472b6', margin: '0.2rem 0' }}>
            {formatINR(gamingStats?.totalGamingRakeCollected || 845.00)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            {gamingStats?.totalMatchesPlayed || 169} matches • 100% Risk-Free Profit
          </div>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button
          className={`btn ${activeAdminTab === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('users')}
        >
          <Users size={16} /> User Management ({allUsers.length})
        </button>

        <button
          className={`btn ${activeAdminTab === 'deposits' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('deposits')}
        >
          <ArrowUpCircle size={16} /> Deposit Approvals
          {pendingDeposits.length > 0 && (
            <span className="badge badge-gold" style={{ marginLeft: '0.35rem', fontSize: '0.62rem' }}>
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          className={`btn ${activeAdminTab === 'withdrawals' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('withdrawals')}
        >
          <ArrowDownCircle size={16} /> Withdrawal Approvals
          {pendingWithdrawals.length > 0 && (
            <span className="badge badge-emerald" style={{ marginLeft: '0.35rem', fontSize: '0.62rem' }}>
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          className={`btn ${activeAdminTab === 'tasks' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('tasks')}
        >
          <Sliders size={16} /> Daily Task Roster ({(dailyTaskRoster || []).filter((t) => t.status === 'ACTIVE').length} Active)
        </button>

        <button
          className={`btn ${activeAdminTab === 'payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('payments')}
        >
          <Building2 size={16} /> Banking & UPI Setup
        </button>

        <button
          className={`btn ${activeAdminTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('broadcast')}
        >
          <Megaphone size={16} /> Broadcast Message
          {adminAnnouncement?.active && (
            <span className="badge badge-emerald" style={{ marginLeft: '0.35rem', fontSize: '0.62rem' }}>
              LIVE
            </span>
          )}
        </button>

        <button
          className={`btn ${activeAdminTab === 'security' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('security')}
        >
          <Key size={16} /> Admin Password & Security
        </button>

        <button
          className={`btn ${activeAdminTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('settings')}
        >
          <Sliders size={16} /> System & Treasury Rates
        </button>

        <button
          className={`btn ${activeAdminTab === 'streak' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('streak')}
        >
          <Flame size={16} color="#fbbf24" /> Daily Login Bonus Rates (Day 1–30)
        </button>

        <button
          className={`btn ${activeAdminTab === 'reset_requests' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('reset_requests')}
        >
          <Phone size={16} color="#38bdf8" /> Password Reset SMS
          {(passwordResetRequests || []).filter((r) => r.status === 'PENDING').length > 0 && (
            <span className="badge badge-gold" style={{ marginLeft: '0.35rem', fontSize: '0.62rem' }}>
              {(passwordResetRequests || []).filter((r) => r.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div>
          {/* Filter and Search */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1.25rem', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '1rem' 
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'ACTIVE', 'DEACTIVATED', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${userStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setUserStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.3rem', fontSize: '0.85rem', padding: '0.45rem 0.85rem 0.45rem 2.3rem' }}
                placeholder="Search user by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          {/* User Table */}
          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>User Profile</th>
                  <th style={{ padding: '0.75rem' }}>Contact Info</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Deposited / Balance</th>
                  <th style={{ padding: '0.75rem' }}>Registered Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isActive = u.status === 'ACTIVE';
                  const isSuspended = u.status === 'SUSPENDED';
                  const isDeactivated = u.status === 'DEACTIVATED';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{u.email}</div>
                        <div style={{ color: '#34d399', fontSize: '0.78rem' }}>{u.phone}</div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {isActive && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {isSuspended && (
                          <div>
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.65rem' }}>
                              <AlertTriangle size={12} /> Suspended
                            </span>
                            {u.suspensionReason && (
                              <div style={{ fontSize: '0.68rem', color: '#fca5a5', maxWidth: '160px', marginTop: '0.2rem' }}>
                                {u.suspensionReason}
                              </div>
                            )}
                          </div>
                        )}
                        {isDeactivated && (
                          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: '0.65rem' }}>
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#22d3ee' }}>{formatINR(u.totalDeposited || 0)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Wallet: {formatINR(u.walletBalance || 0)}</div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', color: '#cbd5e1', fontSize: '0.8rem' }}>
                        {formatDate(u.joinedDate)}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {/* Activation */}
                          {!isActive && (
                            <button
                              type="button"
                              className="btn btn-outline-emerald btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => activateUser(u.id)}
                              title="Activate user"
                            >
                              <Unlock size={12} /> Activate
                            </button>
                          )}

                          {/* Deactivation */}
                          {isActive && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => deactivateUser(u.id)}
                              title="Deactivate user"
                            >
                              <Lock size={12} /> Deactivate
                            </button>
                          )}

                          {/* Suspension */}
                          {!isSuspended && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => handleOpenSuspension(u)}
                              title="Suspend user account"
                            >
                              <AlertTriangle size={12} /> Suspend
                            </button>
                          )}

                          {/* Password Reset */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => handleOpenPasswordReset(u)}
                            title="Reset password for user"
                          >
                            <Key size={12} /> Reset PW
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete ${u.name} (${u.id})?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            title="Delete user"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPOSIT APPROVALS */}
      {activeAdminTab === 'deposits' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Incoming Deposit Verification Queue</h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Verify incoming investor deposits. Approving triggers instant compounding plan subscription.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            {depositRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 0.75rem' }} />
                <p>No deposit requests in the queue.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Request ID</th>
                    <th style={{ padding: '0.75rem' }}>Investor User</th>
                    <th style={{ padding: '0.75rem' }}>Deposit Amount</th>
                    <th style={{ padding: '0.75rem' }}>Plan & Lock-in</th>
                    <th style={{ padding: '0.75rem' }}>UTR / Reference</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {depositRequests.map((dep) => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: '#22d3ee', fontWeight: 600 }}>
                        {dep.id}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{dep.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{dep.userId}</div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                        {formatINR(dep.amount)}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{dep.planTitle}</div>
                        <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>
                          {dep.planDays || dep.planMonths * 30} Days Lock-in
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                        {dep.utr}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {dep.status === 'PENDING' && (
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                            Pending Verification
                          </span>
                        )}
                        {dep.status === 'APPROVED' && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            Approved & Active
                          </span>
                        )}
                        {dep.status === 'REJECTED' && (
                          <div>
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.65rem' }}>
                              Rejected
                            </span>
                            {dep.rejectionReason && (
                              <div style={{ fontSize: '0.68rem', color: '#fca5a5', marginTop: '0.2rem' }}>
                                {dep.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        {dep.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                              onClick={() => approveDeposit(dep.id)}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                              onClick={() => setRejectModal({ isOpen: true, type: 'deposit', id: dep.id, reason: 'Invalid payment UTR reference' })}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WITHDRAWAL APPROVALS */}
      {activeAdminTab === 'withdrawals' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sunday & Principal Withdrawal Queue</h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Review and disburse weekly Sunday payouts and matured principal withdrawals to user UPI / Bank.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            {withdrawalRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 0.75rem' }} />
                <p>No withdrawal requests pending in the queue.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Request ID</th>
                    <th style={{ padding: '0.75rem' }}>User</th>
                    <th style={{ padding: '0.75rem' }}>Payout Type</th>
                    <th style={{ padding: '0.75rem' }}>Amount (₹)</th>
                    <th style={{ padding: '0.75rem' }}>Destination Details</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Disbursal Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: '#22d3ee', fontWeight: 600 }}>
                        {req.id}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{req.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{req.userId}</div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span className={`badge ${req.type === 'PRINCIPAL_WITHDRAWAL' ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '0.62rem' }}>
                          {req.type === 'PRINCIPAL_WITHDRAWAL' ? 'Principal Refund' : 'Sunday Rewards'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#f43f5e', fontSize: '1rem' }}>
                        {formatINR(req.amount)}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{req.payoutDetails?.value}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Holder: {req.payoutDetails?.holder}</div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {req.status === 'PENDING' && (
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                            Pending Disbursal
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <div>
                            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                              Disbursed
                            </span>
                            {req.disbursedUtr && (
                              <div style={{ fontSize: '0.68rem', color: '#34d399', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                                {req.disbursedUtr}
                              </div>
                            )}
                          </div>
                        )}
                        {req.status === 'REJECTED' && (
                          <div>
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.65rem' }}>
                              Rejected & Refunded
                            </span>
                            {req.rejectionReason && (
                              <div style={{ fontSize: '0.68rem', color: '#fca5a5', marginTop: '0.2rem' }}>
                                {req.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        {req.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                              onClick={() => approveWithdrawal(req.id)}
                            >
                              <Send size={12} /> Disburse
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                              onClick={() => setRejectModal({ isOpen: true, type: 'withdrawal', id: req.id, reason: 'Invalid UPI / Bank details' })}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM SETTINGS */}
      {activeAdminTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Platform Treasury & Task Quota Parameters
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Platform advertising media budget allocation and treasury reserve parameters.
            </p>

            <div className="form-group">
              <label className="form-label">
                <span>Gross Media Budget Ingestion</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Active</span>
              </label>
              <input type="text" className="input-field" value="Creator Promotion & Brand Ad Budgets" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>User Task Quota Allocation</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>Estimated Quota Cap</span>
              </label>
              <input type="text" className="input-field" value="Allocated based on active membership tier (1M - 1Y)" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Solvency & Principal Reserve</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>Reserve Ratio</span>
              </label>
              <input type="text" className="input-field" value="Retained in liquid treasury for principal refund upon maturity" disabled />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Weekly Settlement Controls
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Override or test Sunday withdrawal gateways.
            </p>

            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                Sunday Settlement Gate: {forceSunday ? '🟢 FORCE UNLOCKED (Test Mode)' : '⚪ AUTOMATIC SCHEDULE'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                When active, all registered users can submit task reward withdrawals immediately.
              </p>
              <button 
                type="button" 
                className={`btn ${forceSunday ? 'btn-danger' : 'btn-primary'} btn-sm`}
                onClick={toggleForceSunday}
              >
                {forceSunday ? 'Turn Off Demo Sunday Mode' : '⚡ Activate Demo Sunday Mode'}
              </button>
            </div>
          </div>

          {/* Card 3: MLM 2:1 Binary Marketing Controls */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              MLM 2:1 Binary Network Rules
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Market-standard binary pair matching and solvency guard parameters.
            </p>

            <div className="form-group">
              <label className="form-label">
                <span>Binary Matching Ratio</span>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>2:1 or 1:2 Matching</span>
              </label>
              <input type="text" className="input-field" value="2 Units (₹2,000) : 1 Unit (₹1,000) or vice-versa" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Matching Bonus Rate</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>₹150.00 per Pair (5.0%)</span>
              </label>
              <input type="text" className="input-field" value="5.0% on paired volume (Credited to referrer wallet)" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>User Daily Capping Limit</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>₹3,000 / day per user</span>
              </label>
              <input type="text" className="input-field" value="Max 20 pairs/day (Flushes runaway liability to preserve reserve)" disabled />
            </div>
          </div>

          {/* Card 4: Game Probability & Weighted Odds */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Game RNG & Weighted Odds Parameters
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Mathematical house edge calibration to prevent platform deficits.
            </p>

            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.2rem' }}>Lucky Spin Wheel RNG:</div>
              <div style={{ color: '#cbd5e1' }}>• ₹15–₹25: 74% combined high probability</div>
              <div style={{ color: '#cbd5e1' }}>• ₹35–₹50: 23% moderate probability</div>
              <div style={{ color: '#f59e0b' }}>• ₹100–₹200: 1.0% rare jackpot probability</div>
              <div style={{ color: '#22d3ee', marginTop: '0.2rem', fontWeight: 600 }}>Expected Value: ~₹25.55 / spin (Target: ₹25.00)</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: '#ec4899', marginBottom: '0.2rem' }}>Scratch & Win Card RNG:</div>
              <div style={{ color: '#cbd5e1' }}>• ₹15–₹25: 80% combined high probability</div>
              <div style={{ color: '#cbd5e1' }}>• ₹35–₹50: 18% moderate probability</div>
              <div style={{ color: '#f59e0b' }}>• ₹75–₹150: 2.0% rare mega reward</div>
              <div style={{ color: '#22d3ee', marginTop: '0.2rem', fontWeight: 600 }}>Expected Value: ~₹23.50 / card (Target: ₹24.00)</div>
            </div>
          </div>

          {/* Card 5: Admin Security & Master Passcode */}
          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <KeyRound size={20} color="#f87171" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Admin Master Access Key</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Administrative master authentication key for control center governance.
            </p>

            <div style={{ padding: '0.9rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f87171', marginBottom: '0.25rem' }}>
                Admin Master Key: 🟢 Protected & Active
              </div>
              <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                You can change the administrator password at any time to safeguard administrative access.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setActiveAdminTab('security')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
            >
              <Key size={14} /> Open Admin Security & Password
            </button>
          </div>
        </div>
      )}

      {/* TAB: ADMIN SECURITY & PASSWORD MANAGEMENT */}
      {activeAdminTab === 'security' && (
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                <KeyRound size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>Admin Security & Password</h3>
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Active Protection</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Change the master administrative security key used to authenticate into this portal.
                </p>
              </div>
            </div>

            {/* Success Banner */}
            {passChangeStatus.success && (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
                <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Admin Password Updated Successfully!</div>
                  <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
                    Your new master security key is now active and saved. All subsequent administrative logins require this new password.
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {passChangeStatus.error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171' }}>
                <AlertTriangle size={22} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Security Verification Error</div>
                  <div style={{ fontSize: '0.78rem', color: '#fca5a5' }}>{passChangeStatus.error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateAdminPassword}>
              {/* Current Password Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Current Admin Password *</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Required for verification</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showAdminPassFields.current ? 'text' : 'password'}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                    placeholder="Enter current admin password"
                    value={adminPassForm.currentPassword}
                    onChange={(e) => {
                      setAdminPassForm({ ...adminPassForm, currentPassword: e.target.value });
                      setPassChangeStatus({ error: '', success: false });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassFields({ ...showAdminPassFields, current: !showAdminPassFields.current })}
                    style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showAdminPassFields.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  <span style={{ fontWeight: 700, color: '#cbd5e1' }}>New Admin Password *</span>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>At least 4 characters</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showAdminPassFields.new ? 'text' : 'password'}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                    placeholder="Enter new admin password"
                    value={adminPassForm.newPassword}
                    onChange={(e) => {
                      setAdminPassForm({ ...adminPassForm, newPassword: e.target.value });
                      setPassChangeStatus({ error: '', success: false });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassFields({ ...showAdminPassFields, new: !showAdminPassFields.new })}
                    style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showAdminPassFields.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Confirm New Admin Password *</span>
                  {adminPassForm.newPassword && adminPassForm.confirmPassword && (
                    <span style={{ fontSize: '0.75rem', color: adminPassForm.newPassword === adminPassForm.confirmPassword ? '#34d399' : '#f87171' }}>
                      {adminPassForm.newPassword === adminPassForm.confirmPassword ? '✓ Passwords match' : '✗ Does not match'}
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showAdminPassFields.confirm ? 'text' : 'password'}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
                    placeholder="Re-enter new admin password"
                    value={adminPassForm.confirmPassword}
                    onChange={(e) => {
                      setAdminPassForm({ ...adminPassForm, confirmPassword: e.target.value });
                      setPassChangeStatus({ error: '', success: false });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassFields({ ...showAdminPassFields, confirm: !showAdminPassFields.confirm })}
                    style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showAdminPassFields.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Security Advisory Box */}
              <div style={{ padding: '0.9rem 1.1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginBottom: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                  <ShieldAlert size={15} color="#f59e0b" />
                  <span>Important Security Notice</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  Make sure to store your new administrator key in a secure location. Anyone with this key can approve deposits, manage user accounts, and execute financial disbursements.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  style={{ flex: 1, minWidth: 200, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                >
                  <Save size={18} /> Save & Update Admin Password
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    switchRole('investor');
                    showToast('Admin logged out. You can now test logging in with your new password.');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                  title="Lock admin session and return to app"
                >
                  <Lock size={16} /> Lock Admin Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: DYNAMIC 7-DAY DATE-WISE TASK ROSTER & CAMPAIGN ORCHESTRATOR */}
      {activeAdminTab === 'tasks' && (() => {
        const currentDayTasks = scheduledTasksByDate?.[selectedScheduleDate] || [];
        const activeTasksForDay = currentDayTasks.filter((t) => t.status === 'ACTIVE');
        const selectedDayMeta = upcoming7Days.find((d) => d.dateStr === selectedScheduleDate) || upcoming7Days[0];
        const isSelectedDateToday = selectedScheduleDate === getLocalDateString(0);

        return (
          <div>
            {/* Action Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-emerald">7-Day Task Scheduler</span>
                  <span className="badge badge-gold">Auto-Switch at 00:00 Midnight</span>
                  <span className="badge badge-cyan">Admin Custom Task Engine</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Date-Wise Daily Task Roster (Up to 7 Coming Days)</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '780px' }}>
                  Prepare tasks date-wise for up to 7 upcoming days. Every day at <strong>00:00 hrs midnight</strong>, the active task center automatically switches to that date's schedule! Admin can add <strong>ANY task</strong> (Videos, Music, 3×3 Slide Puzzles, Memory Match, 10-Min Walks, Spin, or Custom Website/Social/Telegram Actions).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCopyModal({ isOpen: true, targetDate: upcoming7Days.find(d => d.dateStr !== selectedScheduleDate)?.dateStr || upcoming7Days[1]?.dateStr })}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  title="Copy all tasks from this day to another upcoming day"
                >
                  <Copy size={15} />
                  <span>Copy Tasks to Another Date</span>
                </button>

                <button
                  className="btn btn-primary"
                  style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => setTaskModal({
                    isOpen: true,
                    targetDate: selectedScheduleDate,
                    type: 'custom',
                    title: '',
                    category: 'Special Task',
                    platform: 'TaskCoin App',
                    videoUrl: '',
                    actionUrl: '',
                    duration: 20,
                    reward: 35,
                    shareRequired: false,
                    sharePlatform: 'Facebook & Friends',
                    description: '',
                  })}
                >
                  <Plus size={16} />
                  <span>Add Task for {selectedDayMeta.tag}</span>
                </button>
              </div>
            </div>

            {/* 7-DAY DATE TAB SELECTOR */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={13} color="#34d399" /> Select Date to Schedule Tasks (Next 7 Days):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {upcoming7Days.map((day) => {
                  const isSelected = selectedScheduleDate === day.dateStr;
                  const dayTasks = scheduledTasksByDate?.[day.dateStr] || [];
                  const activeCount = dayTasks.filter((t) => t.status === 'ACTIVE').length;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedScheduleDate(day.dateStr)}
                      style={{
                        padding: '0.75rem 0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.15) 100%)'
                          : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: day.isToday ? '#34d399' : day.isTomorrow ? '#38bdf8' : '#fbbf24' }}>
                          {day.tag}
                        </span>
                        {day.isToday && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? '#ffffff' : '#f1f5f9' }}>
                        {day.shortLabel}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {day.dayName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: isSelected ? '#34d399' : '#94a3b8', marginTop: '0.35rem', fontWeight: 600 }}>
                        {activeCount} Active Task{activeCount !== 1 ? 's' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Notice & Status Banner */}
            <div 
              className="glass-card" 
              style={{ 
                padding: '1rem 1.25rem', 
                marginBottom: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: isSelectedDateToday 
                  ? 'rgba(16, 185, 129, 0.08)' 
                  : 'rgba(99, 102, 241, 0.08)',
                border: isSelectedDateToday 
                  ? '1px solid rgba(16, 185, 129, 0.35)' 
                  : '1px solid rgba(99, 102, 241, 0.35)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1rem' }}>
                    📅 {selectedDayMeta.fullLabel}
                  </span>
                  <span className={`badge ${isSelectedDateToday ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.65rem' }}>
                    {isSelectedDateToday ? 'Live on Users Screen Right Now' : 'Scheduled Ahead'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {isSelectedDateToday 
                    ? 'Users are actively completing these tasks today. At 00:00 midnight, tomorrow\'s tasks will take over.'
                    : `Tasks configured below will automatically unlock and go live when local midnight (00:00 hrs) hits on ${selectedDayMeta.shortLabel}.`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCopyModal({ isOpen: true, targetDate: upcoming7Days.find(d => d.dateStr !== selectedScheduleDate)?.dateStr || upcoming7Days[1]?.dateStr })}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  <Copy size={13} /> Copy to Another Date
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setTaskModal({
                    isOpen: true,
                    targetDate: selectedScheduleDate,
                    type: 'custom',
                    title: '',
                    category: 'Special Task',
                    platform: 'TaskCoin App',
                    videoUrl: '',
                    actionUrl: '',
                    duration: 20,
                    reward: 35,
                    shareRequired: false,
                    sharePlatform: 'Facebook & Friends',
                    description: '',
                  })}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
                >
                  <Plus size={13} /> Add New Task
                </button>
              </div>
            </div>

            {/* Quick Presets for Selected Date */}
            <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.25)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={14} color="#fbbf24" /> Apply 1-Click Roster Preset to {selectedDayMeta.tag} ({selectedDayMeta.shortLabel})
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Quickly set today's or tomorrow's mix without coding
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                {(taskRosterPresets || []).map((preset) => (
                  <div 
                    key={preset.id}
                    className="card-interactive"
                    onClick={() => applyPresetToDate(selectedScheduleDate, preset.id)}
                    style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>{preset.badge}</span>
                        <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>Apply to {selectedDayMeta.tag} →</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc', marginBottom: '0.15rem' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>
                        {preset.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Bar for Selected Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Tasks on {selectedDayMeta.shortLabel}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
                  {activeTasksForDay.length} Active
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {currentDayTasks.length} total scheduled for this date
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Max Potential Payout</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', margin: '0.2rem 0' }}>
                  {formatINR(activeTasksForDay.reduce((sum, t) => sum + (Number(t.reward) || 0), 0))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  If 100% of all tasks are completed by user
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Skill-Barrier & Timed Tasks</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', margin: '0.2rem 0' }}>
                  {activeTasksForDay.filter((t) => t.type === 'slide3' || t.type === 'memory' || t.type === 'walk').length} Timed Tasks
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Reduces liability while maximizing cognitive retention
                </div>
              </div>
            </div>

            {/* Tasks Table for Selected Date */}
            <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                  Tasks Roster for {selectedDayMeta.fullLabel}
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  {currentDayTasks.length} Task{currentDayTasks.length !== 1 ? 's' : ''} Configured
                </span>
              </div>

              {currentDayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  <Calendar size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p>No tasks scheduled for <strong>{selectedDayMeta.fullLabel}</strong> yet.</p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setTaskModal({
                        isOpen: true,
                        targetDate: selectedScheduleDate,
                        type: 'custom',
                        title: '',
                        category: 'Special Task',
                        platform: 'TaskCoin App',
                        videoUrl: '',
                        actionUrl: '',
                        duration: 20,
                        reward: 35,
                        shareRequired: false,
                        sharePlatform: 'Facebook & Friends',
                        description: '',
                      })}
                    >
                      <Plus size={14} /> Add First Task
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => copyTasksToDate(getLocalDateString(0), selectedScheduleDate)}
                    >
                      <Copy size={14} /> Copy Today's Tasks to This Date
                    </button>
                  </div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Type</th>
                      <th style={{ padding: '0.75rem' }}>Task Name & Description</th>
                      <th style={{ padding: '0.75rem' }}>Category</th>
                      <th style={{ padding: '0.75rem' }}>Duration / Timer Rule</th>
                      <th style={{ padding: '0.75rem' }}>Reward</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDayTasks.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'video' ? 'rgba(239, 68, 68, 0.2)' : t.type === 'walk' ? 'rgba(16, 185, 129, 0.2)' : t.type === 'slide3' ? 'rgba(99, 102, 241, 0.2)' : t.type === 'memory' ? 'rgba(59, 130, 246, 0.2)' : t.type === 'music' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: t.type === 'video' ? '#f87171' : t.type === 'walk' ? '#34d399' : t.type === 'slide3' ? '#818cf8' : t.type === 'memory' ? '#60a5fa' : t.type === 'music' ? '#c084fc' : '#fbbf24' }}>
                            {t.type === 'video' ? <Video size={17} /> : t.type === 'walk' ? <Footprints size={17} /> : t.type === 'slide3' ? <Grid size={17} /> : t.type === 'memory' ? <Brain size={17} /> : t.type === 'music' ? <Music size={17} /> : <Sparkles size={17} />}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.15rem' }}>{t.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {t.description || 'Verified engagement task.'}
                          </div>
                          {t.videoUrl && (
                            <a 
                              href={t.videoUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ fontSize: '0.72rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', marginTop: '0.2rem' }}
                            >
                              <ExternalLink size={10} /> {t.videoUrl}
                            </a>
                          )}
                          {t.actionUrl && (
                            <a 
                              href={t.actionUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ fontSize: '0.72rem', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', marginTop: '0.2rem' }}
                            >
                              <Globe size={10} /> {t.actionUrl}
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                            {t.category || t.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 600 }}>
                            <Clock size={12} /> {t.duration >= 60 ? `${Math.round(t.duration / 60)} min` : `${t.duration}s`}
                          </span>
                          {t.type === 'slide3' && <span style={{ fontSize: '0.68rem', color: '#f87171', display: 'block' }}>Strict 60s countdown</span>}
                          {t.type === 'memory' && <span style={{ fontSize: '0.68rem', color: '#f87171', display: 'block' }}>Strict 60s countdown</span>}
                          {t.type === 'walk' && <span style={{ fontSize: '0.68rem', color: '#34d399', display: 'block' }}>1,200 Steps Pedometer</span>}
                          {t.shareRequired && <span style={{ fontSize: '0.68rem', color: '#60a5fa', display: 'block' }}>+ Mandatory Share</span>}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: '#34d399' }}>
                          +{formatINR(t.reward)}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${t.status === 'ACTIVE' ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                            {t.status === 'ACTIVE' ? '🟢 ACTIVE' : '⚪ PAUSED'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              className={`btn ${t.status === 'ACTIVE' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                              onClick={() => toggleTaskStatusForDate(selectedScheduleDate, t.id)}
                              title="Toggle whether users can see and complete this task"
                            >
                              {t.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => {
                                if (window.confirm(`Delete task "${t.title}" from ${selectedDayMeta.tag}?`)) {
                                  deleteTaskForDate(selectedScheduleDate, t.id);
                                }
                              }}
                              title="Delete task permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}

      {/* TAB 6: BANKING, UPI & QR DEPOSIT GATEWAY SETUP */}
      {activeAdminTab === 'payments' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-emerald">Payment Gateway</span>
                <span className="badge badge-cyan">User Deposit Instructions</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Deposit Gateway & Banking Details</h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '720px' }}>
                Set your UPI ID, QR Code and Bank Account information. When users deposit, this is the exact account they will transfer to before submitting their 12-digit UTR.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePaymentSettings({
                ...bankingForm,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(bankingForm.upiId)}%26pn=${encodeURIComponent(bankingForm.upiPayeeName)}%26cu=INR`
              });
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Card 1: UPI & QR Code Settings */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <QrCode size={18} color="#34d399" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>UPI & QR Code Details</h4>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <span>Admin Official UPI ID *</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={bankingForm.upiId}
                    onChange={(e) => setBankingForm({ ...bankingForm, upiId: e.target.value })}
                    placeholder="e.g. earnflowpro@icici or yourname@okhdfcbank"
                    required
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Users copy this UPI ID directly to transfer via Google Pay, PhonePe, Paytm, or BHIM.
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <span>UPI Payee / Business Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={bankingForm.upiPayeeName}
                    onChange={(e) => setBankingForm({ ...bankingForm, upiPayeeName: e.target.value })}
                    placeholder="e.g. EarnFlow Enterprise Treasury"
                    required
                  />
                </div>

                {/* Live QR Preview Box */}
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    Auto-Generated Scannable QR Code Preview
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px', borderRadius: '10px', display: 'inline-block' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${encodeURIComponent(bankingForm.upiId)}%26pn=${encodeURIComponent(bankingForm.upiPayeeName)}%26cu=INR`}
                      alt="UPI QR Code"
                      style={{ width: 130, height: 130, display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.4rem', fontWeight: 600 }}>
                    upi://pay?pa={bankingForm.upiId}
                  </div>
                </div>
              </div>

              {/* Card 2: Direct Bank Account Settings */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #06b6d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Building2 size={18} color="#22d3ee" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Direct Bank Account (IMPS/NEFT)</h4>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={bankingForm.bankName}
                    onChange={(e) => setBankingForm({ ...bankingForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Account Holder / Entity Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={bankingForm.accountName}
                    onChange={(e) => setBankingForm({ ...bankingForm, accountName: e.target.value })}
                    placeholder="e.g. EarnFlow Yield Private Limited"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={bankingForm.accountNumber}
                    onChange={(e) => setBankingForm({ ...bankingForm, accountNumber: e.target.value })}
                    placeholder="e.g. 50200098412849"
                    required
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">IFSC Code</label>
                    <input
                      type="text"
                      className="input-field"
                      value={bankingForm.ifscCode}
                      onChange={(e) => setBankingForm({ ...bankingForm, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      required
                      style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Branch City / Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={bankingForm.branch}
                      onChange={(e) => setBankingForm({ ...bankingForm, branch: e.target.value })}
                      placeholder="e.g. Mumbai Main Branch"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Custom Deposit Instructions for Users */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FileText size={18} color="#fbbf24" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                  Deposit Step-by-Step Instructions (Shown to Users)
                </h4>
              </div>
              <textarea
                className="input-field"
                rows={4}
                value={bankingForm.instructions}
                onChange={(e) => setBankingForm({ ...bankingForm, instructions: e.target.value })}
                placeholder="Enter step-by-step payment instructions for users..."
                style={{ fontSize: '0.85rem', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                These instructions appear on the user's deposit modal below the QR code and bank details.
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ fontWeight: 800 }}>
              <Save size={18} /> Save Banking & Payment Gateway Details
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: ADMIN BROADCAST MESSAGE & NOTICE */}
      {activeAdminTab === 'broadcast' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-gold">Live Announcements</span>
                <span className="badge badge-emerald">User Dashboard Banner</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Admin Broadcast & Notice Center</h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '720px' }}>
                Broadcast messages, maintenance notices, withdrawal timings, or festival bonuses to all registered users. This banner appears prominently on the user dashboard.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Form */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!announcementForm.title.trim()) {
                    showToast('Please provide an announcement title', 'error');
                    return;
                  }
                  updateAdminAnnouncement(announcementForm);
                }}
              >
                {/* Active Toggle */}
                <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Broadcast Visibility</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Toggle whether users currently see this banner on their dashboard</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={announcementForm.active}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, active: e.target.checked })}
                      style={{ width: 20, height: 20, accentColor: '#10b981' }}
                    />
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <span>Notice Type / Severity</span>
                  </label>
                  <select
                    className="input-field"
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                  >
                    <option value="info">Info (Cyan) — General Updates & Features</option>
                    <option value="warning">Notice / Alert (Amber) — Deadlines & Instructions</option>
                    <option value="success">Success / Event (Emerald) — Bonuses & Milestones</option>
                    <option value="critical">Critical (Red) — Urgent Warnings & Maintenance</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <span>Announcement Headline *</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="e.g. 📢 Special Notice: Sunday Weekly Payouts are Live!"
                    required
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">
                    <span>Message Body *</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    placeholder="Type the detailed broadcast message here..."
                    required
                    style={{ lineHeight: 1.5, fontSize: '0.85rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">
                    <span>Broadcasted By</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={announcementForm.broadcastBy}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, broadcastBy: e.target.value })}
                    placeholder="e.g. Admin Treasury Desk"
                  />
                </div>

                <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%', fontWeight: 800 }}>
                  <Megaphone size={18} /> Publish Broadcast Announcement
                </button>
              </form>
            </div>

            {/* Live Preview Card */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                👁️ Live User Dashboard Preview
              </div>

              {announcementForm.active ? (
                <div
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    border: `1.5px solid ${announcementForm.type === 'warning' ? '#f59e0b' : announcementForm.type === 'success' ? '#10b981' : announcementForm.type === 'critical' ? '#f43f5e' : '#06b6d4'}`,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                      <Megaphone size={11} /> Admin Broadcast
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Just Now • Posted by {announcementForm.broadcastBy || 'Admin'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {announcementForm.title || 'Headline goes here'}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {announcementForm.message || 'Message content will be shown here to all users.'}
                  </p>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <div>Broadcast is currently <strong>PAUSED</strong>.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Enable the checkbox on the left to activate this notice for users.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: DAILY LOGIN STREAK REWARDS EDITOR */}
      {activeAdminTab === 'streak' && (
        <div>
          {/* Header & Quick Action Presets */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1.5rem', 
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span className="badge badge-gold">
                    <Flame size={12} /> Daily Login Bonus Rates
                  </span>
                  <span className="badge badge-cyan">Basic Plan (₹2,000) Base Rates</span>
                  <span className="badge badge-emerald">30-Day Calendar</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  ডেইলি লগইন বোনাস কন্ট্রোলার (Basic Plan ₹2,000 এর জন্য)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  প্রতিদিন ইউজার অ্যাপে ঢুকলে কত টাকা লগইন বোনাস পাবে তা আপনি এখানে Basic ₹2,000 ইউজারের জন্য নির্ধারণ করতে পারেন। ডিপোজিট অনুযায়ী এই রেট অটোমেটিক গুণিতক (Multiplier) হবে (যেমন ₹5,000 এর জন্য 2.5×, ₹10,000 এর জন্য 5.0×)।
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleApplyStreakPreset('conservative')}
                >
                  🌱 Standard (₹1–₹7)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleApplyStreakPreset('generous')}
                >
                  🚀 Boosted (₹3–₹15)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleApplyStreakPreset('highroller')}
                >
                  💎 Super (₹5–₹35)
                </button>
              </div>
            </div>

            {/* Deposit Multiplier Option & Live Tier Preview Bar */}
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.92rem', color: '#fbbf24' }}>
                    <Coins size={17} /> ডিপোজিট ভিত্তিক মাল্টিপ্লায়ার প্রিভিউ (Deposit-Based Multiplier Preview)
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#cbd5e1', margin: '0.2rem 0 0 0' }}>
                    ইউজারের অ্যাক্টিভ প্ল্যান ডিপোজিট অনুপাত অনুযায়ী ডেইলি বোনাস বাড়ে: <strong>₹5,000 = 2.5×</strong> | <strong>₹10,000 = 5.0×</strong> | <strong>₹25,000 = 12.5×</strong>
                  </p>
                </div>

                {/* Live Tier Selector Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { amount: 2000, label: '₹2,000 Basic (1.0× Edit)', color: '#06b6d4' },
                    { amount: 5000, label: '₹5,000 Plan (2.5×)', color: '#38bdf8' },
                    { amount: 10000, label: '₹10,000 Plan (5.0×)', color: '#f59e0b' },
                    { amount: 25000, label: '₹25,000 Plan (12.5×)', color: '#8b5cf6' },
                    { amount: 50000, label: '₹50,000 Plan (25.0×)', color: '#10b981' }
                  ].map((tier) => {
                    const isSelected = streakPreviewTier === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setStreakPreviewTier(tier.amount)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.35rem 0.75rem',
                          background: isSelected ? tier.color : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#0f172a' : '#cbd5e1',
                          border: `1px solid ${isSelected ? tier.color : 'rgba(255, 255, 255, 0.1)'}`
                        }}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Tier Info Notice */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '0.78rem' }}>
                <span style={{ color: '#94a3b8' }}>
                  বর্তমানে প্রিভিউ করছেন: <strong style={{ color: '#ffffff' }}>₹{streakPreviewTier.toLocaleString()} Plan</strong> • Multiplier: <strong style={{ color: '#34d399' }}>{(streakPreviewTier / 2000).toFixed(1)}×</strong>
                  {streakPreviewTier === 2000 ? ' (বেস রেট সরাসরি এডিট করুন)' : ' (অটোমেটিক ক্যালকুলেটেড পেআউট)'}
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                  {streakPreviewTier === 2000 ? '✏️ ইনপুট বক্সে মান লিখে Save করুন' : `💡 Day 1 পেআউট: ₹${((Number(editableStreak[1]) || 1) * (streakPreviewTier / 2000)).toFixed(1)}`}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveStreakRewards}>
              {/* 4 Weeks Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                  { title: 'Week 1 (Days 1–7)', start: 1, end: 7, color: '#38bdf8' },
                  { title: 'Week 2 (Days 8–14)', start: 8, end: 14, color: '#34d399' },
                  { title: 'Week 3 (Days 15–21)', start: 15, end: 21, color: '#fbbf24' },
                  { title: 'Week 4 (Days 22–30)', start: 22, end: 30, color: '#c084fc' }
                ].map((wk, wIdx) => {
                  const mult = streakPreviewTier / 2000;
                  return (
                    <div key={wIdx} className="glass-card" style={{ padding: '1rem', borderLeft: `3px solid ${wk.color}` }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: wk.color, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{wk.title}</span>
                        {mult !== 1 && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                            {mult}× Boosted
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: '0.5rem' }}>
                        {Array.from({ length: wk.end - wk.start + 1 }, (_, i) => wk.start + i).map((day) => {
                          const baseVal = Number(editableStreak[day]) || 0;
                          const multipliedVal = +(baseVal * mult).toFixed(1);

                          return (
                            <div key={day} style={{ textAlign: 'center' }}>
                              <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                                Day {day}
                              </label>
                              {streakPreviewTier === 2000 ? (
                                <div style={{ position: 'relative' }}>
                                  <span style={{ position: 'absolute', left: '0.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#64748b' }}>
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={editableStreak[day] ?? ''}
                                    onChange={(e) => setEditableStreak({ ...editableStreak, [day]: Number(e.target.value) })}
                                    className="input-field"
                                    style={{ paddingLeft: '1.1rem', paddingRight: '0.25rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: 800, height: '34px' }}
                                  />
                                </div>
                              ) : (
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '6px', padding: '0.3rem 0.15rem' }}>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399' }}>
                                    ₹{multipliedVal}
                                  </div>
                                  <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '1px' }}>
                                    (₹{baseVal} × {mult})
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Streak Continuity Rule Alert */}
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RotateCcw size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <strong style={{ color: '#60a5fa' }}>স্ট্রিক নিয়ম (Streak Continuity Rule):</strong> ইউজার কোনো দিন লগইন বা ক্লেইম মিস করলে স্ট্রিক তৎক্ষণাৎ ভেঙে যাবে এবং পরবর্তী লগইনে সরাসরি <strong>Day 1</strong> থেকে আবার শুরু হবে। ৩০ দিন সম্পূর্ণ হলে সাইকেল নতুন করে শুরু হয়।
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                {streakPreviewTier !== 2000 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-md"
                    onClick={() => setStreakPreviewTier(2000)}
                  >
                    ✏️ Switch to Basic ₹2,000 (Edit Mode)
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}
                >
                  <Save size={18} /> Save Daily Login Rewards (বেস রেট সংরক্ষণ করুন)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 9: PASSWORD RESET REQUESTS (VIA ADMIN SMS) */}
      {activeAdminTab === 'reset_requests' && (
        <div>
          <div 
            className="glass-card" 
            style={{ 
              padding: '1.5rem', 
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span className="badge badge-indigo">
                    <Phone size={12} /> SMS Direct Dispatch
                  </span>
                  <span className="badge badge-emerald">Zero Cost Gateway</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  Password Reset Requests (মোবাইল এসএমএস রিসেট)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                  ইউজাররা পাসওয়ার্ড ভুলে গেলে এখান থেকে রিকোয়েস্ট জমা হয়। আপনি <strong>"Reset & Send SMS"</strong> বাটনে ক্লিক করলে আপনার ফোন থেকে সরাসরি ইউজারের নম্বরে পাসওয়ার্ড সহ SMS চলে যাবে।
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                  Pending: {(passwordResetRequests || []).filter(r => r.status === 'PENDING').length}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                  Resolved: {(passwordResetRequests || []).filter(r => r.status === 'RESOLVED').length}
                </span>
              </div>
            </div>

            {/* Requests Table */}
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>Req ID</th>
                    <th style={{ padding: '0.75rem' }}>User Info</th>
                    <th style={{ padding: '0.75rem' }}>Phone Number</th>
                    <th style={{ padding: '0.75rem' }}>Requested At</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Temp Password</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(passwordResetRequests || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                        <div>No password reset requests pending. All clear!</div>
                      </td>
                    </tr>
                  ) : (
                    (passwordResetRequests || []).map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                          {req.id}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                          {req.userName || 'User'}
                        </td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                          {req.userPhone}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                          {new Date(req.requestedAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {req.status === 'PENDING' ? (
                            <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>PENDING</span>
                          ) : (
                            <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>RESOLVED</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: req.tempPassword ? '#34d399' : '#64748b' }}>
                          {req.tempPassword || '—'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleDispatchSmsReset(req.id)}
                              style={{
                                background: req.status === 'PENDING' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#334155',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem'
                              }}
                            >
                              <PhoneCall size={13} /> {req.status === 'PENDING' ? 'Reset & Send SMS' : 'Resend SMS'}
                            </button>
                            <a
                              href={`tel:${(req.userPhone || '').replace(/\s+/g, '')}`}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.5rem' }}
                              title="Call User"
                            >
                              <Phone size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      {suspensionModal.isOpen && (
        <div className="modal-overlay" onClick={() => setSuspensionModal({ isOpen: false, user: null, reason: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f87171' }}>
              Suspend User Account
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Suspending <strong>{suspensionModal.user?.name}</strong> will freeze task rewards, lock plan withdrawals, and display a suspension notice to the user.
            </p>

            <form onSubmit={handleConfirmSuspension}>
              <div className="form-group">
                <label className="form-label">
                  <span>Suspension Reason</span>
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={suspensionModal.reason}
                  onChange={(e) => setSuspensionModal({ ...suspensionModal, reason: e.target.value })}
                  placeholder="Enter reason for account suspension..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>
                  Confirm Suspension
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setSuspensionModal({ isOpen: false, user: null, reason: '' })}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordResetModal.isOpen && (
        <div className="modal-overlay" onClick={() => setPasswordResetModal({ isOpen: false, user: null, newPassword: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Reset User Password
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Set a new secure access password for <strong>{passwordResetModal.user?.name}</strong> ({passwordResetModal.user?.email}).
            </p>

            <form onSubmit={handleConfirmPasswordReset}>
              <div className="form-group">
                <label className="form-label">
                  <span>New Password</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={passwordResetModal.newPassword}
                  onChange={(e) => setPasswordResetModal({ ...passwordResetModal, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save New Password
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordResetModal({ isOpen: false, user: null, newPassword: '' })}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="modal-overlay" onClick={() => setRejectModal({ isOpen: false, type: '', id: '', reason: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f87171' }}>
              Reject Request ({rejectModal.id})
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Please provide the official rejection remark sent to the user.
            </p>

            <form onSubmit={handleConfirmReject}>
              <div className="form-group">
                <label className="form-label">
                  <span>Rejection Remark</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="e.g. UTR mismatch / Invalid bank account"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>
                  Confirm Rejection
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModal({ isOpen: false, type: '', id: '', reason: '' })}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Task to Date-Wise Schedule */}
      {taskModal.isOpen && (
        <div className="modal-overlay" onClick={() => setTaskModal({ ...taskModal, isOpen: false })}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Publish Task to Schedule
              </h3>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                7-Day Scheduler
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Create any task (custom link, Telegram, video, 3×3 slide puzzle, memory match, 10-min walk, or spin). It will be saved for the selected date and auto-activated at 00:00 midnight!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskModal.title.trim()) {
                  showToast('Please enter task title', 'error');
                  return;
                }
                if (taskModal.type === 'video' && !taskModal.videoUrl.trim()) {
                  showToast('Please enter video URL for video task', 'error');
                  return;
                }
                const targetDay = taskModal.targetDate || selectedScheduleDate;
                addTaskForDate(targetDay, {
                  type: taskModal.type,
                  title: taskModal.title.trim(),
                  category: taskModal.category.trim() || (
                    taskModal.type === 'video' ? 'Video & Share' :
                    taskModal.type === 'walk' ? 'Fitness Tracker' :
                    taskModal.type === 'slide3' ? 'Skill Puzzle' :
                    taskModal.type === 'memory' ? 'Brain Game' :
                    taskModal.type === 'music' ? 'Focus Audio' :
                    taskModal.type === 'spin' ? 'Lucky Draw' :
                    taskModal.type === 'scratch' ? 'Instant Scratch' :
                    'Special Task'
                  ),
                  platform: taskModal.platform || (taskModal.type === 'video' ? 'YouTube' : 'TaskCoin App'),
                  videoUrl: taskModal.videoUrl.trim(),
                  actionUrl: taskModal.actionUrl.trim(),
                  duration: Number(taskModal.duration) || (taskModal.type === 'walk' ? 600 : taskModal.type === 'slide3' || taskModal.type === 'memory' ? 60 : 20),
                  reward: Number(taskModal.reward) || 35,
                  shareRequired: taskModal.shareRequired === true,
                  sharePlatform: 'Facebook & Friends',
                  description: taskModal.description.trim(),
                });
                setTaskModal({ ...taskModal, isOpen: false });
              }}
            >
              {/* Target Date Selector */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Target Schedule Date (When tasks become active at 00:00 hrs)</label>
                <select
                  className="input-field"
                  value={taskModal.targetDate || selectedScheduleDate}
                  onChange={(e) => setTaskModal({ ...taskModal, targetDate: e.target.value })}
                  style={{ fontWeight: 700, color: '#34d399' }}
                >
                  {upcoming7Days.map((d) => (
                    <option key={d.dateStr} value={d.dateStr}>
                      {d.tag} — {d.dayName}, {d.shortLabel} {d.isToday ? '(Today - Active Now)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Type Selector */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Task Type / Engine Category</label>
                <select
                  className="input-field"
                  value={taskModal.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let defaultDuration = 20;
                    let defaultTitle = '';
                    let defaultCat = '';
                    if (newType === 'walk') {
                      defaultDuration = 600;
                      defaultTitle = 'Walk for 10 Minutes Health Challenge';
                      defaultCat = 'Fitness Tracker';
                    } else if (newType === 'slide3') {
                      defaultDuration = 60;
                      defaultTitle = '3×3 Slide Number Puzzle Challenge';
                      defaultCat = 'Skill Puzzle';
                    } else if (newType === 'memory') {
                      defaultDuration = 60;
                      defaultTitle = 'Wealth Icon Memory Match Challenge';
                      defaultCat = 'Brain Game';
                    } else if (newType === 'music') {
                      defaultDuration = 20;
                      defaultTitle = 'Focus Ambient Productivity Track';
                      defaultCat = 'Focus Audio';
                    } else if (newType === 'video') {
                      defaultDuration = 20;
                      defaultTitle = 'Brand Launch: Tech & Wealth Review';
                      defaultCat = 'Video & Share';
                    } else if (newType === 'custom') {
                      defaultDuration = 20;
                      defaultTitle = 'Join Official Telegram Community & Earn';
                      defaultCat = 'Community Task';
                    }
                    setTaskModal({
                      ...taskModal,
                      type: newType,
                      duration: defaultDuration,
                      category: defaultCat || taskModal.category,
                      title: defaultTitle || taskModal.title,
                    });
                  }}
                >
                  <option value="custom">🌐 Custom Task / Any Action (Website, Telegram, App, Survey, Social)</option>
                  <option value="video">📹 Video Watch & Social Share</option>
                  <option value="music">🎵 Focus Music Audio Listening</option>
                  <option value="slide3">🧩 3×3 Slide Number Puzzle (60s Countdown)</option>
                  <option value="memory">🧠 Wealth Memory Match (60s Countdown)</option>
                  <option value="walk">🏃 Walk for 10 Minutes (1,200 Steps Pedometer)</option>
                  <option value="spin">🎡 Lucky Spin Wheel</option>
                  <option value="scratch">🎟️ Golden Scratch Card</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Task Title / Campaign Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Subscribe to Official Telegram or Solve 3x3 Slide Puzzle"
                  value={taskModal.title}
                  onChange={(e) => setTaskModal({ ...taskModal, title: e.target.value })}
                  required
                />
              </div>

              {/* Category / Tag */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Category Badge (Visible to users)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Social Task, Website Review, Skill Game, Telegram, Crypto"
                  value={taskModal.category}
                  onChange={(e) => setTaskModal({ ...taskModal, category: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Reward Payout (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    className="input-field"
                    value={taskModal.reward}
                    onChange={(e) => setTaskModal({ ...taskModal, reward: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Duration / Countdown</label>
                  {taskModal.type === 'walk' ? (
                    <input
                      type="text"
                      className="input-field"
                      value="10 Minutes (600s)"
                      disabled
                    />
                  ) : taskModal.type === 'slide3' || taskModal.type === 'memory' ? (
                    <select
                      className="input-field"
                      value={taskModal.duration}
                      onChange={(e) => setTaskModal({ ...taskModal, duration: Number(e.target.value) })}
                    >
                      <option value={45}>45s Countdown (Very Hard)</option>
                      <option value={60}>60s Countdown (Standard Skill)</option>
                      <option value={90}>90s Countdown (Easy)</option>
                    </select>
                  ) : (
                    <select
                      className="input-field"
                      value={taskModal.duration}
                      onChange={(e) => setTaskModal({ ...taskModal, duration: Number(e.target.value) })}
                    >
                      <option value={10}>10 Seconds</option>
                      <option value={15}>15 Seconds</option>
                      <option value={20}>20 Seconds</option>
                      <option value={30}>30 Seconds</option>
                      <option value={45}>45 Seconds</option>
                      <option value={60}>60 Seconds</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Custom Action Link (if custom task) */}
              {taskModal.type === 'custom' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Action Link / URL (Website, Telegram Channel, App download, or form)</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://t.me/yourchannel or https://yourwebsite.com"
                    value={taskModal.actionUrl}
                    onChange={(e) => setTaskModal({ ...taskModal, actionUrl: e.target.value })}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Users will see an "Open Link ↗" button to perform this action.
                  </div>
                </div>
              )}

              {/* Video URL (if video task) */}
              {taskModal.type === 'video' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Video URL (YouTube or Facebook link) *</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={taskModal.videoUrl}
                    onChange={(e) => setTaskModal({ ...taskModal, videoUrl: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Task Description */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Task Instructions / Description for User</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Tell users what they need to do to complete this task and receive payment..."
                  value={taskModal.description}
                  onChange={(e) => setTaskModal({ ...taskModal, description: e.target.value })}
                />
              </div>

              {/* Mandatory Social Share Toggle */}
              <div style={{ padding: '0.85rem', background: 'rgba(24, 119, 242, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(24, 119, 242, 0.3)', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>
                  <input
                    type="checkbox"
                    checked={taskModal.shareRequired}
                    onChange={(e) => setTaskModal({ ...taskModal, shareRequired: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Require Social & Facebook Share to Claim Reward</span>
                </label>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                  User will not be credited until they both complete the timer and click the share button.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1, fontWeight: 700 }}>
                  <Plus size={16} /> Save Task to {upcoming7Days.find(d => d.dateStr === (taskModal.targetDate || selectedScheduleDate))?.tag || 'Schedule'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTaskModal({ ...taskModal, isOpen: false })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Copy Tasks Between Dates */}
      {copyModal.isOpen && (
        <div className="modal-overlay" onClick={() => setCopyModal({ ...copyModal, isOpen: false })}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Copy Daily Tasks
              </h3>
              <span className="badge badge-emerald">Duplicate Roster</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
              Copy all configured tasks from <strong>{upcoming7Days.find(d => d.dateStr === selectedScheduleDate)?.fullLabel}</strong> to another day in the 7-day schedule.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!copyModal.targetDate || copyModal.targetDate === selectedScheduleDate) {
                  showToast('Please pick a different destination date.', 'error');
                  return;
                }
                copyTasksToDate(selectedScheduleDate, copyModal.targetDate);
                setCopyModal({ isOpen: false, targetDate: '' });
                setSelectedScheduleDate(copyModal.targetDate); // Switch view to target date
              }}
            >
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Destination Date (Where tasks should be duplicated):</label>
                <select
                  className="input-field"
                  value={copyModal.targetDate}
                  onChange={(e) => setCopyModal({ ...copyModal, targetDate: e.target.value })}
                  style={{ fontWeight: 700, color: '#38bdf8' }}
                  required
                >
                  {upcoming7Days
                    .filter((d) => d.dateStr !== selectedScheduleDate)
                    .map((d) => (
                      <option key={d.dateStr} value={d.dateStr}>
                        {d.tag} — {d.dayName}, {d.shortLabel}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  <Copy size={15} /> Confirm & Copy Roster
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCopyModal({ isOpen: false, targetDate: '' })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
