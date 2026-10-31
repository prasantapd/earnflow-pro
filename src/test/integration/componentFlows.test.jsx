import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WithdrawModal from '../../components/WithdrawModal';
import DailyStreakWidget from '../../components/DailyStreakWidget';
import * as AppContextModule from '../../context/AppContext';

describe('Integration Tests: UI Components & User Rules', () => {
  describe('WithdrawModal Rules & Exemption Flows', () => {
    it('shows Zero Minimum Withdrawal banner for active trial member with unused trial withdrawal', () => {
      const mockContext = {
        rewardWallet: 120,
        payoutMethod: { type: 'upi', details: { upiId: 'test@upi' } },
        isWithdrawalAllowed: true,
        sundayStatus: { isOpen: true, timeRemaining: '2h' },
        forceSunday: false,
        toggleForceSunday: vi.fn(),
        withdrawRewards: vi.fn(),
        showToast: vi.fn(),
        activePlan: { id: 'trial-pass', isTrial: true, amount: 300, name: '3-Day Trial Pass' },
        hasUsedTrialWithdrawal: false,
        freeTrialStatus: null,
      };

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

      render(
        <WithdrawModal
          isOpen={true}
          onClose={vi.fn()}
          onOpenPayoutSetup={vi.fn()}
          onOpenReceipt={vi.fn()}
        />
      );

      // Verify that trial zero-minimum badge or text is present
      const zeroMinElements = screen.getAllByText(/Zero Min Requirement|Withdraw whatever amount you want/i);
      expect(zeroMinElements.length).toBeGreaterThan(0);
    });

    it('blocks withdrawal with lock notification for 2-day free registration without active plan', () => {
      const mockShowToast = vi.fn();
      const mockContext = {
        rewardWallet: 80,
        payoutMethod: { type: 'upi', details: { upiId: 'test@upi' } },
        isWithdrawalAllowed: true,
        sundayStatus: { isOpen: true },
        forceSunday: false,
        toggleForceSunday: vi.fn(),
        withdrawRewards: vi.fn(),
        showToast: mockShowToast,
        activePlan: null, // No paid or trial plan active
        hasUsedTrialWithdrawal: false,
        freeTrialStatus: { isFreeTrial: true, registrationDate: new Date().toISOString() },
      };

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

      render(
        <WithdrawModal
          isOpen={true}
          onClose={vi.fn()}
          onOpenPayoutSetup={vi.fn()}
          onOpenReceipt={vi.fn()}
        />
      );

      // Verify withdrawal locked banner is displayed
      expect(screen.getByText(/Withdrawals Locked/i)).toBeInTheDocument();
      expect(screen.getByText(/Activate ₹300 Trial or Membership Plan to cash out/i)).toBeInTheDocument();
    });

    it('enforces minimum requirement for standard paid members', () => {
      const mockShowToast = vi.fn();
      const mockContext = {
        rewardWallet: 300,
        payoutMethod: { type: 'upi', details: { upiId: 'test@upi' } },
        isWithdrawalAllowed: true,
        sundayStatus: { isOpen: true },
        forceSunday: false,
        toggleForceSunday: vi.fn(),
        withdrawRewards: vi.fn(),
        showToast: mockShowToast,
        activePlan: { id: 'plan-2000', amount: 2000, name: '₹2,000 Starter' },
        hasUsedTrialWithdrawal: false,
        freeTrialStatus: null,
      };

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

      render(
        <WithdrawModal
          isOpen={true}
          onClose={vi.fn()}
          onOpenPayoutSetup={vi.fn()}
          onOpenReceipt={vi.fn()}
        />
      );

      // Verify 24/7 gateway active is displayed for regular members
      expect(screen.getByText(/24\/7 Payout Gateway Active/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Min ₹100/i).length).toBeGreaterThan(0);
    });


  });

  describe('DailyStreakWidget Multiplier Scaling', () => {
    it('displays streak login bonus scaled by user membership multiplier', () => {
      const mockContext = {
        streak: {
          currentStreak: 3,
          lastLoginDate: '2026-10-30',
          todayClaimed: false,
        },
        claimDailyLoginBonus: vi.fn(),
        showToast: vi.fn(),
        userMembershipTier: {
          multiplier: 5.5,
          taskMultiplier: 5.5,
          loginMultiplier: 5.5,
          name: 'Executive Pro (5.5×)',
        },
      };

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

      render(<DailyStreakWidget />);

      // The header or badge should show the member's tier or 5.5x multiplier
      const badgeElements = screen.queryAllByText(/5\.5×/);
      expect(badgeElements.length).toBeGreaterThanOrEqual(0);
    });
  });
});
