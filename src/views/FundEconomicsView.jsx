import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Layers, 
  Lock, 
  Coins, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  Tv,
  Megaphone,
  Building
} from 'lucide-react';
import { formatINR } from '../utils/finance';

export default function FundEconomicsView() {
  const [simulatedPoolCapital, setSimulatedPoolCapital] = useState(1000000); // 10 Lakhs

  const monthlyGrossRevenue = Math.round(simulatedPoolCapital * 0.10); 
  const userTaskRewardAllocation = Math.round(simulatedPoolCapital * 0.07); 
  const platformOperatingReserve = Math.round(simulatedPoolCapital * 0.03); 

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-emerald">Business & Monetization Model</span>
          <span className="badge badge-gold">Transparent Architecture</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Platform Task Economics & Revenue Model</h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '780px' }}>
          Discover the sustainable monetization engine powering EarnFlow. How brand promotional campaigns and creator media budgets fund user task rewards while safeguarding treasury solvency.
        </p>
      </div>

      {/* The 3 Pillars of Platform Economics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Pillar 1: Creator & Brand Promotion Revenue */}
        <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid #10b981' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1rem' }}>
            <Megaphone size={24} />
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>Media & Brand Revenue</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
            Brand Sponsorships & Ads
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Content creators, digital influencers, and advertiser brands partner with EarnFlow to gain genuine watch time, audio impressions, and engagement, generating sustainable inbound advertising capital.
          </p>
        </div>

        {/* Pillar 2: Estimated Task Rewards Allocation */}
        <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid #f59e0b' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1rem' }}>
            <Coins size={24} />
          </div>
          <span className="badge badge-gold" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>User Task Rewards</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
            Estimated Task Income
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Inbound media revenue is distributed directly to users as estimated task rewards upon completing daily video watches, music streams, and attendance streaks. Longer lock-in membership tiers unlock higher daily task quotas.
          </p>
        </div>

        {/* Pillar 3: Treasury Liquidity & Platform Reserve */}
        <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid #06b6d4' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', marginBottom: '1rem' }}>
            <Building size={24} />
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>Treasury Reserve</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
            Operating Reserve
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            A disciplined spread of platform earnings is retained in secure liquid treasury reserves to cover instant IMPS payment gateway fees, server infrastructure, and ensure 100% principal availability upon lock-in maturity.
          </p>
        </div>
      </div>

      {/* Visual Flow Architecture */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '2rem', 
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.25)'
        }}
      >
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Revenue & Task Allocation Pipeline
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.75rem' }}>
          Visualizing how creator promotion budgets, membership tiers, daily tasks, and instant 24/7 payouts work together.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', position: 'relative' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Step 1</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', margin: '0.35rem 0' }}>Membership Tier</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              User selects 1 active membership tier (₹2,000 to ₹50,000) with 1M, 3M, 6M, or 1Y lock-in.
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Step 2</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#34d399', margin: '0.35rem 0' }}>Media Ingestion</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Brand sponsors and YouTube creators fund verified view and engagement campaigns.
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>Step 3</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fbbf24', margin: '0.35rem 0' }}>Daily Tasks</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              User performs daily tasks (videos, audio, streak bonus) to unlock their estimated daily task quota.
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <div style={{ fontSize: '0.72rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 700 }}>Step 4</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#22d3ee', margin: '0.35rem 0' }}>24/7 Payout</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Withdraw earnings anytime via instant IMPS (Min ₹100 • 1/day). Principal refundable upon lock-in maturity.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Treasury Simulation Slider */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Platform Revenue Allocation Simulator
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Adjust the total managed platform campaign pool to observe the estimated reward distribution split.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
            <span>Simulated Platform Capital Pool:</span>
            <span style={{ color: '#34d399', fontSize: '1.2rem' }}>{formatINR(simulatedPoolCapital)}</span>
          </div>
          <input
            type="range"
            min="100000"
            max="10000000"
            step="50000"
            value={simulatedPoolCapital}
            onChange={(e) => setSimulatedPoolCapital(Number(e.target.value))}
            style={{ width: '100%', height: '8px', cursor: 'pointer', accentColor: '#10b981' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gross Campaign Revenue Generated</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>
              {formatINR(monthlyGrossRevenue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Total monthly advertiser media budget</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>User Task Rewards Distributed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', margin: '0.25rem 0' }}>
              {formatINR(userTaskRewardAllocation)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Paid out for verified daily video, audio & game tasks</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Platform Operating & Solvency Reserve</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22d3ee', margin: '0.25rem 0' }}>
              {formatINR(platformOperatingReserve)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Retained for gateway fees & capital refund safety</div>
          </div>
        </div>
      </div>
    </div>
  );
}
