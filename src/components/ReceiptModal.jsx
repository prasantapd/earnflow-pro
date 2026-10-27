import React from 'react';
import { X, CheckCircle, Download, Share2, ShieldCheck, ArrowDownCircle } from 'lucide-react';
import { formatINR, formatDate } from '../utils/finance';

export default function ReceiptModal({ isOpen, onClose, txn }) {
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
          Payout Dispatched Successfully!
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Your fund settlement transfer has been initiated via automated IMPS gateway.
        </p>

        {/* Amount Box */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.25rem', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Amount Transferred
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>
            {formatINR(txn.amount)}
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            STATUS: COMPLETED
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

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8' }}>Payment Type:</span>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{txn.title}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#94a3b8' }}>Settlement Destination:</span>
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
            Done
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => window.print()}
            title="Print or Save Receipt"
          >
            <Download size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
