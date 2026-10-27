import React, { useState } from 'react';
import { 
  Megaphone, 
  X, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/finance';

export default function AdminAnnouncementBanner() {
  const { adminAnnouncement } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!adminAnnouncement || !adminAnnouncement.active || dismissed) {
    return null;
  }

  const { title, message, type, updatedAt, broadcastBy } = adminAnnouncement;

  let borderColor = 'rgba(6, 182, 212, 0.4)';
  let bgGradient = 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)';
  let badgeColor = '#22d3ee';
  let badgeBg = 'rgba(6, 182, 212, 0.2)';
  let Icon = Info;

  if (type === 'warning') {
    borderColor = 'rgba(245, 158, 11, 0.45)';
    bgGradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%)';
    badgeColor = '#fbbf24';
    badgeBg = 'rgba(245, 158, 11, 0.2)';
    Icon = AlertTriangle;
  } else if (type === 'success') {
    borderColor = 'rgba(16, 185, 129, 0.45)';
    bgGradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%)';
    badgeColor = '#34d399';
    badgeBg = 'rgba(16, 185, 129, 0.2)';
    Icon = CheckCircle2;
  } else if (type === 'critical') {
    borderColor = 'rgba(244, 63, 94, 0.5)';
    bgGradient = 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)';
    badgeColor = '#f43f5e';
    badgeBg = 'rgba(244, 63, 94, 0.2)';
    Icon = AlertOctagon;
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        border: `1.5px solid ${borderColor}`,
        background: bgGradient,
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: badgeColor,
              flexShrink: 0,
              marginTop: '0.1rem',
              border: `1px solid ${badgeColor}40`
            }}
          >
            <Icon size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: badgeBg,
                  color: badgeColor,
                  border: `1px solid ${badgeColor}50`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Megaphone size={11} /> Admin Broadcast
              </span>

              {updatedAt && (
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={11} /> {formatDate(updatedAt)}
                </span>
              )}

              {broadcastBy && (
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  • Posted by {broadcastBy}
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              {title}
            </h4>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          title="Dismiss notice"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: '#94a3b8',
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
