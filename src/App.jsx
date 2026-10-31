import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import AuthModal from './components/AuthModal';
import DepositCalculatorModal from './components/DepositCalculatorModal';
import PayoutDetailsModal from './components/PayoutDetailsModal';
import WithdrawModal from './components/WithdrawModal';
import ReceiptModal from './components/ReceiptModal';

import AdminLoginModal from './components/AdminLoginModal';
import LiveActivityTicker from './components/LiveActivityTicker';

import DashboardView from './views/DashboardView';
import PlansView from './views/PlansView';
import TaskCenterView from './views/TaskCenterView';
import WithdrawView from './views/WithdrawView';
import HistoryView from './views/HistoryView';
import FundEconomicsView from './views/FundEconomicsView';
import AdminPanelView from './views/AdminPanelView';
import MlmNetworkView from './views/MlmNetworkView';
import AuthView from './views/AuthView';

import { ShieldCheck, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { formatINR } from './utils/finance';
import ErrorBoundary from './components/ErrorBoundary';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState(null);

  const { toastMessage, withdrawPrincipal, payoutMethod, showToast, currentRole, switchRole, user } = useApp();

  // Secret admin access triggers:
  // 1. URL parameter: ?portal=admin or ?admin=true or hash #admin
  // 2. Secret keyboard combo: Ctrl + Shift + A (Cmd + Shift + A on Mac)
  React.useEffect(() => {
    const checkQueries = () => {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      const searchLower = search.toLowerCase();
      const hashLower = hash.toLowerCase();

      // 1. Admin portal query check
      if (searchLower.includes('admin') || searchLower.includes('portal=admin') || hashLower === '#admin') {
        setIsAdminLoginOpen(true);
      }

      // 2. Referral code query check (?ref=CODE or ?referral=CODE or ?sponsor=CODE)
      try {
        const params = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.replace(/^#\/?/, '?'));
        const refCode = params.get('ref') || params.get('referral') || params.get('referralCode') || params.get('sponsor') || hashParams.get('ref') || hashParams.get('referral');
        if (refCode) {
          const cleanRef = refCode.trim().toUpperCase();
          sessionStorage.setItem('taskcoin_ref_code', cleanRef);
          localStorage.setItem('taskcoin_ref_code', cleanRef);
          const leg = params.get('leg') || hashParams.get('leg');
          if (leg) {
            sessionStorage.setItem('taskcoin_ref_leg', leg.trim().toUpperCase());
          }
        }
      } catch (err) {
        console.warn('Error reading URL parameters:', err);
      }
    };
    checkQueries();
    window.addEventListener('popstate', checkQueries);

    const handleKeyDown = (e) => {
      // Prevent browser Backspace from navigating back or closing the page if not in an editable field
      if (e.key === 'Backspace') {
        const target = e.target;
        const isEditable = target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        );
        if (!isEditable || target.readOnly || target.disabled) {
          e.preventDefault();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkAdminQuery);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleWithdrawPrincipal = (plan) => {
    if (!payoutMethod) {
      showToast('Please configure your UPI or Bank account first.', 'error');
      setIsPayoutOpen(true);
      return;
    }
    const success = withdrawPrincipal(plan.id);
    if (success) {
      setReceiptTxn({
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        title: 'Matured Principal Return',
        amount: plan.amount,
        timestamp: new Date().toISOString(),
        meta: `Transferred to ${payoutMethod.type === 'upi_id' ? payoutMethod.upiId : payoutMethod.type === 'upi_phone' ? payoutMethod.upiPhone : payoutMethod.bankName}`,
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPayout={() => setIsPayoutOpen(true)}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1 }}>
        <ErrorBoundary>
          {currentRole === 'admin' ? (
            <AdminPanelView />
          ) : !user ? (
            /* Mandatory User Login & Registration Screen */
            <AuthView onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />
          ) : (
            <>
              {/* Live Activity Stream (Scrolls with page content, does not block header) */}
              <LiveActivityTicker />

              {activeTab === 'dashboard' && (
                <DashboardView
                  setActiveTab={setActiveTab}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenPayout={() => setIsPayoutOpen(true)}
                  onOpenReceipt={(txn) => setReceiptTxn(txn)}
                  onWithdrawPrincipal={handleWithdrawPrincipal}
                />
              )}

              {activeTab === 'plans' && (
                <PlansView
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onWithdrawPrincipal={handleWithdrawPrincipal}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskCenterView
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'withdraw' && (
                <WithdrawView
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenPayout={() => setIsPayoutOpen(true)}
                  onWithdrawPrincipal={handleWithdrawPrincipal}
                />
              )}

              {activeTab === 'history' && (
                <HistoryView
                  onOpenReceipt={(txn) => setReceiptTxn(txn)}
                />
              )}

              {activeTab === 'mlm' && (
                <MlmNetworkView />
              )}

              {activeTab === 'economics' && (
                <FundEconomicsView />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Mobile Android Bottom Navigation Bar */}
      {user && (
        <MobileBottomNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Platform Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(8, 12, 20, 0.9)', padding: '2.5rem 0 2rem' }}>
        <div className="app-container" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <TrendingUp size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>TaskCoin Pro</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => { if (currentRole === 'admin') switchRole('investor'); setActiveTab('dashboard'); }}>Dashboard</span>
              <span style={{ cursor: 'pointer' }} onClick={() => { if (currentRole === 'admin') switchRole('investor'); setActiveTab('plans'); }}>Membership Tiers</span>
              <span style={{ cursor: 'pointer' }} onClick={() => { if (currentRole === 'admin') switchRole('investor'); setActiveTab('tasks'); }}>Daily Tasks</span>
              <span style={{ cursor: 'pointer' }} onClick={() => { if (currentRole === 'admin') switchRole('investor'); setActiveTab('withdraw'); }}>24/7 Payouts</span>
              <span style={{ cursor: 'pointer' }} onClick={() => { if (currentRole === 'admin') switchRole('investor'); setActiveTab('mlm'); }}>2:1 Binary Network</span>
              <span style={{ cursor: 'pointer' }} onClick={() => { if (currentRole === 'admin') switchRole('investor'); setActiveTab('economics'); }}>Reward Economics</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78rem', color: '#64748b' }}>
            <div>
              © 2026 TaskCoin Pro. Task Rewards & Community Monetization Platform. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck 
                size={14} 
                color="#34d399" 
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  if (e.detail === 3) setIsAdminLoginOpen(true);
                }}
                title="Verified Platform Network"
              />
              <span>Native Android APK & PWA Ready • Principal Refundable at Maturity</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <DepositCalculatorModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <PayoutDetailsModal
        isOpen={isPayoutOpen}
        onClose={() => setIsPayoutOpen(false)}
        onSaved={() => showToast('Payout details saved successfully!')}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onOpenPayoutSetup={() => {
          setIsWithdrawOpen(false);
          setIsPayoutOpen(true);
        }}
        onOpenReceipt={(txn) => setReceiptTxn(txn)}
      />

      <ReceiptModal
        isOpen={Boolean(receiptTxn)}
        onClose={() => setReceiptTxn(null)}
        txn={receiptTxn}
      />

      {/* Secret Admin Authentication Gate */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => setActiveTab('admin')}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="#34d399" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
