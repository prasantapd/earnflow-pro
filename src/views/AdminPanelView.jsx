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
  FileText
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
    showToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users', 'deposits', 'withdrawals', 'settings'
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Modals inside admin
  const [suspensionModal, setSuspensionModal] = useState({ isOpen: false, user: null, reason: '' });
  const [passwordResetModal, setPasswordResetModal] = useState({ isOpen: false, user: null, newPassword: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, type: '', id: '', reason: '' });

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
                          {dep.planMonths}M Lock-in ({(dep.planMonthlyRate * 100).toFixed(1)}%/mo)
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
    </div>
  );
}
