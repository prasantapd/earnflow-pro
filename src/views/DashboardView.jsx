import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Lock, 
  Calendar, 
  ArrowDownCircle, 
  PlusCircle, 
  PlayCircle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  ArrowUpRight,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';
import { getTimeUntilMidnight, formatFullReadableDate, getLocalDateString } from '../utils/dateUtils';
import PlanCard from '../components/PlanCard';
import DailyStreakWidget from '../components/DailyStreakWidget';
import AdminAnnouncementBanner from '../components/AdminAnnouncementBanner';

export default function DashboardView({ 
  onOpenDeposit, 
  onOpenWithdraw, 
  onOpenPayout, 
  setActiveTab,
  onOpenReceipt,
  onWithdrawPrincipal 
}) {
  const { 
    user, 
    rewardWallet, 
    totalLockedPrincipal, 
    totalWithdrawn, 
    totalDailyQuota,
    plans, 
    transactions, 
    userMembershipTier,
    dailyTaskRoster,
    tasksCompletedToday,
    activePlan,
    pendingPlan,
    pendingDeposit,
    isUserActivated,
    canUserEarn,
    freeTrialStatus,
    showToast
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(getTimeUntilMidnight());

  // Countdown timer for 00:00 midnight task switch
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilMidnight(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activePlans = (plans || []).filter((p) => p.status === 'active' || p.status === 'matured');
  const recentTransactions = (transactions || []).slice(0, 5);

  // Daily Tasks calculation
  const activeTodayTasks = (dailyTaskRoster || []).filter((t) => t.status === 'ACTIVE');
  const completedTaskCount = activeTodayTasks.filter((t) => tasksCompletedToday && tasksCompletedToday[t.id]).length;
  const taskProgressPercent = activeTodayTasks.length > 0 ? Math.round((completedTaskCount / activeTodayTasks.length) * 100) : 0;
  const potentialDailyReward = activeTodayTasks.reduce((sum, t) => sum + (t.reward || 0), 0);

  // Referral link
  const baseUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1'))
    ? window.location.origin
    : 'https://earnflow-pro-3d5o.onrender.com';
  const referralCode = user?.referralCode || user?.phone || 'TASKCOIN';
  const referralUrl = `${baseUrl}/?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    showToast(`Referral link copied! Share with friends to earn binary matching bonuses.`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(`⚡ Join TaskCoin Pro and start earning daily task cash rewards! Register using my referral link: ${referralUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div>
      {/* Slim Admin Announcement Strip (Dismissible) */}
      <AdminAnnouncementBanner />

      {/* FREE REGISTRATION 2-DAY PASS ACTIVE BANNER */}
      {freeTrialStatus?.canEarn && !activePlan && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            marginBottom: '1.25rem', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(234, 88, 12, 0.14) 100%)', 
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  🎁 New User Free Pass Active (Day {freeTrialStatus.dayNumber} of 2)
                </h3>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                  Earning Unlocked!
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  1.0× ₹2,000 Reward Rates
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                You have 2 consecutive days of free task rewards and login streak bonuses! To withdraw your earnings directly to UPI, activate the <strong>₹300 3-Day Trial Plan</strong> (once per mobile) or a regular Membership Plan.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('plans')}
                  style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', borderColor: '#f472b6' }}
                >
                  ⚡ View ₹300 Trial Pass (Unlock Withdrawals) →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENDING ACTIVATION / PAYMENT APPROVAL BANNER (Only when cannot earn) */}
      {!canUserEarn && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            marginBottom: '1.25rem', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(234, 88, 12, 0.12) 100%)', 
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
                  {pendingDeposit ? '⏳ Payment Approval in Progress' : freeTrialStatus?.isExpired ? '⏰ 2-Day Free Trial Ended' : '⚠️ Account Pending Activation / Payment Approval'}
                </h3>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.3)', color: '#fef08a', fontSize: '0.65rem' }}>
                  Earning Locked
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                {pendingDeposit 
                  ? `Your payment of ₹${pendingDeposit.amount?.toLocaleString()} (UTR: ${pendingDeposit.utr}) has been submitted. Admin verification takes 5–15 minutes. Once approved, your membership plan and daily earning tasks will be unlocked!`
                  : freeTrialStatus?.isExpired
                    ? 'Your 2-Day Free Registration Pass has ended. Please subscribe to the ₹300 3-Day Trial Plan or a regular Membership Plan to continue earning.'
                    : 'Without an approved membership deposit, you cannot earn daily task rewards, login streak bonuses, or skill game prizes. Subscribe to a plan and submit your payment UTR for instant Admin activation.'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('plans')}
                  style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                >
                  {pendingDeposit ? 'Check Plans & Status →' : '👉 Choose Plan & Activate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODERN EXECUTIVE FINTECH COMMAND CARD */}
      <div className="card-fintech" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          {/* User Status Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              style={{ 
                width: 54, 
                height: 54, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 800, 
                fontSize: '1.35rem', 
                color: '#ffffff',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0
              }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  Hello, {user?.name || 'Member'}! 👋
                </h2>
                {canUserEarn ? (
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: 2 }} /> Active Member
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: '0.65rem', padding: '2px 8px' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 2 }} /> Pending Activation
                  </span>
                )}
                <span className={`badge ${userMembershipTier?.badgeClass || 'badge-cyan'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  {userMembershipTier?.tierBadge || 'Starter Member'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                  24/7 Instant UPI Payouts Active
                </span>
                <span>•</span>
                <span>{formatFullReadableDate(getLocalDateString(0))}</span>
              </div>
            </div>
          </div>

          {/* Wallet Snapshot & Actions Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right', minWidth: '130px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Reward Wallet
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.02em' }}>
                {formatINR(rewardWallet)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn btn-emerald btn-sm"
                onClick={onOpenWithdraw}
                disabled={rewardWallet < 100}
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem' }}
                title={rewardWallet < 100 ? 'Min. withdrawal is ₹100' : 'Instant UPI Payout'}
              >
                <ArrowDownCircle size={16} />
                <span>Withdraw</span>
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={onOpenDeposit}
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.95rem' }}
              >
                <PlusCircle size={16} />
                <span>{activePlans.length > 0 ? 'Upgrade' : 'Deposit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* USER-FRIENDLY QUICK ACTION HUB (4 ACCESSIBLE TILES) */}
      <div className="quick-action-grid">
        {/* Tile 1: Deposit / Plans */}
        <div 
          className="quick-action-card" 
          onClick={onOpenDeposit}
          role="button"
          tabIndex={0}
        >
          <div className="quick-action-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <PlusCircle size={22} />
          </div>
          <div className="quick-action-title">{activePlans.length > 0 ? 'Upgrade Plan' : 'Add Capital'}</div>
          <div className="quick-action-desc">100% Refundable at maturity</div>
        </div>

        {/* Tile 2: Daily Tasks */}
        <div 
          className="quick-action-card" 
          onClick={() => setActiveTab('tasks')}
          role="button"
          tabIndex={0}
          style={{ borderColor: completedTaskCount < activeTodayTasks.length ? 'rgba(251, 191, 36, 0.35)' : undefined }}
        >
          <div className="quick-action-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <PlayCircle size={22} />
          </div>
          <div className="quick-action-title">Daily Task Center</div>
          <div className="quick-action-desc" style={{ color: completedTaskCount < activeTodayTasks.length ? '#fde047' : '#94a3b8' }}>
            {completedTaskCount >= activeTodayTasks.length && activeTodayTasks.length > 0
              ? '✅ All Done Today'
              : `${completedTaskCount}/${activeTodayTasks.length} Completed`}
          </div>
        </div>

        {/* Tile 3: Instant UPI Payout */}
        <div 
          className="quick-action-card" 
          onClick={onOpenWithdraw}
          role="button"
          tabIndex={0}
        >
          <div className="quick-action-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ArrowDownCircle size={22} />
          </div>
          <div className="quick-action-title">Instant Payout</div>
          <div className="quick-action-desc">24/7 UPI • Min ₹100</div>
        </div>

        {/* Tile 4: WhatsApp Invite & MLM */}
        <div 
          className="quick-action-card" 
          onClick={handleShareWhatsApp}
          role="button"
          tabIndex={0}
        >
          <div className="quick-action-icon" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366' }}>
            <Share2 size={22} />
          </div>
          <div className="quick-action-title">WhatsApp Invite</div>
          <div className="quick-action-desc">Earn 5% Matching Bonus</div>
        </div>
      </div>

      {/* CORE 4-KPI FINANCIAL METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Task Reward Wallet */}
        <div className="glass-card card-interactive" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Task Reward Wallet
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            {formatINR(rewardWallet)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#cbd5e1' }}>
              Withdrawable anytime
            </span>
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenWithdraw}
              disabled={rewardWallet < 100}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
            >
              Payout →
            </button>
          </div>
        </div>

        {/* Card 2: Subscription Principal Capital */}
        <div className="glass-card card-interactive" style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Subscription Principal
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
              <Lock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            {formatINR(totalLockedPrincipal)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#94a3b8' }}>
              {activePlans.length > 0 ? `${activePlans.length} Active Plan` : 'No Active Plan'}
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              Refundable at Maturity
            </span>
          </div>
        </div>

        {/* Card 3: Estimated Daily Task Quota */}
        <div className="glass-card card-interactive" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Estimated Daily Quota
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            ~{formatINR(totalDailyQuota || potentialDailyReward)}
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}> / day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#cbd5e1' }}>
              ~{formatINR((totalDailyQuota || potentialDailyReward) * 7)} / week
            </span>
            <button 
              className="btn btn-gold btn-sm"
              onClick={() => setActiveTab('tasks')}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
            >
              Start Tasks
            </button>
          </div>
        </div>

        {/* Card 4: Total Disbursed */}
        <div className="glass-card card-interactive" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Total Cleared Payouts
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              <ArrowDownCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            {formatINR(totalWithdrawn)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: '#94a3b8' }}>
              IMPS / UPI Disbursed
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              Zero Platform Fee
            </span>
          </div>
        </div>
      </div>

      {/* QUICK ACTION & ACCELERATION HUB (2 COLUMNS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Box A: Today's Task Center Status */}
        <div className="glass-card" style={{ padding: '1.35rem', border: '1px solid rgba(251, 191, 36, 0.25)', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                <PlayCircle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Today's Task Center</h3>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Resets & Auto-Switches every day at 00:00 midnight
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />
                {timeUntilMidnight.hours}h {timeUntilMidnight.minutes}m {timeUntilMidnight.seconds}s
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#cbd5e1' }}>
                Daily Tasks Completed: <strong>{completedTaskCount} of {activeTodayTasks.length}</strong>
              </span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                {taskProgressPercent}% Complete
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${taskProgressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #fbbf24 0%, #10b981 100%)', 
                  borderRadius: '10px',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Today's Task Pool: <strong style={{ color: '#34d399' }}>{formatINR(potentialDailyReward)}</strong>
            </span>

            <button 
              className="btn btn-gold btn-sm"
              onClick={() => setActiveTab('tasks')}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              <span>{completedTaskCount >= activeTodayTasks.length && activeTodayTasks.length > 0 ? 'Review Completed Tasks' : 'Start Today’s Tasks'}</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Box B: 2:1 Binary MLM Referral Accelerator */}
        <div className="glass-card" style={{ padding: '1.35rem', border: '1px solid rgba(99, 102, 241, 0.25)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc' }}>
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>2:1 Binary MLM Network</h3>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Earn 5% (₹150/pair) binary matching bonuses
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('mlm')}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
            >
              Tree View →
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            Invite friends using your unique sponsor link. When your left & right teams subscribe, you unlock 2:1 paired commission directly to your wallet!
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div 
              style={{ 
                flex: 1, 
                padding: '0.45rem 0.75rem', 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                borderRadius: '8px', 
                fontSize: '0.78rem', 
                color: '#cbd5e1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Code: <strong style={{ color: '#6ee7b7' }}>{referralCode}</strong>
            </div>

            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleCopyReferral}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-emerald btn-sm"
              onClick={handleShareWhatsApp}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              title="Share Referral Link on WhatsApp"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY LOGIN STREAK ATTENDANCE WIDGET */}
      <DailyStreakWidget onOpenDeposit={onOpenDeposit} />

      {/* ACTIVE MEMBERSHIP PLAN SECTION */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Active Membership Plan</h3>
              <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>1 Active Plan Limit</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Your subscription plan unlocks your daily task quota and returns 100% of principal upon maturity.
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('plans')}
            style={{ fontSize: '0.78rem' }}
          >
            Browse All Plans <ArrowUpRight size={14} />
          </button>
        </div>

        {activePlans.length === 0 ? (
          <div 
            className="glass-card" 
            style={{ 
              padding: '2rem 1.5rem', 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px dashed rgba(6, 182, 212, 0.35)'
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', margin: '0 auto 0.75rem' }}>
              <Lock size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              No Active Membership Plan Yet
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Choose a 1-Month to 1-Year plan starting from ₹2,000 to unlock your guaranteed daily tasks and 24/7 withdrawals. Principal is 100% refundable at maturity!
            </p>
            <button 
              className="btn btn-primary" 
              onClick={onOpenDeposit}
              style={{ fontWeight: 700, padding: '0.55rem 1.4rem' }}
            >
              <PlusCircle size={16} /> Explore Plans & Deposit
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {activePlans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onWithdrawPrincipal={onWithdrawPrincipal} 
              />
            ))}
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS & FUND YIELD EXPLAINER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Ledger Activity */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Recent Ledger Activity</h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('history')}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
            >
              View All
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
              No transactions recorded yet. Complete daily tasks or deposit to see activity here!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>{tx.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {formatDate(tx.timestamp)} • {tx.meta ? tx.meta.slice(0, 28) + '...' : tx.type}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: 800, 
                      fontSize: '0.92rem', 
                      color: tx.type === 'WITHDRAWAL' || tx.type === 'PRINCIPAL_WITHDRAWAL' ? '#f43f5e' : '#34d399' 
                    }}>
                      {tx.type === 'WITHDRAWAL' || tx.type === 'PRINCIPAL_WITHDRAWAL' ? '-' : '+'}
                      {formatINR(tx.amount)}
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Fund Yield Economics */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>Fund Transparency</span>
            <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>7% / 30 Days Net</span>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            How Your Fund Yield Works
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
            The treasury deploys deposited capital to produce <strong>10% gross return per 30 days</strong>. Up to <strong>7% per 30 days</strong> is distributed to users via daily tasks, with 30-day compounding for longer lock-ins.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              <span>Advertiser Media Ingestion:</span>
              <strong style={{ color: '#34d399' }}>Brand Sponsorships & Ads</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              <span>User Task Reward Allocation:</span>
              <strong style={{ color: '#fbbf24' }}>Estimated Task Income</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              <span>Treasury & Liquidity Buffer:</span>
              <strong style={{ color: '#22d3ee' }}>Retained for Principal Safety</strong>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('economics')}
          >
            Learn Platform Monetization Model <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
