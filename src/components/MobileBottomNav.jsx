import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  PlayCircle, 
  ArrowDownCircle, 
  ShieldCheck, 
  GitBranch 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav({ activeTab, setActiveTab, onOpenAuth }) {
  const { currentRole, switchRole, t } = useApp();

  return (
    <nav className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-btn ${activeTab === 'dashboard' && currentRole === 'investor' ? 'active' : ''}`}
        onClick={() => {
          if (currentRole !== 'investor') switchRole('investor');
          setActiveTab('dashboard');
        }}
      >
        <TrendingUp size={20} />
        <span>{t ? t('mobile_nav_dashboard') : 'Home'}</span>
      </button>

      <button 
        className={`mobile-nav-btn ${activeTab === 'plans' && currentRole === 'investor' ? 'active' : ''}`}
        onClick={() => {
          if (currentRole !== 'investor') switchRole('investor');
          setActiveTab('plans');
        }}
      >
        <Layers size={20} />
        <span>{t ? t('mobile_nav_plans') : 'Plans'}</span>
      </button>

      <button 
        className={`mobile-nav-btn ${activeTab === 'tasks' && currentRole === 'investor' ? 'active' : ''}`}
        onClick={() => {
          if (currentRole !== 'investor') switchRole('investor');
          setActiveTab('tasks');
        }}
      >
        <div style={{ position: 'relative' }}>
          <PlayCircle size={22} color="#fbbf24" />
          <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
        </div>
        <span style={{ color: '#fbbf24', fontWeight: 700 }}>{t ? t('mobile_nav_tasks') : 'Earn'}</span>
      </button>

      <button 
        className={`mobile-nav-btn ${activeTab === 'mlm' && currentRole === 'investor' ? 'active' : ''}`}
        onClick={() => {
          if (currentRole !== 'investor') switchRole('investor');
          setActiveTab('mlm');
        }}
      >
        <GitBranch size={20} />
        <span>{t ? t('mobile_nav_network') : 'Network'}</span>
      </button>

      {currentRole === 'admin' ? (
        <button 
          className="mobile-nav-btn active"
          onClick={() => {
            switchRole('investor');
            setActiveTab('dashboard');
          }}
          style={{ color: '#f87171' }}
        >
          <ShieldCheck size={20} color="#f87171" />
          <span>{t ? t('action_exit_admin') : 'Exit Admin'}</span>
        </button>
      ) : (
        <button 
          className={`mobile-nav-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('withdraw');
          }}
        >
          <ArrowDownCircle size={20} />
          <span>{t ? t('mobile_nav_withdraw') : 'Payout'}</span>
        </button>
      )}
    </nav>
  );
}
