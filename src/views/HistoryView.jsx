import React, { useState } from 'react';
import { 
  History, 
  ArrowDownCircle, 
  PlusCircle, 
  PlayCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';

export default function HistoryView({ onOpenReceipt }) {
  const { transactions, t } = useApp();
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchMeta = t.meta?.toLowerCase().includes(q);
      const matchId = t.id?.toLowerCase().includes(q);
      if (!matchTitle && !matchMeta && !matchId) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-emerald">Audited Ledger</span>
          <span className="badge badge-cyan">Real-time Records</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t ? t('hist_title') : 'Transaction History & Receipts'}</h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          {t ? t('hist_subtitle') : 'Complete transparent log of all deposits, daily task credits, weekly Sunday payouts, and principal returns.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: t ? t('hist_filter_all') : 'All Transactions' },
            { id: 'TASK_REWARD', label: t ? t('hist_filter_tasks') : 'Task Earnings' },
            { id: 'WITHDRAWAL', label: t ? t('hist_filter_withdrawals') : 'Withdrawals' },
            { id: 'DEPOSIT', label: t ? t('hist_filter_deposits') : 'Plan Deposits' },
            { id: 'PRINCIPAL_WITHDRAWAL', label: t ? t('with_principal_return_title') : 'Principal Refunds' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn btn-sm ${filterType === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType(cat.id)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.45rem 0.85rem 0.45rem 2.25rem' }}
            placeholder={t ? t('hist_search_placeholder') : 'Search by ID, title, UPI...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <History size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p>{t ? t('hist_no_records') : 'No transactions found matching your criteria.'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem' }}>Transaction ID</th>
                <th style={{ padding: '0.75rem' }}>Type & Details</th>
                <th style={{ padding: '0.75rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const isOutflow = tx.type === 'WITHDRAWAL' || tx.type === 'PRINCIPAL_WITHDRAWAL';
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: '#22d3ee', fontWeight: 600 }}>
                      {tx.id}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{tx.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.meta}</div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', color: '#cbd5e1', fontSize: '0.82rem' }}>
                      {formatDate(tx.timestamp)}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 800, fontSize: '0.98rem', color: isOutflow ? '#f43f5e' : '#34d399' }}>
                      {isOutflow ? '-' : '+'}{formatINR(tx.amount)}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span className={`badge ${tx.status === 'COMPLETED' || tx.status === 'APPROVED' ? 'badge-emerald' : tx.status === 'REJECTED' ? 'badge-danger' : 'badge-gold'}`} style={{ fontSize: '0.62rem' }}>
                        {tx.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        onClick={() => onOpenReceipt(tx)}
                      >
                        <ExternalLink size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
