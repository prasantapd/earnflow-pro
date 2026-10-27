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
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  Building2,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEPOSIT_PRESETS, LOCKIN_PERIODS, calculateEarnings, formatINR } from '../utils/finance';

export default function DepositCalculatorModal({ isOpen, onClose }) {
  const { subscribePlan, plans, showToast, paymentSettings } = useApp();

  // Find user's current active plan
  const activePlan = (plans || []).find((p) => p.status === 'active');
  const minAllowedUpgrade = activePlan ? activePlan.amount + 1000 : 2000;

  // Default to the first preset higher than active plan, or 10000
  const defaultAmount = useMemo(() => {
    if (!activePlan) return 10000;
    const higher = DEPOSIT_PRESETS.find((amt) => amt > activePlan.amount);
    return higher || activePlan.amount + 5000;
  }, [activePlan]);

  const [step, setStep] = useState(1); // 1 = Plan Selection, 2 = Payment & UTR Submission
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount);
  const [customAmount, setCustomAmount] = useState(defaultAmount.toString());
  const [selectedLockin, setSelectedLockin] = useState(LOCKIN_PERIODS[0]); // Default 30 Days
  const [planTitle, setPlanTitle] = useState('');
  
  // Payment Step state
  const [activePaymentTab, setActivePaymentTab] = useState('upi'); // 'upi' or 'bank'
  const [userUtr, setUserUtr] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Fallback payment settings
  const settings = paymentSettings || {
    upiId: 'earnflowpro@icici',
    upiPayeeName: 'EarnFlow Pro Treasury',
    bankName: 'HDFC Bank',
    accountName: 'EarnFlow Yield Private Limited',
    accountNumber: '50200098412849',
    ifscCode: 'HDFC0001234',
    branch: 'BKC Corporate Financial Centre, Mumbai',
    qrCodeUrl: '',
    instructions: '1. Pay the exact membership plan amount via Google Pay, PhonePe, Paytm, or Net Banking.\n2. Note down the 12-digit UTR/UPI Ref number.\n3. Paste the UTR below and click Submit.\n4. Admin treasury verifies your deposit within 5–15 minutes.',
  };

  // Calculate live task income projection
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

  const handleProceedToPayment = (e) => {
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

    setStep(2);
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFillDemoUtr = () => {
    const demoUtr = `UTR${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    setUserUtr(demoUtr);
    showToast('Demo 12-digit UTR generated!', 'info');
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    
    if (!userUtr.trim()) {
      showToast('Please enter the 12-digit UTR / UPI Reference Number from your payment receipt.', 'error');
      return;
    }

    const success = subscribePlan({
      amount,
      lockinPeriod: selectedLockin,
      title: planTitle.trim() || `${selectedLockin.label} Membership Tier`,
      utrNumber: userUtr.trim(),
    });

    if (success !== false) {
      onClose();
      setStep(1);
      setUserUtr('');
    }
  };

  // Generate dynamic QR Code URL with the user's exact amount prefilled in the UPI URI
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${encodeURIComponent(settings.upiId)}%26pn=${encodeURIComponent(settings.upiPayeeName)}%26am=${numAmount}%26cu=INR`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 680, padding: '2rem' }}
      >
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Coins size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {step === 1 
                    ? (activePlan ? 'Upgrade Membership Plan' : 'Select Membership Tier')
                    : 'Admin Deposit Gateway & UTR Verification'}
                </h2>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  Step {step} of 2
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                {step === 1 
                  ? 'Select subscription amount & 30–360 days duration tier' 
                  : `Transfer ₹${numAmount.toLocaleString()} to Admin account & submit 12-digit UTR`}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: PLAN & DURATION SELECTION */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment}>
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
                  <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                    Current Active Plan (1 Plan Limit)
                  </div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                    {activePlan.title} — {formatINR(activePlan.amount)} ({activePlan.days || activePlan.months * 30} Days Tier)
                  </div>
                </div>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                  Upgrades Only
                </span>
              </div>
            ) : (
              <div 
                style={{ 
                  padding: '0.65rem 1rem', 
                  marginBottom: '1.25rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(16, 185, 129, 0.08)', 
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.78rem',
                  color: '#cbd5e1'
                }}
              >
                ℹ️ <strong>Single Plan Rule:</strong> Each user can maintain 1 active membership plan at a time. Upgrades to higher tiers are permitted anytime.
              </div>
            )}

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
                    borderColor: isDowngradeAttempt ? '#f87171' : undefined
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

            {/* Step 2: Lock-in Period (30 Days to 360 Days) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-label">
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>2. Select Lock-in Duration</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>30 Days to 360 Days</span>
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

            {/* Dynamic Task Earning Projection Card */}
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
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated 30 Days Potential</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22d3ee' }}>
                    ~{formatINR(calculation.estimatedMonthlyIncome)} / 30 days
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
                  <span>Principal refundable after {selectedLockin.days || selectedLockin.months * 30} days</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                disabled={isDowngradeAttempt || numAmount < 2000}
              >
                <span>Proceed to Payment Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT INSTRUCTIONS, QR CODE & UTR SUBMISSION */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            {/* Payment Summary Header */}
            <div 
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.12) 100%)',
                border: '1.5px solid var(--emerald-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Selected Plan: {selectedLockin.label} Tier
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399' }}>
                  Pay Exactly: {formatINR(numAmount)}
                </div>
              </div>

              <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                Instant Verification Mode
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setActivePaymentTab('upi')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: activePaymentTab === 'upi' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${activePaymentTab === 'upi' ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: activePaymentTab === 'upi' ? '#34d399' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem'
                }}
              >
                <Smartphone size={16} /> UPI & QR Code Scan
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentTab('bank')}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: activePaymentTab === 'bank' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${activePaymentTab === 'bank' ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: activePaymentTab === 'bank' ? '#22d3ee' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem'
                }}
              >
                <Building2 size={16} /> Direct Bank Transfer (NEFT/IMPS)
              </button>
            </div>

            {/* TAB CONTENT 1: UPI & QR CODE */}
            {activePaymentTab === 'upi' && (
              <div 
                className="glass-card" 
                style={{ 
                  padding: '1.25rem', 
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                {/* QR Code Container */}
                <div style={{ textAlign: 'center', margin: '0 auto' }}>
                  <div 
                    style={{ 
                      padding: '8px', 
                      background: '#ffffff', 
                      borderRadius: '12px', 
                      display: 'inline-block',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <img 
                      src={dynamicQrUrl} 
                      alt="Admin Deposit UPI QR Code" 
                      style={{ width: 140, height: 140, display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    Scan with GPay, PhonePe, Paytm
                  </div>
                </div>

                {/* UPI Details */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Admin Official UPI ID</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#34d399' }}>
                        {settings.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.upiId, 'UPI ID')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        {copiedField === 'UPI ID' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                        <span>{copiedField === 'UPI ID' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Payee Name</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                      {settings.upiPayeeName}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                    ⚡ Supported Apps: Google Pay, PhonePe, Paytm, BHIM, Cred, AmazonPay
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DIRECT BANK TRANSFER */}
            {activePaymentTab === 'bank' && (
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bank Name</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                      {settings.bankName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Account Holder Name</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                      {settings.accountName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Account Number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#22d3ee', fontSize: '0.95rem' }}>
                        {settings.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.accountNumber, 'Account Number')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem' }}
                      >
                        {copiedField === 'Account Number' ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IFSC Code</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#22d3ee', fontSize: '0.95rem' }}>
                        {settings.ifscCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.ifscCode, 'IFSC Code')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem' }}
                      >
                        {copiedField === 'IFSC Code' ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Branch</div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {settings.branch}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Deposit Instructions Notice */}
            <div 
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-sm)', 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1px solid rgba(245, 158, 11, 0.25)',
                marginBottom: '1.25rem',
                fontSize: '0.78rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}
            >
              <div style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <FileText size={14} /> Deposit Instructions:
              </div>
              {settings.instructions}
            </div>

            {/* UTR Input Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 800, color: '#f8fafc' }}>
                    3. Enter 12-Digit UTR / UPI Reference No. *
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleFillDemoUtr}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                  title="Generate a demo UTR for instant sandbox testing"
                >
                  ⚡ Demo UTR
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. 428910291024 or UTR7781928"
                  value={userUtr}
                  onChange={(e) => setUserUtr(e.target.value)}
                  className="input-field"
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    letterSpacing: '1px',
                    borderColor: userUtr.trim() ? '#10b981' : 'var(--border-subtle)'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                Find this 12-digit number in your GPay / PhonePe / Paytm / Bank payment confirmation receipt.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                disabled={!userUtr.trim()}
              >
                <CheckCircle size={17} />
                <span>Submit Deposit Request ({formatINR(numAmount)})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
