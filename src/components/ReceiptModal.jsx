import React from 'react';
import { X, CheckCircle, Download } from 'lucide-react';
import { formatINR, formatDate } from '../utils/finance';
import { useApp } from '../context/AppContext';

export default function ReceiptModal({ isOpen, onClose, txn }) {
  const { t } = useApp();
  if (!isOpen || !txn) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, textAlign: 'center' }}>
        <button 
          className="modal-close" 
          onClick={onClose}
          style={{ position: 'absolute', right: '1.25rem', top: '1.25rem' }}
        >
          <X size={18} />
        </button>

        {/* Success Icon */}
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem auto 1rem', color: '#34d399' }}>
          <CheckCircle size={38} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {t ? t('receipt_title') : 'Official Payment Receipt'}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          {t ? t('receipt_subtitle') : 'Verified Cryptographic Transaction Record'}
        </p>

        {/* Amount Box */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            background: txn.status === 'REJECTED' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)' : txn.status === 'PENDING' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            borderColor: txn.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.4)' : txn.status === 'PENDING' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {txn.type === 'DEPOSIT' ? 'Deposit Amount' : (t ? t('withdrawal_gross') : 'Amount Transferred')}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: txn.status === 'REJECTED' ? '#f87171' : txn.status === 'PENDING' ? '#fbbf24' : '#34d399', margin: '0.25rem 0' }}>
            {formatINR(txn.amount)}
          </div>
          <span className={`badge ${txn.status === 'REJECTED' ? 'badge-danger' : txn.status === 'PENDING' ? 'badge-gold' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
            {txn.status === 'REJECTED' ? 'STATUS: REJECTED & REFUNDED' : txn.status === 'PENDING' ? 'STATUS: PENDING ADMIN DISBURSAL' : (t ? t('receipt_status_cleared') : 'STATUS: COMPLETED')}
          </span>
        </div>

        {/* Details list */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1rem', 
            textAlign: 'left', 
            marginBottom: '1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8' }}>Transaction Reference:</span>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontFamily: 'monospace' }}>{txn.id}</span>
          </div>

          {txn.utr && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Bank Disbursal UTR:</span>
              <span style={{ fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{txn.utr}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8' }}>Payment Type:</span>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{txn.title}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8' }}>{t ? t('receipt_transferred_to') : 'Settlement Destination'}:</span>
            <span style={{ fontWeight: 600, color: '#22d3ee' }}>{txn.meta}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8' }}>Timestamp:</span>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{formatDate(txn.timestamp)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
            <span style={{ color: '#94a3b8' }}>Processing Gateway:</span>
            <span style={{ fontWeight: 600, color: '#34d399' }}>Instant NPCI / IMPS (Direct Credit)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ flex: 1 }}
            onClick={onClose}
          >
            {t ? t('receipt_btn_close') : 'Close'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => window.print()}
            title="Print or Save Receipt"
          >
            <Download size={16} /> {t ? t('receipt_btn_print') : 'Print Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}
