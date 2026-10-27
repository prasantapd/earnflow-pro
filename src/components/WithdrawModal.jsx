import React, { useState } from 'react';
import { 
  X, 
  ArrowDownCircle, 
  Calendar, 
  Zap, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/finance';

export default function WithdrawModal({ isOpen, onClose, onOpenPayoutSetup, onOpenReceipt }) {
  const { 
    rewardWallet, 
    payoutMethod, 
    isWithdrawalAllowed, 
    sundayStatus, 
    forceSunday, 
    toggleForceSunday, 
    withdrawRewards,
    showToast 
  } = useApp();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentBal = Number(rewardWallet) || 0;
  const numAmount = Number(withdrawAmount) || 0;
  const remainingBal = Math.max(0, currentBal - numAmount);

  const handleQuickPercent = (pct) => {
    const val = Math.floor((currentBal * pct) / 100);
    setWithdrawAmount(val.toString());
  };

  const handleWithdraw = (e) => {
    e.preventDefault();

    if (!payoutMethod) {
      showToast('Please configure your UPI or Bank account first.', 'error');
      onOpenPayoutSetup();
      return;
    }

    if (numAmount <= 0) {
      showToast('Please enter an amount to withdraw', 'error');
      return;
    }

    if (numAmount < 100) {
      showToast('Minimum withdrawal amount is ₹100.', 'error');
      return;
    }

    if (numAmount > currentBal) {
      showToast('Withdrawal amount exceeds your available task reward balance', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const txn = withdrawRewards(numAmount, payoutMethod);
      if (txn) {
        onClose();
        if (onOpenReceipt) onOpenReceipt(txn);
      }
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <ArrowDownCircle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>24/7 Instant Reward Withdrawal</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Instant IMPS / UPI payout anytime, any day (Min ₹100 • 1 withdrawal / 24h)
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 24/7 Instant Engine Status Card */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '0.85rem 1rem', 
            background: 'rgba(16, 185, 129, 0.12)', 
            borderColor: 'rgba(16, 185, 129, 0.35)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle size={20} color="#34d399" />
            <div>
              <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>24/7 Payout Gateway Active</span>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Instant IMPS Disbursal • Min ₹100 • 1 Payout / 24h
              </div>
            </div>
          </div>
          <span className="badge badge-emerald">Instant Transfer</span>
        </div>

        {/* Payout Destination Card */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
              <CreditCard size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Payout Destination</div>
              {payoutMethod ? (
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                  {payoutMethod.type === 'upi_id' && `UPI: ${payoutMethod.upiId}`}
                  {payoutMethod.type === 'upi_phone' && `UPI Mobile: ${payoutMethod.upiPhone} (${payoutMethod.upiApp})`}
                  {payoutMethod.type === 'bank' && `${payoutMethod.bankName} (••••${payoutMethod.accountNumber.slice(-4)})`}
                </div>
              ) : (
                <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ No Payout Method Configured
                </div>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onOpenPayoutSetup}
            style={{ fontSize: '0.78rem' }}
          >
            {payoutMethod ? 'Change' : 'Setup Now'}
          </button>
        </div>

        <form onSubmit={handleWithdraw}>
          {/* Amount input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="form-label">
              <span>Withdrawal Amount</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>
                Available: {formatINR(currentBal)}
              </span>
            </div>

            <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#34d399', fontSize: '1.15rem' }}>
                ₹
              </span>
              <input
                type="number"
                min="100"
                max={currentBal}
                step="1"
                className="input-field"
                style={{ paddingLeft: '2.5rem', fontSize: '1.2rem', fontWeight: 700 }}
                placeholder="Enter amount (min ₹100)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
            </div>

            {/* Quick Percentage Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickPercent(pct)}
                  style={{ fontWeight: 600, fontSize: '0.82rem' }}
                >
                  {pct === 100 ? 'Full (100%)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown summary */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem', 
              marginBottom: '1.5rem', 
              background: 'rgba(255, 255, 255, 0.02)',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#94a3b8' }}>
              <span>Gross Withdrawal:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatINR(numAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#94a3b8' }}>
              <span>Processing Platform Fee:</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>₹0.00 (Zero Fee)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#94a3b8' }}>
              <span>Remaining Task Wallet:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatINR(remainingBal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontWeight: 700 }}>
              <span style={{ color: '#34d399' }}>Net Disbursed to Account:</span>
              <span style={{ color: '#34d399', fontSize: '1.05rem' }}>{formatINR(numAmount)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ flex: 1 }}
              disabled={numAmount <= 0 || numAmount > currentBal || !isWithdrawalAllowed || isProcessing}
            >
              {isProcessing ? 'Processing Payout...' : `Confirm & Withdraw ${formatINR(numAmount)}`}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
