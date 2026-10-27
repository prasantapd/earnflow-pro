import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  PlusCircle, 
  Lock, 
  Unlock, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Calculator, 
  CheckCircle2, 
  Sparkles,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPOSIT_PRESETS, LOCKIN_PERIODS, calculateEarnings, formatINR } from '../utils/finance';
import PlanCard from '../components/PlanCard';

export default function PlansView({ onOpenDeposit, onWithdrawPrincipal }) {
  const { plans, subscribePlan, showToast } = useApp();

  const activePlan = (plans || []).find((p) => p.status === 'active');

  const defaultAmount = useMemo(() => {
    if (!activePlan) return 10000;
    const higher = DEPOSIT_PRESETS.find((amt) => amt > activePlan.amount);
    return higher || activePlan.amount + 5000;
  }, [activePlan]);

  // Inline simulator state
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState(defaultAmount.toString());
  const [selectedLockin, setSelectedLockin] = useState(LOCKIN_PERIODS[1]); // Default 3 Months
  const [planTitle, setPlanTitle] = useState('');

  const numAmount = Number(customAmount) || 0;
  const isDowngradeAttempt = activePlan && numAmount <= activePlan.amount;

  const calculation = useMemo(() => {
    const amount = Number(customAmount) || selectedAmount;
    return calculateEarnings(amount, selectedLockin.months, selectedLockin.tierFactor);
  }, [customAmount, selectedAmount, selectedLockin]);

  const handleQuickPreset = (amt) => {
    if (activePlan && amt <= activePlan.amount) {
      showToast(`Cannot downgrade to ₹${amt.toLocaleString()}. Your current active tier is ₹${activePlan.amount.toLocaleString()}.`, 'warning');
      return;
    }
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || amount < 2000) {
      showToast('Minimum membership deposit is ₹2,000', 'error');
      return;
    }

    if (activePlan && amount <= activePlan.amount) {
      showToast(`Downgrade not permitted. Select a plan higher than your current active plan (₹${activePlan.amount.toLocaleString()}).`, 'error');
      return;
    }

    subscribePlan({
      amount,
      lockinPeriod: selectedLockin,
      title: planTitle.trim() || `${selectedLockin.label} Membership Tier`,
    });
    setPlanTitle('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-emerald">Membership Tiers</span>
          <span className="badge badge-indigo">1 Active Plan Limit</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Membership Tiers & Earning Plans</h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '750px' }}>
          Choose your active membership tier (₹2,000 up to ₹50,000). Each account can maintain <strong>1 active plan at a time</strong>. You can upgrade to a higher tier anytime to unlock higher estimated daily task earnings, but downgrading is not permitted. Principal is eligible for withdrawal upon lock-in maturity.
        </p>
      </div>

      {/* Active Plan Notification Card */}
      {activePlan && (
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            marginBottom: '2rem', 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Lock size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Active Plan</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>1 Plan Maximum Allowed</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                {activePlan.title} — {formatINR(activePlan.amount)} ({activePlan.months}M Tier)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Estimated Daily Quota: <strong>~{formatINR(activePlan.dailyQuota)}/day</strong> • To earn more, upgrade to a higher tier below.
              </p>
            </div>
          </div>

          <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
            <ArrowUpCircle size={14} /> Upgrades Permitted
          </span>
        </div>
      )}

      {/* Interactive Simulator & Subscription Terminal */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 50%, rgba(15, 23, 42, 0.95) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Calculator size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {activePlan ? 'Membership Tier Upgrade Terminal' : 'Interactive Plan Simulator & Terminal'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {activePlan 
                ? `Current tier: ${formatINR(activePlan.amount)}. Select a higher amount to upgrade.` 
                : 'Select your subscription amount and duration to preview estimated task income.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleDepositSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Left Column: Amount & Lock-in Selection */}
            <div>
              {/* Presets */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="form-label">
                  <span>Select Subscription Tier (₹)</span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981' }}>
                    {activePlan ? 'Upgrades Only' : 'Presets'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                        onClick={() => handleQuickPreset(amt)}
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
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(Number(e.target.value) || 0);
                    }}
                    placeholder={activePlan ? `Enter upgrade amount (min ₹${(activePlan.amount + 500).toLocaleString()})` : "Enter amount (min ₹2,000)"}
                  />
                </div>

                {isDowngradeAttempt && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={13} />
                    <span>Downgrading is prohibited. You can only upgrade to a tier higher than your active plan (₹{activePlan.amount.toLocaleString()}).</span>
                  </div>
                )}
              </div>

              {/* Lock-in Period Cards */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="form-label">
                  <span>Select Lock-in Duration</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Duration Tier</span>
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
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? period.color : '#f1f5f9' }}>
                            {period.label}
                          </span>
                          <span className="badge" style={{ background: `${period.color}25`, color: period.color, fontSize: '0.62rem' }}>
                            {period.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {period.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Title (Optional) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <span>Custom Plan Name (Optional)</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={`e.g. My ${selectedLockin.label} Growth Plan`}
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Live Projected Returns Card */}
            <div 
              className="glass-card" 
              style={{ 
                padding: '1.5rem', 
                background: 'rgba(15, 23, 42, 0.7)',
                borderColor: 'rgba(16, 185, 129, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                    Estimated Task Earning Projection
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    Task Performance Model
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subscription Principal</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                      {formatINR(calculation.principal)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Total Task Income</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                      +{formatINR(calculation.estimatedTotalIncome)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Daily Task Quota</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbbf24' }}>
                      ~{formatINR(calculation.estimatedDailyIncome)} / day
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Monthly Potential</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#22d3ee' }}>
                      ~{formatINR(calculation.estimatedMonthlyIncome)} / month
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Total Value at Maturity (Principal + Income)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                    {formatINR(calculation.estimatedMaturityValue)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span>Original deposit {formatINR(calculation.principal)} eligible for full withdrawal after {selectedLockin.months} month(s)</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }}
                disabled={isDowngradeAttempt || numAmount < 2000}
              >
                {activePlan ? (
                  <>
                    <ArrowUpCircle size={18} /> Confirm & Upgrade to This Plan ({formatINR(numAmount)})
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Confirm & Activate This Plan ({formatINR(numAmount)})
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Membership Tiers Overview Table (NO % RETURN NOTATION) */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Membership Duration Tiers Overview
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          Longer duration commitments unlock higher estimated daily task earning allocations.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Duration Tier</th>
                <th style={{ padding: '0.75rem' }}>Tier Classification</th>
                <th style={{ padding: '0.75rem' }}>Estimated Daily Task Quota</th>
                <th style={{ padding: '0.75rem' }}>Estimated Monthly Potential</th>
                <th style={{ padding: '0.75rem' }}>Sample Total on ₹10,000 Tier</th>
                <th style={{ padding: '0.75rem' }}>Capital Status</th>
              </tr>
            </thead>
            <tbody>
              {LOCKIN_PERIODS.map((p) => {
                const sampleCalc = calculateEarnings(10000, p.months, p.tierFactor);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: p.color }}>
                      {p.label}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className="badge" style={{ background: `${p.color}25`, color: p.color }}>
                        {p.badge}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                      ~{formatINR(sampleCalc.estimatedDailyIncome)} / day (on ₹10K)
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#22d3ee', fontWeight: 600 }}>
                      ~{formatINR(sampleCalc.estimatedMonthlyIncome)} / month
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#34d399' }}>
                      +{formatINR(sampleCalc.estimatedTotalIncome)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        Refundable at Maturity
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscribed Plans Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Account Membership History</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Your current active plan and previously matured or upgraded tiers
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenDeposit}>
            <PlusCircle size={15} /> {activePlan ? 'Upgrade Plan' : 'New Plan'}
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>No membership plans active yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {plans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onWithdrawPrincipal={onWithdrawPrincipal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
