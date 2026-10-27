import React from 'react';
import { 
  ArrowDownCircle, 
  Calendar, 
  Zap, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';

export default function WithdrawView({ onOpenWithdraw, onOpenPayout, onWithdrawPrincipal }) {
  const { 
    rewardWallet, 
    totalWithdrawn, 
    payoutMethod, 
    isWithdrawalAllowed, 
    sundayStatus, 
    forceSunday, 
    toggleForceSunday,
    plans 
  } = useApp();

  const maturedPlans = plans.filter((p) => p.status === 'matured');
  const activePlans = plans.filter((p) => p.status === 'active');
  const withdrawnPlans = plans.filter((p) => p.status === 'principal_withdrawn');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-emerald">⚡ 24/7 Instant Payouts Active</span>
          <span className="badge badge-gold">Instant IMPS Disbursal</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Withdrawal & Settlement Center</h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '750px' }}>
          Withdraw your accumulated task rewards anytime, any day directly to your UPI or Bank Account (Min. ₹100 • 1 payout per 24 hours). Matured plan principals are unlocked automatically after their lock-in period.
        </p>
      </div>

      {/* Main Withdrawal Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Left: Reward Wallet & 24/7 Engine Trigger */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '2rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Accumulated Task Rewards
              </span>
              <span className="badge badge-emerald">
                🟢 24/7 Instant Payouts
              </span>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem' }}>
              {formatINR(rewardWallet)}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
              Earned from watching videos, streaming music, daily login streaks, and casual games. Ready for instant 24/7 cash-out.
            </p>

            {/* 24/7 Payout Rules Box */}
            <div 
              style={{ 
                padding: '1rem', 
                background: 'rgba(15, 23, 42, 0.7)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#34d399' }}>
                <Clock size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  24/7 Instant IMPS Disbursal Engine
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                • <strong>Anytime Disbursal:</strong> Withdraw 24/7/365 to your verified UPI ID or Bank Account.<br />
                • <strong>Min. Withdrawal:</strong> ₹100 per request (zero platform fees).<br />
                • <strong>Daily Frequency:</strong> 1 withdrawal per 24 hours per user.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary btn-lg"
              onClick={onOpenWithdraw}
              disabled={rewardWallet < 100}
            >
              <ArrowDownCircle size={18} />
              <span>Withdraw Task Rewards ({formatINR(rewardWallet)})</span>
            </button>

            {rewardWallet < 100 && (
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', textAlign: 'center' }}>
                ⚠️ Minimum withdrawal is ₹100. Complete daily tasks or streak bonus to reach ₹100!
              </div>
            )}
          </div>
        </div>

        {/* Right: Payout Destination & Security Details */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Configured Payout Destination</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={onOpenPayout}
                style={{ fontSize: '0.78rem' }}
              >
                {payoutMethod ? 'Edit Details' : 'Configure'}
              </button>
            </div>

            {payoutMethod ? (
              <div 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.62rem', marginBottom: '0.15rem' }}>
                      {payoutMethod.type === 'upi_id' ? 'UPI VPA' : payoutMethod.type === 'upi_phone' ? 'UPI Mobile' : 'Bank Account'}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                      {payoutMethod.type === 'upi_id' && payoutMethod.upiId}
                      {payoutMethod.type === 'upi_phone' && `${payoutMethod.upiPhone} (${payoutMethod.upiApp})`}
                      {payoutMethod.type === 'bank' && `${payoutMethod.bankName}`}
                    </div>
                  </div>
                </div>

                {payoutMethod.type === 'bank' && (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>Holder: <strong style={{ color: '#ffffff' }}>{payoutMethod.holderName}</strong></div>
                    <div>Account: <strong style={{ color: '#ffffff' }}>••••{payoutMethod.accountNumber.slice(-4)}</strong></div>
                    <div>IFSC: <strong style={{ color: '#ffffff' }}>{payoutMethod.ifsc}</strong></div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <AlertCircle size={28} color="#fbbf24" style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>
                  No Payout Method Set Up
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                  Please add your UPI ID, UPI Phone number, or Bank account to receive Sunday withdrawals.
                </p>
                <button className="btn btn-gold btn-sm" onClick={onOpenPayout}>
                  Setup Payout Method Now
                </button>
              </div>
            )}

            {/* Payout Security & Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>Zero Platform Withdrawal Fees (100% free disbursals)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>Supports partial or full balances 24/7 (Min ₹100 • 1/day)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span>Direct IMPS / UPI automated settlement</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: '#94a3b8' }}>All-Time Disbursed to Date:</span>
            <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1.05rem' }}>{formatINR(totalWithdrawn)}</span>
          </div>
        </div>
      </div>

      {/* Principal Lock-in Refund Section */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Principal Lock-in Refunds</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              When your 1M, 3M, 6M, or 1Y plan reaches maturity, your original deposit principal unlocks for refund
            </p>
          </div>
        </div>

        {maturedPlans.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Unlock size={16} /> Matured Plans Ready for Principal Withdrawal ({maturedPlans.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {maturedPlans.map((plan) => (
                <div 
                  key={plan.id}
                  style={{ 
                    padding: '1.25rem', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1.5px solid var(--emerald-500)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{plan.title}</span>
                      <span className="badge badge-emerald">Matured</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {plan.months} Month Lock-in • Matured on {formatDate(plan.maturityDate)}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.5rem' }}>
                      {formatINR(plan.amount)} Principal
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => onWithdrawPrincipal(plan)}
                  >
                    <ArrowDownCircle size={16} /> Withdraw Principal ({formatINR(plan.amount)})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Locked Plans summary */}
        {activePlans.length > 0 && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>
              Currently Locked Plans ({activePlans.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {activePlans.map((plan) => (
                <div 
                  key={plan.id}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{plan.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Matures on {formatDate(plan.maturityDate)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#22d3ee' }}>{formatINR(plan.amount)}</div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>
                      <Lock size={10} /> Locked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
