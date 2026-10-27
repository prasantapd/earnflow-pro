import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PayoutDetailsModal({ isOpen, onClose, onSaved }) {
  const { payoutMethod, savePayoutMethod, user, showToast } = useApp();
  const [activeType, setActiveType] = useState(payoutMethod?.type || 'upi_id');

  // Form states
  const [upiId, setUpiId] = useState(payoutMethod?.upiId || '');
  const [upiPhone, setUpiPhone] = useState(payoutMethod?.upiPhone || user?.phone || '');
  const [upiApp, setUpiApp] = useState(payoutMethod?.upiApp || 'Google Pay / Paytm');

  // Bank states
  const [holderName, setHolderName] = useState(payoutMethod?.holderName || user?.name || '');
  const [bankName, setBankName] = useState(payoutMethod?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(payoutMethod?.accountNumber || '');
  const [confirmAccount, setConfirmAccount] = useState(payoutMethod?.accountNumber || '');
  const [ifsc, setIfsc] = useState(payoutMethod?.ifsc || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeType === 'upi_id') {
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. user@okhdfcbank)', 'error');
        return;
      }
      savePayoutMethod({
        type: 'upi_id',
        upiId: upiId.trim(),
        holderName: user?.name,
      });
    } else if (activeType === 'upi_phone') {
      if (!upiPhone.trim() || upiPhone.length < 10) {
        showToast('Please enter a valid 10-digit UPI Phone Number', 'error');
        return;
      }
      savePayoutMethod({
        type: 'upi_phone',
        upiPhone: upiPhone.trim(),
        upiApp: upiApp,
        holderName: user?.name,
      });
    } else if (activeType === 'bank') {
      if (!holderName.trim() || !bankName.trim() || !accountNumber.trim() || !ifsc.trim()) {
        showToast('Please fill in all bank account details', 'error');
        return;
      }
      if (accountNumber !== confirmAccount) {
        showToast('Bank account numbers do not match', 'error');
        return;
      }
      if (ifsc.trim().length !== 11) {
        showToast('IFSC Code must be exactly 11 characters (e.g. HDFC0001234)', 'error');
        return;
      }
      savePayoutMethod({
        type: 'bank',
        holderName: holderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
              <CreditCard size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Payout Withdrawal Method</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Setup where your Sunday rewards and matured principal are deposited
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Method Type Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveType('upi_id')}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: activeType === 'upi_id' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1.5px solid ${activeType === 'upi_id' ? 'var(--cyan-500)' : 'var(--border-subtle)'}`,
              color: activeType === 'upi_id' ? '#22d3ee' : '#cbd5e1',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)'
            }}
          >
            <Smartphone size={18} />
            <span>UPI VPA ID</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('upi_phone')}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: activeType === 'upi_phone' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1.5px solid ${activeType === 'upi_phone' ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
              color: activeType === 'upi_phone' ? '#34d399' : '#cbd5e1',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)'
            }}
          >
            <Smartphone size={18} />
            <span>UPI Phone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('bank')}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              background: activeType === 'bank' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1.5px solid ${activeType === 'bank' ? 'var(--indigo-500)' : 'var(--border-subtle)'}`,
              color: activeType === 'bank' ? '#a5b4fc' : '#cbd5e1',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)'
            }}
          >
            <Building2 size={18} />
            <span>Bank Account</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TAB 1: UPI ID */}
          {activeType === 'upi_id' && (
            <div>
              <div className="form-group">
                <label className="form-label">
                  <span>Enter UPI ID / VPA</span>
                  <span style={{ fontSize: '0.72rem', color: '#22d3ee' }}>Instant Transfers</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. yourname@okhdfcbank or phone@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              </div>

              {/* Quick UPI provider chips */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl', '@ibl'].map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      const prefix = upiId.split('@')[0] || user?.name?.toLowerCase().replace(/\s+/g, '') || 'investor';
                      setUpiId(`${prefix}${handle}`);
                    }}
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: UPI Phone Number */}
          {activeType === 'upi_phone' && (
            <div>
              <div className="form-group">
                <label className="form-label">
                  <span>UPI Registered Mobile Number</span>
                  <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Linked to BHIM / GPay / Paytm</span>
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={upiPhone}
                  onChange={(e) => setUpiPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Preferred UPI App</span>
                </label>
                <select
                  className="input-field"
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value)}
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm UPI">Paytm UPI</option>
                  <option value="BHIM UPI">BHIM UPI</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Bank Account */}
          {activeType === 'bank' && (
            <div>
              <div className="form-group">
                <label className="form-label">
                  <span>Account Beneficiary Name</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Name as per bank records"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Bank Name</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>Account Number</span>
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Confirm Account</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Re-enter Number"
                    value={confirmAccount}
                    onChange={(e) => setConfirmAccount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>IFSC Code</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>11 Characters</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  className="input-field"
                  placeholder="e.g. HDFC0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  required
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>
            </div>
          )}

          {/* Security Guarantee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            <ShieldCheck size={18} color="#34d399" />
            <span>Bank-grade 256-bit encryption. Payouts are dispatched automatically via NPCI / IMPS.</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <CheckCircle2 size={16} /> Save & Verify Payout Method
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
