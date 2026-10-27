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
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';

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
    gamingStats
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users', 'deposits', 'withdrawals', 'settings', 'tasks'
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Modals inside admin
  const [suspensionModal, setSuspensionModal] = useState({ isOpen: false, user: null, reason: '' });
  const [passwordResetModal, setPasswordResetModal] = useState({ isOpen: false, user: null, newPassword: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, type: '', id: '', reason: '' });
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    type: 'video',
    title: '',
    platform: 'YouTube',
    videoUrl: '',
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
          className={`btn ${activeAdminTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('settings')}
        >
          <Sliders size={16} /> System & Treasury Rates
        </button>

        <button
          className={`btn ${activeAdminTab === 'tasks' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveAdminTab('tasks')}
        >
          <Sliders size={16} /> Daily Task Roster ({(dailyTaskRoster || []).filter((t) => t.status === 'ACTIVE').length} Active)
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
        </div>
      )}

      {/* TAB 5: DYNAMIC DAILY TASK ROSTER & CAMPAIGN ORCHESTRATOR */}
      {activeAdminTab === 'tasks' && (
        <div>
          {/* Action Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-emerald">Daily Task Orchestrator</span>
                <span className="badge badge-gold">Dynamic Combination Engine</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daily Task Roster & Campaign Manager</h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '720px' }}>
                Change what tasks users see each day (e.g. Video + Song + 3x3 Slide, Video + Games + Walk for 10 Mins). Timed skill games limit payout liability while increasing viral reach and retention.
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ fontWeight: 700 }}
              onClick={() => setTaskModal({
                isOpen: true,
                type: 'video',
                title: '',
                platform: 'YouTube',
                videoUrl: '',
                duration: 20,
                reward: 35,
                shareRequired: true,
                sharePlatform: 'Facebook & Friends',
                description: '',
              })}
            >
              <Plus size={16} /> Add Custom Task to Roster
            </button>
          </div>

          {/* Quick Preset Combo Switcher */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={15} color="#fbbf24" /> 1-Click Daily Roster Presets (Switch Today's Mix Instantly)
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Admin can switch combinations anytime without coding
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {(taskRosterPresets || []).map((preset) => (
                <div 
                  key={preset.id}
                  className="card-interactive"
                  onClick={() => applyTaskRosterPreset(preset.id)}
                  style={{
                    padding: '0.85rem 1rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{preset.badge}</span>
                      <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>Apply Combo →</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.3 }}>
                      {preset.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Tasks Today</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
                {(dailyTaskRoster || []).filter((t) => t.status === 'ACTIVE').length} Active
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {(dailyTaskRoster || []).length} total configured in platform
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Max Potential Payout</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', margin: '0.2rem 0' }}>
                {formatINR((dailyTaskRoster || []).filter((t) => t.status === 'ACTIVE').reduce((sum, t) => sum + (Number(t.reward) || 0), 0))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                If 100% of all tasks are completed
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.15rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Skill-Barrier Tasks</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', margin: '0.2rem 0' }}>
                {(dailyTaskRoster || []).filter((t) => t.status === 'ACTIVE' && (t.type === 'slide3' || t.type === 'memory' || t.type === 'walk')).length} Timed Tasks
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Reduces company payout liability by ~50%
              </div>
            </div>
          </div>

          {/* Dynamic Tasks Roster Table */}
          <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', color: '#f8fafc' }}>
              Platform Task Catalog & Active Roster Status
            </div>

            {(!dailyTaskRoster || dailyTaskRoster.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                <Video size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No tasks configured in roster. Click <strong>"Add Custom Task to Roster"</strong> to publish your first task!</p>
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
                  {dailyTaskRoster.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'video' ? 'rgba(239, 68, 68, 0.2)' : t.type === 'walk' ? 'rgba(16, 185, 129, 0.2)' : t.type === 'slide3' ? 'rgba(99, 102, 241, 0.2)' : t.type === 'memory' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: t.type === 'video' ? '#f87171' : t.type === 'walk' ? '#34d399' : t.type === 'slide3' ? '#818cf8' : t.type === 'memory' ? '#60a5fa' : '#fbbf24' }}>
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
                        {t.type === 'slide3' && <span style={{ fontSize: '0.68rem', color: '#f87171' }}>Strict 60s countdown</span>}
                        {t.type === 'memory' && <span style={{ fontSize: '0.68rem', color: '#f87171' }}>Strict 60s countdown</span>}
                        {t.type === 'walk' && <span style={{ fontSize: '0.68rem', color: '#34d399' }}>1,200 Steps Pedometer</span>}
                        {t.shareRequired && <span style={{ fontSize: '0.68rem', color: '#60a5fa' }}>+ Mandatory FB Share</span>}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 800, color: '#34d399' }}>
                        +{formatINR(t.reward)}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${t.status === 'ACTIVE' ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                          {t.status === 'ACTIVE' ? '🟢 ACTIVE TODAY' : '⚪ PAUSED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            className={`btn ${t.status === 'ACTIVE' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                            onClick={() => toggleDailyTaskStatus(t.id)}
                            title="Toggle whether users can see and complete this task today"
                          >
                            {t.status === 'ACTIVE' ? 'Pause Task' : 'Activate Task'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => {
                              if (window.confirm(`Delete task "${t.title}" permanently?`)) {
                                deleteDailyTask(t.id);
                              }
                            }}
                            title="Delete task from platform"
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

      {/* Modal: Add New Task to Daily Roster */}
      {taskModal.isOpen && (
        <div className="modal-overlay" onClick={() => setTaskModal({ ...taskModal, isOpen: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Publish Task to Daily Roster
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Create a new task. You can choose Video & Share, Focus Music, 3×3 Slide Puzzle, Memory Match, or 10-Minute Walk.
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
                addCustomDailyTask({
                  type: taskModal.type,
                  title: taskModal.title,
                  platform: taskModal.platform || (taskModal.type === 'video' ? 'YouTube' : 'EarnFlow App'),
                  videoUrl: taskModal.videoUrl,
                  duration: Number(taskModal.duration) || (taskModal.type === 'walk' ? 600 : taskModal.type === 'slide3' || taskModal.type === 'memory' ? 60 : 20),
                  reward: Number(taskModal.reward) || 35,
                  shareRequired: taskModal.type === 'video' ? taskModal.shareRequired : false,
                  sharePlatform: 'Facebook & Friends',
                  description: taskModal.description,
                });
                setTaskModal({ ...taskModal, isOpen: false });
              }}
            >
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Task Type / Category</label>
                <select
                  className="input-field"
                  value={taskModal.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let defaultDuration = 20;
                    let defaultTitle = '';
                    if (newType === 'walk') {
                      defaultDuration = 600;
                      defaultTitle = 'Walk for 10 Minutes Health Challenge';
                    } else if (newType === 'slide3') {
                      defaultDuration = 60;
                      defaultTitle = '3×3 Slide Number Puzzle Challenge';
                    } else if (newType === 'memory') {
                      defaultDuration = 60;
                      defaultTitle = 'Wealth Icon Memory Match Challenge';
                    } else if (newType === 'music') {
                      defaultDuration = 20;
                      defaultTitle = 'Focus Ambient Productivity Track';
                    } else if (newType === 'video') {
                      defaultDuration = 20;
                      defaultTitle = 'Brand Launch: Tech & Wealth Review';
                    }
                    setTaskModal({
                      ...taskModal,
                      type: newType,
                      duration: defaultDuration,
                      title: defaultTitle || taskModal.title,
                    });
                  }}
                >
                  <option value="video">📹 Video Watch & Facebook Share</option>
                  <option value="music">🎵 Focus Music Audio Listening</option>
                  <option value="slide3">🧩 3×3 Slide Number Puzzle (60s Countdown)</option>
                  <option value="memory">🧠 Wealth Memory Match (60s Countdown)</option>
                  <option value="walk">🏃 Walk for 10 Minutes (1,200 Steps Pedometer)</option>
                  <option value="spin">🎡 Lucky Spin Wheel</option>
                  <option value="scratch">🎟️ Golden Scratch Card</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Task Title / Campaign Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 3x3 Slide Puzzle or 10-Min Walk Challenge"
                  value={taskModal.title}
                  onChange={(e) => setTaskModal({ ...taskModal, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Reward Payout (₹)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
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
                      <option value={15}>15 Seconds</option>
                      <option value={20}>20 Seconds</option>
                      <option value={30}>30 Seconds</option>
                      <option value={60}>60 Seconds</option>
                    </select>
                  )}
                </div>
              </div>

              {taskModal.type === 'video' && (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Video URL (YouTube or Facebook link)</label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      value={taskModal.videoUrl}
                      onChange={(e) => setTaskModal({ ...taskModal, videoUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ padding: '0.85rem', background: 'rgba(24, 119, 242, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(24, 119, 242, 0.3)', marginBottom: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>
                      <input
                        type="checkbox"
                        checked={taskModal.shareRequired}
                        onChange={(e) => setTaskModal({ ...taskModal, shareRequired: e.target.checked })}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Mandatory Facebook & Social Share Required</span>
                    </label>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                      User will not receive payout until they complete both the watch timer and share to Facebook.
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1, fontWeight: 700 }}>
                  <Plus size={16} /> Publish Task to Roster
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
    </div>
  );
}
