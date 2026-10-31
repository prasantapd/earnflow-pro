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
  AlertTriangle,
  Clock,
  QrCode,
  Copy,
  Check,
  Building2,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { DEPOSIT_PRESETS, LOCKIN_PERIODS, TRIAL_PLAN, calculateEarnings, formatINR } from '../utils/finance';
import PlanCard from '../components/PlanCard';
import { useApp } from '../context/AppContext';

export default function PlansView({ onOpenDeposit, onWithdrawPrincipal }) {
  const { 
    plans, 
    activePlan: contextActivePlan, 
    subscribePlan, 
    showToast, 
    pendingDeposit, 
    pendingPlan, 
    isUserActivated, 
    canUserEarn, 
    paymentSettings,
    hasUsedTrialPlan,
    hasUsedTrialWithdrawal,
    freeTrialStatus,
    t
  } = useApp();

  const activePlan = contextActivePlan !== undefined ? contextActivePlan : (plans || []).find((p) => p.status === 'active');

  const defaultAmount = useMemo(() => {
    if (!activePlan) return 2000;
    const higher = DEPOSIT_PRESETS.find((amt) => amt > activePlan.amount);
    return higher || activePlan.amount + 5000;
  }, [activePlan]);

  // Step 1 (Plan Selection) vs Step 2 (UPI Payment Gateway & UTR Entry)
  const [step, setStep] = useState(1);
  const [activePaymentTab, setActivePaymentTab] = useState('upi'); // 'upi' or 'bank'
  const [userUtr, setUserUtr] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Inline simulator state
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState(defaultAmount.toString());
  const [selectedLockin, setSelectedLockin] = useState(LOCKIN_PERIODS[1]); // Default 90 Days
  const [planTitle, setPlanTitle] = useState('');

  // Fallback payment settings
  const settings = paymentSettings || {
    upiId: 'taskcoin@ybl',
    upiPhone: '9876543210',
    upiName: 'TaskCoin Corporate Treasury',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200089123456',
    ifsc: 'HDFC0000123',
    accountHolder: 'TaskCoin Technologies Pvt Ltd',
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Automatically keep simulator in sync whenever activePlan or defaultAmount changes
  React.useEffect(() => {
    setSelectedAmount(defaultAmount);
    setCustomAmount(defaultAmount.toString());
  }, [defaultAmount]);

  const numAmount = Number(customAmount) || 0;
  const isDowngradeAttempt = Boolean(activePlan && numAmount <= activePlan.amount);

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

  // Step 1 Submit -> Transitions directly to Step 2 (UPI Payment Gateway & UTR Entry)
  const handleProceedToPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const amount = Number(customAmount);
    const isTrialSelected = selectedLockin.id === 'trial_3d' || amount === 300;

    if (isTrialSelected) {
      if (hasUsedTrialPlan) {
        showToast('The ₹300 3-Day Trial Plan is limited to once per mobile number. This number has already availed the trial.', 'error');
        return;
      }
    } else {
      if (!amount || amount < 2000) {
        showToast('Minimum membership deposit for regular plans is ₹2,000 (or select ₹300 3-Day Trial)', 'error');
        return;
      }
    }

    if (activePlan && amount <= activePlan.amount) {
      showToast(`Downgrade not permitted. Select a plan higher than your current active plan (₹${activePlan.amount.toLocaleString()}).`, 'error');
      return;
    }

    setStep(2);
    const terminalEl = document.getElementById('subscription-terminal');
    if (terminalEl) {
      terminalEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Step 2 Submit -> Submits UTR for Admin Verification
  const handleFinalUtrSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanUtr = (userUtr || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      showToast('Please enter the 12-digit UTR / UPI Reference Number from your payment receipt.', 'error');
      return;
    }

    if (pendingDeposit && pendingDeposit.status === 'PENDING') {
      showToast(`You already have a pending payment of ₹${pendingDeposit.amount?.toLocaleString()} (UTR: ${pendingDeposit.utr}). Multiple payments are strictly prohibited until Admin verifies your current deposit.`, 'error');
      return;
    }

    const amount = Number(customAmount);
    const isTrialSelected = selectedLockin.id === 'trial_3d' || amount === 300;

    subscribePlan({
      amount,
      lockinPeriod: selectedLockin,
      title: planTitle.trim() || (isTrialSelected ? '⚡ 3-Day Special Trial Pass' : `${selectedLockin.label} Membership Tier`),
      utrNumber: cleanUtr,
      isTrial: isTrialSelected,
    });

    setUserUtr('');
    setStep(1);
    setPlanTitle('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-emerald">{t ? t('nav_plans') : 'Membership Tiers'}</span>
          <span className="badge badge-indigo">1 Active Plan Limit</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t ? t('plan_title') : 'Membership Duration Tiers Overview'}</h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '750px' }}>
          {t ? t('plan_subtitle') : 'Choose your active membership tier (₹2,000 up to ₹50,000). Each account can maintain 1 active plan at a time. You can upgrade to a higher tier anytime to unlock higher estimated daily task earnings, but downgrading is not permitted. Principal is eligible for withdrawal upon lock-in maturity.'}
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
                {activePlan.title} — {formatINR(activePlan.amount)} ({activePlan.days || activePlan.months * 30} Days Tier)
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

      {/* Pending Deposit / Activation Notice */}
      {pendingDeposit && !activePlan && (
        <div
          className="glass-card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(234, 88, 12, 0.1) 100%)',
            borderColor: 'rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>⏳ Payment Verification Pending</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Deposit #{pendingDeposit.id}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Deposit of {formatINR(pendingDeposit.amount)} Submitted (UTR: {pendingDeposit.utr || 'Under Review'})
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                Admin is verifying your payment. Once approved by the administrator, your account and membership tier will be activated immediately to unlock all daily tasks & earnings!
              </p>
            </div>
          </div>

          <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
            Awaiting Admin Approval
          </span>
        </div>
      )}

      {/* 3-DAY TRIAL SPECIAL CARD (₹300 - ONCE PER MOBILE NUMBER) */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.16) 0%, rgba(168, 85, 247, 0.14) 50%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1.5px solid rgba(236, 72, 153, 0.5)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(236, 72, 153, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: '#ec4899', color: '#ffffff', fontWeight: 800 }}>
                ⚡ New User Exclusive Trial
              </span>
              <span className="badge badge-gold">1× Per Mobile Number</span>
              <span className="badge badge-emerald">Zero Min. Withdrawal</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fdf2f8', marginBottom: '0.35rem' }}>
              3-Day Fast-Track Trial Plan — ₹300
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#fbcfe8', lineHeight: 1.5, marginBottom: '0.85rem' }}>
              Test everything with zero risk! Enjoy <strong>identical task rewards and daily login streak as the ₹2,000 plan</strong> for 3 days. Plus, trial members have <strong>NO minimum withdrawal threshold</strong> — withdraw whatever you want directly to your UPI (allowed once in a lifetime)!
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="#34d399" /> <span>3 Days Full Earning Pass</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="#34d399" /> <span>1.0× ₹2,000 Plan Reward Rates</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} color="#34d399" /> <span>No Minimum Withdrawal Limit (1× Lifetime)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '180px' }}>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ec4899', marginBottom: '0.5rem' }}>
              ₹300 <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>/ 3 Days</span>
            </div>
            {hasUsedTrialPlan ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled
                style={{ opacity: 0.65, cursor: 'not-allowed', fontSize: '0.82rem', padding: '0.55rem 1rem' }}
              >
                <Lock size={15} /> Already Availed (1 per Mobile)
              </button>
            ) : activePlan ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled
                style={{ opacity: 0.65, cursor: 'not-allowed', fontSize: '0.82rem', padding: '0.55rem 1rem' }}
              >
                <Check size={15} /> Active Membership Held
              </button>
            ) : pendingDeposit && pendingDeposit.status === 'PENDING' ? (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                disabled
                style={{
                  opacity: 0.7,
                  cursor: 'not-allowed',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '0.65rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24'
                }}
              >
                <Clock size={16} /> Verification In Progress
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-gold btn-lg"
                onClick={() => {
                  setSelectedLockin(TRIAL_PLAN);
                  setSelectedAmount(300);
                  setCustomAmount('300');
                  setPlanTitle('3-Day Special Trial Pass');
                  setStep(2);
                  const el = document.getElementById('subscription-terminal');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderColor: '#f472b6',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '0.65rem 1.3rem',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                }}
              >
                <Sparkles size={16} /> Activate ₹300 Trial Pass →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Simulator & Subscription Terminal */}
      <div
        id="subscription-terminal"
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 50%, rgba(15, 23, 42, 0.95) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}
      >
        {/* STEP 1: PLAN & DURATION SELECTION */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
                Step 1 of 2: Select Plan
              </span>
            </div>

            <form onSubmit={handleProceedToPayment}>
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
                    const isCurrentActive = Boolean(activePlan && activePlan.amount === amt);
                    const isLowerThanActive = Boolean(activePlan && amt < activePlan.amount);
                    const isDisabled = Boolean(isCurrentActive || isLowerThanActive);

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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                  {/* Special 3-Day Trial Card */}
                  <div
                    onClick={() => {
                      if (hasUsedTrialPlan) {
                        showToast('The ₹300 3-Day Trial Plan is limited to once per mobile number.', 'warning');
                        return;
                      }
                      setSelectedLockin(TRIAL_PLAN);
                      setSelectedAmount(300);
                      setCustomAmount('300');
                    }}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: selectedLockin.id === 'trial_3d' ? 'rgba(236, 72, 153, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${selectedLockin.id === 'trial_3d' ? '#ec4899' : 'var(--border-subtle)'}`,
                      cursor: hasUsedTrialPlan ? 'not-allowed' : 'pointer',
                      opacity: hasUsedTrialPlan ? 0.5 : 1,
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: selectedLockin.id === 'trial_3d' ? '#ec4899' : '#f1f5f9' }}>
                        3 Days (₹300 Trial)
                      </span>
                      <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.25)', color: '#f472b6', fontSize: '0.62rem' }}>
                        {hasUsedTrialPlan ? 'Availed' : '1× per mobile'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      3-day trial pass. ₹2,000 base rate rewards + 1 flexible lifetime withdrawal!
                    </div>
                  </div>

                  {LOCKIN_PERIODS.map((period) => {
                    const isSelected = selectedLockin.id === period.id;
                    return (
                      <div
                        key={period.id}
                        onClick={() => {
                          setSelectedLockin(period);
                          if (selectedAmount < 2000) {
                            setSelectedAmount(2000);
                            setCustomAmount('2000');
                          }
                        }}
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
                  <span>{t ? t('plan_custom_name') : 'Custom Plan Name (Optional)'}</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t ? t('plan_custom_name_placeholder') : `e.g. My ${selectedLockin.label} Growth Plan`}
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
                    {t ? t('plan_projection_title') : 'Estimated Task Earning Projection'}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                    {t ? t('plan_model_badge') : 'TASK PERFORMANCE MODEL'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t ? t('plan_principal') : 'Subscription Principal'}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                      {formatINR(calculation.principal)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t ? t('plan_total_income') : 'Estimated Total Task Income'}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                      +{formatINR(calculation.estimatedTotalIncome)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t ? t('plan_daily_quota') : 'Estimated Daily Task Quota'}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbbf24' }}>
                      ~{formatINR(calculation.estimatedDailyIncome)} / day
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t ? t('plan_potential_days', { days: 30 }) : 'Estimated 30 Days Potential'}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#22d3ee' }}>
                      ~{formatINR(calculation.estimatedMonthlyIncome)} / 30 days
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t ? t('plan_maturity_value') : 'Estimated Total Value at Maturity (Principal + Income)'}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                    {formatINR(calculation.estimatedMaturityValue)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span>{t ? t('plan_withdrawal_notice', { amount: calculation.principal.toLocaleString(), days: selectedLockin.days || selectedLockin.months * 30 }) : `Original deposit ${formatINR(calculation.principal)} eligible for full withdrawal after ${selectedLockin.days || selectedLockin.months * 30} days`}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={Boolean(pendingDeposit && pendingDeposit.status === 'PENDING') || isDowngradeAttempt || (selectedLockin.id !== 'trial_3d' && numAmount < 2000 && numAmount !== 300)}
              >
                {pendingDeposit && pendingDeposit.status === 'PENDING' ? (
                  <>
                    <Clock size={18} /> {t ? t('plan_pending_verification', { utr: pendingDeposit.utr }) : `Payment Verification Pending (UTR: ${pendingDeposit.utr})`}
                  </>
                ) : activePlan ? (
                  <>
                    <ArrowRight size={18} /> {t ? t('action_upgrade') : 'Proceed to Upgrade Payment'} ({formatINR(numAmount)})
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} /> {t ? t('plan_proceed_payment') : `Confirm Plan & Proceed to UPI Payment (${formatINR(numAmount)})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    )}

    {/* STEP 2: UPI PAYMENT GATEWAY & 12-DIGIT UTR SUBMISSION */}
    {step === 2 && (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem' }}
            >
              <ArrowLeft size={16} /> {t ? t('plan_back_step') : 'Back / Change Plan'}
            </button>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                {t ? t('plan_payment_gateway_title') : 'UPI Deposit Gateway & UTR Verification'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {t ? t('plan_payment_gateway_desc') : `Pay ₹${numAmount.toLocaleString()} via UPI or Bank, then submit the 12-digit UTR for Admin activation`}
              </p>
            </div>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
            Step 2 of 2: Payment & UTR
          </span>
        </div>

        {/* Plan Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Selected Membership Plan</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              {selectedLockin.label} Duration Tier
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Exact Payable Amount</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
              ₹{numAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Estimated Daily Quota</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#22d3ee' }}>
              ~{formatINR(calculation.estimatedDailyIncome)}/day
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Refundable Capital</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a78bfa' }}>
              {formatINR(calculation.principal)} at maturity
            </div>
          </div>
        </div>

        {/* Payment Method Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActivePaymentTab('upi')}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: activePaymentTab === 'upi' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: `1.5px solid ${activePaymentTab === 'upi' ? '#10b981' : 'var(--border-subtle)'}`,
              color: activePaymentTab === 'upi' ? '#34d399' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Smartphone size={18} />
            <span>UPI Transfer & QR Code (Instant)</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePaymentTab('bank')}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: activePaymentTab === 'bank' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(99, 102, 241, 0.2) 100%)' : 'rgba(255, 255, 255, 0.03)',
              border: `1.5px solid ${activePaymentTab === 'bank' ? '#60a5fa' : 'var(--border-subtle)'}`,
              color: activePaymentTab === 'bank' ? '#93c5fd' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Building2 size={18} />
            <span>Direct Bank Transfer (IMPS/NEFT)</span>
          </button>
        </div>

        {/* TAB 1: UPI Transfer */}
        {activePaymentTab === 'upi' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', marginBottom: '2rem', alignItems: 'center' }}>
            {/* QR Code Container */}
            <div style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '0.75rem', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${encodeURIComponent(settings.upiId)}%26pn=${encodeURIComponent(settings.upiName || 'TaskCoin Corporate Treasury')}%26am=${numAmount}%26cu=INR`}
                  alt="UPI QR Code"
                  style={{ width: 190, height: 190, display: 'block' }}
                />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>
                Scan to Pay ₹{numAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                PhonePe • Google Pay • Paytm • BHIM • Cred
              </div>
            </div>

            {/* UPI Details & Instructions */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <div className="form-label">Official Treasury UPI ID</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    readOnly
                    value={settings.upiId}
                    className="input-field"
                    style={{ fontWeight: 800, color: '#34d399', fontSize: '1.05rem', background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCopy(settings.upiId, 'UPI ID')}
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {copiedField === 'UPI ID' ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                    <span>{copiedField === 'UPI ID' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Payee Name</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{settings.upiName || 'TaskCoin Treasury'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Payment Verification</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>5–15 Mins Approval</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                <strong>Payment Instructions:</strong><br />
                1. Open any UPI App and pay exact amount <strong>₹{numAmount.toLocaleString()}</strong>.<br />
                2. Note the 12-digit UTR/UPI Reference Number from your receipt.<br />
                3. Paste the 12-digit UTR below and click Submit for Admin activation.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Direct Bank Transfer */}
        {activePaymentTab === 'bank' && (
          <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bank Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{settings.bankName || 'HDFC Bank Ltd'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Account Number</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#60a5fa' }}>{settings.accountNumber || '50200089123456'}</span>
                  <button type="button" onClick={() => handleCopy(settings.accountNumber || '50200089123456', 'Account Number')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {copiedField === 'Account Number' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IFSC Code</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{settings.ifsc || 'HDFC0000123'}</span>
                  <button type="button" onClick={() => handleCopy(settings.ifsc || 'HDFC0000123', 'IFSC')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {copiedField === 'IFSC' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Account Holder</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{settings.accountHolder || 'TaskCoin Technologies Pvt Ltd'}</div>
              </div>
            </div>
          </div>
        )}

        {/* UTR Input Form & Submission */}
        <div
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <FileText size={20} color="#34d399" />
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              {t ? t('plan_enter_utr') : 'Submit 12-Digit UTR / UPI Reference Number'}
            </h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            After transferring ₹{numAmount.toLocaleString()} in PhonePe, Google Pay, or Paytm, copy the 12-digit UTR/Ref No. from the receipt and enter below.
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <input
              type="text"
              maxLength={24}
              value={userUtr}
              onChange={(e) => setUserUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
              placeholder={t ? t('plan_utr_placeholder') : 'Paste 12-digit UTR No. here (e.g. 565656565656)'}
              className="input-field"
              style={{
                fontSize: '1.2rem',
                letterSpacing: '1px',
                fontWeight: 800,
                borderColor: userUtr.trim().length >= 6 ? '#10b981' : undefined,
                padding: '0.85rem 1.25rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#fbbf24', marginBottom: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <AlertTriangle size={15} />
            <span>Admin verifies this UTR before activating your account. Fake UTR submissions will be rejected immediately.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> {t ? t('plan_back_step') : 'Back / Change Plan'}
            </button>

            <button
              type="button"
              onClick={handleFinalUtrSubmit}
              className="btn btn-emerald btn-lg"
              disabled={!userUtr.trim() || userUtr.trim().length < 6}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 800,
                opacity: (!userUtr.trim() || userUtr.trim().length < 6) ? 0.5 : 1,
                cursor: (!userUtr.trim() || userUtr.trim().length < 6) ? 'not-allowed' : 'pointer',
              }}
            >
              <CheckCircle2 size={20} />
              <span>{t ? t('plan_submit_verification') : `Submit Payment Verification (₹${numAmount.toLocaleString()})`}</span>
            </button>
          </div>
        </div>
      </div>
    )}
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
                <th style={{ padding: '0.75rem' }}>Estimated 30 Days Potential</th>
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
                      ~{formatINR(sampleCalc.estimatedMonthlyIncome)} / 30 days
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
