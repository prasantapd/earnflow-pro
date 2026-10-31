import React, { useState } from 'react';
import { 
  GitBranch, 
  Users, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  ArrowDownCircle, 
  UserPlus, 
  Network,
  Share2,
  Sliders,
  HelpCircle,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/finance';

export default function MlmNetworkView() {
  const { 
    mlmNetwork, 
    setPreferredLeg, 
    addDownlineMember, 
    showToast,
    user,
    t
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [simName, setSimName] = useState('');
  const [simLeg, setSimLeg] = useState('AUTO');
  const [simAmount, setSimAmount] = useState('2000');

  const mlm = mlmNetwork || {
    referralCode: user?.referralCode || 'TASKCOIN',
    preferredLeg: 'AUTO',
    leftVolume: 0,
    rightVolume: 0,
    leftCarry: 0,
    rightCarry: 0,
    totalPairsMatched: 0,
    lifetimeMlmEarned: 0,
    dailyCappedToday: 0,
    dailyCapLimit: 3000,
    leftMembers: [],
    rightMembers: [],
  };

  const baseUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1'))
    ? window.location.origin
    : 'https://earnflow-pro-3d5o.onrender.com';
  const refCode = user?.referralCode || mlm.referralCode || user?.phone || 'TASKCOIN';
  const referralLink = `${baseUrl}/?ref=${refCode}&leg=${(mlm.preferredLeg || 'auto').toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast(t ? t('dash_copied') : 'Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`⚡ Join TaskCoin Pro on my team and earn daily task rewards! Register here: ${referralLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSimulateDownline = (e) => {
    e.preventDefault();
    const amt = Number(simAmount);
    if (!amt || amt < 1000) {
      showToast('Minimum deposit volume is ₹1,000', 'error');
      return;
    }

    addDownlineMember({
      name: simName.trim() || undefined,
      leg: simLeg,
      amount: amt,
    });

    setSimName('');
  };

  const capPercentage = Math.min(100, Math.round((mlm.dailyCappedToday / mlm.dailyCapLimit) * 100));

  return (
    <div>
      {/* Header Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(15, 23, 42, 0.95) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-indigo">{t ? t('mlm_binary_marketing') : 'Binary Marketing 2:1'}</span>
              <span className="badge badge-emerald">{t ? t('mlm_lifetime_bonus_badge') : 'Lifetime Matching Bonus'}</span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>{t ? t('mlm_title') : 'Binary Referral & MLM Network'}</h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '680px', marginTop: '0.3rem' }}>
              {t ? t('mlm_desc') : 'Market-standard 2:1 or 1:2 Binary Pair Matching system. When your Left and Right teams form deposit volume pairs, you receive instant lifetime matching bonuses credited directly to your wallet!'}
            </p>
          </div>

          <div 
            className="glass-card" 
            style={{ 
              padding: '1.25rem 1.75rem', 
              background: 'rgba(15, 23, 42, 0.8)', 
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              minWidth: '240px'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              {t ? t('mlm_lifetime_earned') : 'Lifetime Binary Bonus'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', margin: '0.2rem 0' }}>
              {formatINR(mlm.lifetimeMlmEarned)}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              {t ? t('mlm_total_matched_pairs', { pairs: mlm.totalPairsMatched }) : `Total Matched: ${mlm.totalPairsMatched} Pairs`}
            </div>
          </div>
        </div>

        {/* Daily Cap Guard Bar (Admin Solvency Protection) */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.45rem' }}>
            <span style={{ color: '#cbd5e1' }}>
              {t ? t('mlm_today_capping', { capped: formatINR(mlm.dailyCappedToday), limit: formatINR(mlm.dailyCapLimit) }) : `Today's Payout Capping: ${formatINR(mlm.dailyCappedToday)} / ${formatINR(mlm.dailyCapLimit)} Limit`}
            </span>
            <span style={{ fontWeight: 700, color: '#34d399' }}>
              {t ? t('mlm_liquidity_protected', { pct: capPercentage }) : `${capPercentage}% Used • Platform Liquidity Protected`}
            </span>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${capPercentage}%`, 
                background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                borderRadius: '3px',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Referral Link & Leg Placement Studio */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.75rem', 
          marginBottom: '2rem',
          background: 'rgba(15, 23, 42, 0.65)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t ? t('mlm_placement_title') : 'Your Referral Link & Placement Control'}</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {t ? t('mlm_placement_desc') : 'Choose which binary leg new members will join, or set to Auto-Balance to maximize your 2:1 pair matches.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className={`btn btn-sm ${mlm.preferredLeg === 'LEFT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
              onClick={() => setPreferredLeg('LEFT')}
            >
              {t ? t('mlm_left_leg_btn') : '👈 Left Leg'}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mlm.preferredLeg === 'AUTO' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
              onClick={() => setPreferredLeg('AUTO')}
            >
              {t ? t('mlm_auto_balance_btn') : '⚖️ Auto-Balance'}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mlm.preferredLeg === 'RIGHT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem' }}
              onClick={() => setPreferredLeg('RIGHT')}
            >
              {t ? t('mlm_right_leg_btn') : '👉 Right Leg'}
            </button>
          </div>
        </div>

        {/* Link Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              readOnly
              value={referralLink}
              className="input-field"
              style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#22d3ee', paddingRight: '3rem' }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopyLink}
            style={{ minWidth: '120px' }}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            <span>{copied ? (t ? t('dash_copied') : 'Copied!') : (t ? t('dash_copy_link') : 'Copy Link')}</span>
          </button>
          <button
            type="button"
            className="btn btn-emerald"
            onClick={handleShareWhatsApp}
            style={{ minWidth: '120px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Share Referral Link on WhatsApp"
          >
            <Share2 size={16} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Binary Volume Balance Grid (Left vs Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Left Leg Card */}
        <div 
          className="glass-card card-interactive" 
          style={{ 
            padding: '1.75rem', 
            borderTop: '4px solid #3b82f6',
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                👈
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa' }}>{t ? t('mlm_left_team_title') : 'LEFT TEAM'}</h3>
            </div>
            <span className="badge badge-indigo">
              {t ? t('mlm_members_count', { count: (mlm.leftMembers || []).length }) : `${(mlm.leftMembers || []).length} Members`}
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{t ? t('mlm_total_bv') : 'Total Business Volume'}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {formatINR(mlm.leftVolume)}
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t ? t('mlm_active_carry') : 'Active Carry-Forward:'}</div>
              <div style={{ fontWeight: 800, color: '#60a5fa', fontSize: '1.1rem' }}>{formatINR(mlm.leftCarry)}</div>
            </div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
              {t ? t('mlm_ready_to_pair') : 'Ready to Pair'}
            </span>
          </div>
        </div>

        {/* Right Leg Card */}
        <div 
          className="glass-card card-interactive" 
          style={{ 
            padding: '1.75rem', 
            borderTop: '4px solid #10b981',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                👉
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{t ? t('mlm_right_team_title') : 'RIGHT TEAM'}</h3>
            </div>
            <span className="badge badge-emerald">
              {t ? t('mlm_members_count', { count: (mlm.rightMembers || []).length }) : `${(mlm.rightMembers || []).length} Members`}
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{t ? t('mlm_total_bv') : 'Total Business Volume'}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {formatINR(mlm.rightVolume)}
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t ? t('mlm_active_carry') : 'Active Carry-Forward:'}</div>
              <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>{formatINR(mlm.rightCarry)}</div>
            </div>
            <span className="badge badge-emerald">
              {t ? t('mlm_ready_to_pair') : 'Ready to Pair'}
            </span>
          </div>
        </div>
      </div>

      {/* 2:1 Pair Matching Ratio Guide & Solvency Math */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '1.75rem', 
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={20} color="#fbbf24" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t ? t('mlm_how_works_title') : 'How the 2:1 Binary Math Works & Guarantees Platform Solvency'}</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          {t ? t('mlm_how_works_desc') : 'In binary MLM, 1 Pair requires either 2 Units Left : 1 Unit Right (₹2,000 : ₹1,000) or 1 Unit Left : 2 Units Right (₹1,000 : ₹2,000). For every matched ₹3,000 paired volume, the referrer receives ₹150 (5.0%) instant matching bonus, while unmatched amounts carry forward!'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.82rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: '#94a3b8' }}>{t ? t('mlm_req_title') : '1 Binary Pair Requirement:'}</div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', margin: '0.2rem 0' }}>₹2,000 : ₹1,000 (2:1 or 1:2)</div>
            <div style={{ color: '#34d399' }}>{t ? t('mlm_paired_vol') : 'Total Paired Volume: ₹3,000'}</div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ color: '#94a3b8' }}>{t ? t('mlm_bonus_payout') : 'Matching Bonus Payout:'}</div>
            <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem', margin: '0.2rem 0' }}>{t ? t('mlm_bonus_rate') : '+₹150.00 / Pair'}</div>
            <div style={{ color: '#cbd5e1' }}>5.0% on paired volume</div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <div style={{ color: '#94a3b8' }}>{t ? t('mlm_treasury_guard') : 'Platform Treasury Guard:'}</div>
            <div style={{ fontWeight: 700, color: '#22d3ee', fontSize: '0.95rem', margin: '0.2rem 0' }}>{t ? t('mlm_treasury_cap') : '₹3,000 Daily Cap Limit'}</div>
            <div style={{ color: '#cbd5e1' }}>Protects against deficit risks</div>
          </div>
        </div>
      </div>

      {/* Downline Interactive Simulation Sandbox */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t ? t('mlm_sim_title') : 'Interactive Downline Referral Simulator'}</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {t ? t('mlm_sim_desc') : 'Test adding new downline members on Left or Right legs and watch the 2:1 pair matching trigger live bonuses!'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSimulateDownline}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>{t ? t('mlm_member_name') : 'Member Name'}</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Ramesh Kumar"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>{t ? t('mlm_placement_leg') : 'Placement Leg'}</span>
              </label>
              <select
                className="input-field"
                value={simLeg}
                onChange={(e) => setSimLeg(e.target.value)}
              >
                <option value="AUTO">{t ? t('mlm_leg_auto') : '⚖️ Auto-Balance'}</option>
                <option value="LEFT">{t ? t('mlm_left_leg_btn') : '👈 Left Leg'}</option>
                <option value="RIGHT">{t ? t('mlm_right_leg_btn') : '👉 Right Leg'}</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>{t ? t('mlm_deposit_volume') : 'Deposit Volume (₹)'}</span>
              </label>
              <select
                className="input-field"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
              >
                <option value="1000">₹1,000</option>
                <option value="2000">₹2,000</option>
                <option value="3500">₹3,500</option>
                <option value="5000">₹5,000</option>
                <option value="10000">₹10,000</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Sparkles size={16} /> {t ? t('mlm_btn_simulate') : 'Simulate Downline Deposit & Calculate 2:1 Match'}
          </button>
        </form>
      </div>

      {/* Visual Binary Genealogy Tree */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {t ? t('mlm_tree_title') : 'Binary Genealogy Tree Hierarchy'}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '2rem' }}>
          {t ? t('mlm_tree_desc') : 'Two-leg structure mapping all direct and indirect downline volume.'}
        </p>

        {/* Tree Root */}
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div 
            style={{ 
              padding: '0.85rem 1.5rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', 
              color: '#ffffff',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
              minWidth: '180px'
            }}
          >
            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase' }}>{t ? t('mlm_root_sponsor') : 'Root Sponsor'}</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{user?.name || user?.phone || 'Investor Account'}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.9, fontFamily: 'monospace' }}>{mlm.referralCode}</div>
          </div>

          {/* Vertical branch line */}
          <div style={{ width: '2px', height: '24px', background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Horizontal cross bar */}
          <div style={{ width: '320px', height: '2px', background: 'rgba(255, 255, 255, 0.2)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '2px', height: '20px', background: 'rgba(255, 255, 255, 0.2)' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, width: '2px', height: '20px', background: 'rgba(255, 255, 255, 0.2)' }} />
          </div>
        </div>

        {/* Level 1: Left Child & Right Child */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Left Node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{ 
                padding: '0.75rem 1.25rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(59, 130, 246, 0.2)', 
                border: '1.5px solid #3b82f6',
                color: '#ffffff',
                minWidth: '160px'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#60a5fa', textTransform: 'uppercase' }}>{t ? t('mlm_left_lead') : 'Left Team Lead'}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {(mlm.leftMembers && mlm.leftMembers[0]?.name) || 'Kabir Verma'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                Vol: {formatINR(mlm.leftVolume)}
              </div>
            </div>
            <span className="badge badge-indigo" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}>
              {t ? t('mlm_downlines_count', { count: (mlm.leftMembers || []).length }) : `${(mlm.leftMembers || []).length} Downlines`}
            </span>
          </div>

          {/* Right Node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{ 
                padding: '0.75rem 1.25rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(16, 185, 129, 0.2)', 
                border: '1.5px solid #10b981',
                color: '#ffffff',
                minWidth: '160px'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase' }}>{t ? t('mlm_right_lead') : 'Right Team Lead'}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {(mlm.rightMembers && mlm.rightMembers[0]?.name) || 'Manish Gupta'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#86efac' }}>
                Vol: {formatINR(mlm.rightVolume)}
              </div>
            </div>
            <span className="badge badge-emerald" style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}>
              {t ? t('mlm_downlines_count', { count: (mlm.rightMembers || []).length }) : `${(mlm.rightMembers || []).length} Downlines`}
            </span>
          </div>
        </div>
      </div>

      {/* Downline Member Directory */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {t ? t('mlm_roster_title', { count: ((mlm.leftMembers || []).length) + ((mlm.rightMembers || []).length) }) : `Downline Team Roster (${((mlm.leftMembers || []).length) + ((mlm.rightMembers || []).length)})`}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          {t ? t('mlm_roster_desc') : 'All active referrals mapped by binary leg and deposit volume.'}
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
              <th style={{ padding: '0.75rem' }}>{t ? t('mlm_th_name') : 'Member Name'}</th>
              <th style={{ padding: '0.75rem' }}>{t ? t('mlm_th_placement') : 'Leg Placement'}</th>
              <th style={{ padding: '0.75rem' }}>{t ? t('mlm_th_volume') : 'Deposit Volume'}</th>
              <th style={{ padding: '0.75rem' }}>{t ? t('mlm_th_joined') : 'Joined Date'}</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>{t ? t('mlm_th_status') : 'Pairing Status'}</th>
            </tr>
          </thead>
          <tbody>
            {[...(mlm.leftMembers || []), ...(mlm.rightMembers || [])].map((member, i) => (
              <tr key={member.id || i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '0.85rem 0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{member.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{member.id}</div>
                </td>

                <td style={{ padding: '0.85rem 0.75rem' }}>
                  <span className={`badge ${member.leg === 'LEFT' ? 'badge-indigo' : 'badge-emerald'}`}>
                    {member.leg === 'LEFT' ? (t ? t('mlm_left_leg_btn') : '👈 Left Leg') : (t ? t('mlm_right_leg_btn') : '👉 Right Leg')}
                  </span>
                </td>

                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 800, color: '#ffffff' }}>
                  {formatINR(member.amount)}
                </td>

                <td style={{ padding: '0.85rem 0.75rem', color: '#cbd5e1', fontSize: '0.8rem' }}>
                  {formatDate(member.joinedAt)}
                </td>

                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                    {t ? t('mlm_matched_compounding') : 'Matched & Compounding'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
