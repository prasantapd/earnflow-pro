import React from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';
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
    isWithdrawalAllowed, 
    sundayStatus, 
    forceSunday, 
    toggleForceSunday,
    userMembershipTier
  } = useApp();

  const activePlans = plans.filter((p) => p.status === 'active' || p.status === 'matured');
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div>
      {/* Admin Broadcast Notice Banner */}
      <AdminAnnouncementBanner />

      {/* Welcome Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">Verified Investor</span>
              <span className={`badge ${userMembershipTier?.badgeClass || 'badge-cyan'}`}>{userMembershipTier?.tierBadge || 'Starter Member'}</span>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>{userMembershipTier?.taskMultiplier || 1.0}× Task Boost</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Member since {formatDate(user.joinedDate)}</span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Welcome back, {user.name}! 👋
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '600px', marginTop: '0.35rem' }}>
              Earn daily task income through our creator promotion & advertising distribution network. Higher membership tiers unlock higher <strong>estimated daily task rewards</strong>!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={onOpenDeposit}
            >
              <PlusCircle size={18} /> {activePlans.length > 0 ? 'Upgrade Membership Plan' : 'Select Plan'}
            </button>
            <button 
              className="btn btn-gold"
              onClick={() => setActiveTab('tasks')}
            >
              <PlayCircle size={18} /> Daily Task Center
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: Task Reward Wallet */}
        <div className="glass-card card-interactive" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Task Reward Wallet
            </span>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34d399', marginBottom: '0.4rem' }}>
            {formatINR(rewardWallet)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              🟢 24/7 Instant Payouts Active
            </span>
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenWithdraw}
              disabled={rewardWallet < 100}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Card 2: Total Locked Principal */}
        <div className="glass-card card-interactive" style={{ padding: '1.5rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Subscription Principal
            </span>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
              <Lock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#22d3ee', marginBottom: '0.4rem' }}>
            {formatINR(totalLockedPrincipal)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {activePlans.length} Active Plan (1 Limit)
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              Refundable at Maturity
            </span>
          </div>
        </div>

        {/* Card 3: Daily Task Quota */}
        <div className="glass-card card-interactive" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Estimated Daily Task Quota
            </span>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.4rem' }}>
            ~{formatINR(totalDailyQuota)}
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}> / day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              ~{formatINR(totalDailyQuota * 7)} / week
            </span>
            <button 
              className="btn btn-gold btn-sm"
              onClick={() => setActiveTab('tasks')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            >
              Do Tasks
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            *Must complete tasks to earn. Incomplete tasks earn ₹0.
          </div>
        </div>

        {/* Card 4: Total Withdrawn */}
        <div className="glass-card card-interactive" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Disbursed
            </span>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              <ArrowDownCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#a78bfa', marginBottom: '0.4rem' }}>
            {formatINR(totalWithdrawn)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Paid to Bank / UPI
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
              Zero Fees
            </span>
          </div>
        </div>
      </div>

      {/* Daily Login Streak Attendance Bonus Widget */}
      <DailyStreakWidget />

      {/* 24/7 Instant Payout Gateway Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.25rem 1.5rem', 
          marginBottom: '2rem', 
          background: 'rgba(16, 185, 129, 0.12)',
          borderColor: 'var(--emerald-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#34d399' }}>
              24/7 Instant Payout Gateway is Active!
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Withdraw your accumulated task earnings anytime, any day directly via IMPS / UPI (Min. ₹100 • 1 payout per 24 hours).
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn btn-primary"
            onClick={onOpenWithdraw}
            disabled={rewardWallet < 100}
          >
            <ArrowDownCircle size={16} /> Withdraw Rewards ({formatINR(rewardWallet)})
          </button>
        </div>
      </div>

      {/* Active Subscribed Plans Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>My Active Membership Plan</h3>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>1 Active Plan Limit</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Active membership tier unlocking daily task quota. Upgrades to higher tiers permitted anytime (downgrades prohibited).
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('plans')}
          >
            View All Plans <ArrowUpRight size={14} />
          </button>
        </div>

        {activePlans.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Lock size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Active Plans Subscribed Yet</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Deposit ₹2,000, ₹5,000, or ₹10,000+ with 1M to 1Y lock-in to start earning daily task rewards!
            </p>
            <button className="btn btn-primary" onClick={onOpenDeposit}>
              <PlusCircle size={16} /> Subscribe First Plan
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
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

      {/* Recent Transactions & Fund Logic Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Transactions */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Ledger Activity</h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('history')}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              See All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTransactions.map((tx) => (
              <div 
                key={tx.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>{tx.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatDate(tx.timestamp)} • {tx.meta?.slice(0, 32)}...</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 800, 
                    fontSize: '0.95rem', 
                    color: tx.type === 'WITHDRAWAL' || tx.type === 'PRINCIPAL_WITHDRAWAL' ? '#f43f5e' : '#34d399' 
                  }}>
                    {tx.type === 'WITHDRAWAL' || tx.type === 'PRINCIPAL_WITHDRAWAL' ? '-' : '+'}
                    {formatINR(tx.amount)}
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10% Fund Economics Highlights */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-emerald">Fund Transparency</span>
            <span className="badge badge-gold">Max 7% per 30 Days</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            How Your Fund Yield Works
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            The treasury deploys deposited capital to produce <strong>10% gross return per 30 days</strong>. Up to <strong>7% per 30 days</strong> is distributed to users via daily tasks, with 30-day compounding for longer lock-ins.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              <span>Advertiser Media Ingestion:</span>
              <strong style={{ color: '#34d399' }}>Brand Sponsorships & Ads</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              <span>User Task Reward Allocation:</span>
              <strong style={{ color: '#fbbf24' }}>Estimated Task Income</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              <span>Treasury & Liquidity Buffer:</span>
              <strong style={{ color: '#22d3ee' }}>Retained for Principal Safety</strong>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
            onClick={() => setActiveTab('economics')}
          >
            Learn Platform Task Monetization Model <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
