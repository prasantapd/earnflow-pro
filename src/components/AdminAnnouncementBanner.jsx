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
      style={{
        padding: '0.55rem 0.95rem',
        marginBottom: '1rem',
        border: `1px solid ${borderColor}`,
        background: bgGradient,
        borderRadius: '10px',
        position: 'relative',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 260 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              background: badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: badgeColor,
              flexShrink: 0,
              border: `1px solid ${badgeColor}40`
            }}
          >
            <Icon size={16} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '1px 6px',
                borderRadius: '8px',
                background: badgeBg,
                color: badgeColor,
                border: `1px solid ${badgeColor}50`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Megaphone size={10} /> Notice
            </span>

            <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>
              {title}
            </strong>

            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              {message}
            </span>
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
            width: 22,
            height: 22,
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
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
