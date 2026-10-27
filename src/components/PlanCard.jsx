import React from 'react';
import { Lock, Unlock, Calendar, CheckCircle2, ArrowDownCircle, ShieldCheck } from 'lucide-react';
import { formatINR, formatDate } from '../utils/finance';
import { useApp } from '../context/AppContext';

export default function PlanCard({ plan, onWithdrawPrincipal }) {
  const { withdrawPrincipal } = useApp();

  const startDate = new Date(plan.startDate);
  const maturityDate = new Date(plan.maturityDate);
  const now = new Date();

  const totalDays = Math.max(1, Math.round((maturityDate - startDate) / 86400000));
  const daysPassed = Math.max(0, Math.round((now - startDate) / 86400000));
  const progressPercent = Math.min(100, Math.round((daysPassed / totalDays) * 100));
  const isMatured = plan.status === 'matured' || now >= maturityDate;
  const isWithdrawn = plan.status === 'principal_withdrawn';
  const isSuperseded = plan.status === 'superseded_upgrade';

  const handleWithdrawClick = () => {
    if (onWithdrawPrincipal) {
      onWithdrawPrincipal(plan);
    } else {
      withdrawPrincipal(plan.id);
    }
  };

  return (
    <div 
      className="glass-card card-interactive" 
      style={{ 
        padding: '1.5rem',
        border: isMatured && !isWithdrawn 
          ? '1.5px solid var(--emerald-500)' 
          : isSuperseded 
            ? '1px dashed rgba(255, 255, 255, 0.15)' 
            : '1px solid var(--border-subtle)',
        background: isMatured && !isWithdrawn 
          ? 'rgba(16, 185, 129, 0.08)' 
          : isSuperseded
            ? 'rgba(15, 23, 42, 0.4)'
            : 'var(--bg-card)',
        opacity: isSuperseded ? 0.75 : 1
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{plan.id}</span>
            <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
              {plan.days || plan.months * 30} Days Tier
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>{plan.title}</h3>
        </div>

        {isWithdrawn ? (
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
            Principal Refunded
          </span>
        ) : isSuperseded ? (
          <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
            Upgraded to Higher Tier
          </span>
        ) : isMatured ? (
          <span className="badge badge-emerald pulse-glow">
            <Unlock size={12} /> Lock-in Matured
          </span>
        ) : (
          <span className="badge badge-cyan">
            <Lock size={12} /> Active Plan
          </span>
        )}
      </div>

      {/* Financials Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Subscription Principal</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
            {formatINR(plan.amount)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estimated Task Income</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
            +{formatINR(plan.estimatedTotalIncome || plan.totalExpectedGain)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Estimated Daily Task Quota</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
            ~{formatINR(plan.estimatedDailyQuota || plan.dailyQuota)} / day
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Lock-in Maturity Date</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isMatured ? '#34d399' : '#cbd5e1' }}>
            {formatDate(plan.maturityDate)}
          </div>
        </div>
      </div>

      {/* Lock-in Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', color: '#94a3b8' }}>
          <span>Maturity Lock-in Progress</span>
          <span style={{ fontWeight: 700, color: isMatured ? '#34d399' : '#22d3ee' }}>
            {isMatured ? '100% (Completed)' : `${progressPercent}%`}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              background: isMatured ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Action Area */}
      {isWithdrawn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle2 size={16} color="#34d399" />
          <span>Full principal {formatINR(plan.amount)} has been paid out.</span>
        </div>
      ) : isSuperseded ? (
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          Plan upgraded to higher tier. Principal & benefits transferred to current active plan.
        </div>
      ) : isMatured ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleWithdrawClick}
        >
          <ArrowDownCircle size={18} /> Withdraw Full Principal ({formatINR(plan.amount)})
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#06b6d4" />
            <span>Principal refund eligible upon maturity</span>
          </div>
          <span style={{ color: '#22d3ee', fontWeight: 600 }}>
            {Math.max(0, totalDays - daysPassed)} days left
          </span>
        </div>
      )}
    </div>
  );
}
