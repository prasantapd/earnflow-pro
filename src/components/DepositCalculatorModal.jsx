import React, { useState, useMemo } from 'react';
import { 
  X, 
  Coins, 
  Calculator, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  Lock,
  ArrowUpCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPOSIT_PRESETS, LOCKIN_PERIODS, calculateEarnings, formatINR } from '../utils/finance';

export default function DepositCalculatorModal({ isOpen, onClose }) {
  const { subscribePlan, plans, showToast } = useApp();

  // Find user's current active plan
  const activePlan = (plans || []).find((p) => p.status === 'active');
  const minAllowedUpgrade = activePlan ? activePlan.amount + 1000 : 2000;

  // Default to the first preset higher than active plan, or 10000
  const defaultAmount = useMemo(() => {
    if (!activePlan) return 10000;
    const higher = DEPOSIT_PRESETS.find((amt) => amt > activePlan.amount);
    return higher || activePlan.amount + 5000;
  }, [activePlan]);

  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState(defaultAmount.toString());
  const [selectedLockin, setSelectedLockin] = useState(LOCKIN_PERIODS[1]); // Default 3 Months
  const [planTitle, setPlanTitle] = useState('');

  // Calculate live task income projection (no % returns!)
  const calculation = useMemo(() => {
    const amount = Number(customAmount) || selectedAmount;
    return calculateEarnings(amount, selectedLockin.months, selectedLockin.tierFactor);
  }, [customAmount, selectedAmount, selectedLockin]);

  if (!isOpen) return null;

  const numAmount = Number(customAmount) || 0;
  const isDowngradeAttempt = activePlan && numAmount <= activePlan.amount;

  const handleSelectPreset = (amount) => {
    if (activePlan && amount <= activePlan.amount) {
      showToast(`Cannot downgrade to ₹${amount.toLocaleString()}. Your current active tier is ₹${activePlan.amount.toLocaleString()}.`, 'warning');
      return;
    }
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setSelectedAmount(Number(val) || 0);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    
    if (!amount || amount < 2000) {
      showToast('Minimum membership deposit is ₹2,000', 'error');
      return;
    }

    if (activePlan && amount <= activePlan.amount) {
      showToast(`Downgrade not permitted. You must select an amount higher than ₹${activePlan.amount.toLocaleString()}.`, 'error');
      return;
    }

    const success = subscribePlan({
      amount,
      lockinPeriod: selectedLockin,
      title: planTitle.trim() || `${selectedLockin.label} Membership Tier`,
    });

    if (success !== false) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 660, padding: '2rem' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Coins size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {activePlan ? 'Upgrade Membership Plan' : 'Select Membership Tier'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                {activePlan 
                  ? 'Upgrade to a higher tier to unlock increased estimated daily task rewards' 
                  : 'Select deposit amount and lock-in period for task rewards'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Active Plan Policy Banner */}
        {activePlan ? (
          <div 
            className="glass-card" 
            style={{ 
              padding: '0.85rem 1rem', 
              marginBottom: '1.25rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderColor: 'rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                Current Active Plan (1 Plan Limit)
              </div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                {activePlan.title} — {formatINR(activePlan.amount)} ({activePlan.months}M Tier)
              </div>
            </div>
            <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
              Upgrades Only
            </span>
          </div>
        ) : (
          <div 
            className="glass-card" 
            style={{ 
              padding: '0.75rem 1rem', 
              marginBottom: '1.25rem', 
              background: 'rgba(16, 185, 129, 0.08)', 
              borderColor: 'rgba(16, 185, 129, 0.25)',
              fontSize: '0.78rem',
              color: '#cbd5e1'
            }}
          >
            ℹ️ <strong>Single Plan Rule:</strong> Each user can maintain 1 active membership plan at a time. Upgrades to higher tiers are permitted at any time.
          </div>
        )}

        <form onSubmit={handleConfirm}>
          {/* Step 1: Deposit Amount Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="form-label">
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                1. Select Subscription Amount (₹)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
                Principal Refundable at Maturity
              </span>
            </div>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {DEPOSIT_PRESETS.map((amt) => {
                const isSelected = selectedAmount === amt;
                const isCurrentActive = activePlan && activePlan.amount === amt;
                const isLowerThanActive = activePlan && amt < activePlan.amount;
                const isDisabled = isCurrentActive || isLowerThanActive;

                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectPreset(amt)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: isDisabled
                        ? 'rgba(255, 255, 255, 0.02)'
                        : isSelected 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)' 
                          : 'rgba(255, 255, 255, 0.04)',
                      border: `1.5px solid ${isDisabled ? 'rgba(255, 255, 255, 0.05)' : isSelected ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
                      color: isDisabled ? '#64748b' : isSelected ? '#34d399' : '#e2e8f0',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'var(--transition)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.15rem',
                      opacity: isDisabled ? 0.45 : 1
                    }}
                  >
                    <span>₹{amt.toLocaleString()}</span>
                    {isCurrentActive && (
                      <span className="badge" style={{ fontSize: '0.55rem', padding: '1px 4px', background: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}>Active</span>
                    )}
                    {isLowerThanActive && (
                      <span style={{ fontSize: '0.55rem', color: '#f87171' }}>Downgrade blocked</span>
                    )}
                    {!isDisabled && amt === 50000 && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>VIP Tier</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}>
                ₹
              </span>
              <input
                type="number"
                min={activePlan ? activePlan.amount + 1 : 2000}
                step="500"
                className="input-field"
                style={{ 
                  paddingLeft: '2.5rem', 
                  fontSize: '1.1rem', 
                  fontWeight: 700,
                  borderColor: isDowngradeAttempt ? '#ef4444' : undefined 
                }}
                value={customAmount}
                onChange={handleCustomChange}
                placeholder={activePlan ? `Enter upgrade amount (min ₹${(activePlan.amount + 500).toLocaleString()})` : "Enter amount (min ₹2,000)"}
              />
            </div>

            {isDowngradeAttempt && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={13} />
                <span>Downgrading is prohibited. Please enter an amount higher than your active plan (₹{activePlan.amount.toLocaleString()}).</span>
              </div>
            )}
          </div>

          {/* Step 2: Lock-in Period & Estimated Task Quota */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="form-label">
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>2. Select Lock-in Duration</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>1 Month to 1 Year</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              {LOCKIN_PERIODS.map((period) => {
                const isSelected = selectedLockin.id === period.id;
                return (
                  <div
                    key={period.id}
                    onClick={() => setSelectedLockin(period)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isSelected ? period.color : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? period.color : '#f1f5f9' }}>
                        {period.label}
                      </span>
                      <span 
                        className="badge" 
                        style={{ 
                          background: `${period.color}25`, 
                          color: period.color, 
                          border: `1px solid ${period.color}50`, 
                          fontSize: '0.65rem' 
                        }}
                      >
                        {period.badge}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                      {period.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Plan Name (Optional) */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              <span>Custom Plan Label (Optional)</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={`e.g. My ${selectedLockin.label} Growth Plan`}
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
            />
          </div>

          {/* Dynamic Task Earning Projection Card (NO % RETURNS!) */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1.25rem', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                <Calculator size={16} /> Estimated Task Income Projection
              </div>
              <span className="badge badge-emerald">
                Task Based Earning
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subscription Principal</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {formatINR(calculation.principal)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Total Task Income</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  +{formatINR(calculation.estimatedTotalIncome)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Daily Task Quota</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
                  ~{formatINR(calculation.estimatedDailyIncome)} / day
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Monthly Potential</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22d3ee' }}>
                  ~{formatINR(calculation.estimatedMonthlyIncome)} / month
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Total Value At Maturity</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                  {formatINR(calculation.estimatedMaturityValue)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.04)', padding: '0.4rem 0.65rem', borderRadius: '8px' }}>
                <ShieldCheck size={16} color="#34d399" />
                <span>Principal refundable after {selectedLockin.months} month(s)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ flex: 1 }}
              disabled={isDowngradeAttempt || numAmount < 2000}
            >
              {activePlan ? (
                <>
                  <ArrowUpCircle size={18} /> Confirm & Upgrade Plan ({formatINR(numAmount)})
                </>
              ) : (
                <>
                  <Lock size={18} /> Confirm & Activate Plan ({formatINR(numAmount)})
                </>
              )}
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
