import { describe, it, expect } from 'vitest';
import { canUserWithdrawToday, getMembershipTier, TRIAL_PLAN } from '../../utils/finance.js';

describe('Unit Tests: Trial Pass Constraints & Mobile Exclusivity', () => {
  describe('Trial Pass Parameters', () => {
    it('defines TRIAL_PLAN with exactly ₹300 amount and 3-day validity', () => {
      expect(TRIAL_PLAN.amount).toBe(300);
      expect(TRIAL_PLAN.days).toBe(3);
      expect(TRIAL_PLAN.badge).toContain('Trial');
    });

    it('anchors trial pass to ₹2,000 baseline rewards (1.0x)', () => {
      const tier = getMembershipTier(null, {
        isTrialActive: true,
        trialPlan: { price: 300 },
      });
      expect(tier.taskMultiplier).toBe(1.0);
      expect(tier.loginMultiplier).toBe(1.0);
      expect(tier.depositAmount).toBe(300);
    });
  });

  describe('Zero-Minimum Withdrawal Exemption vs Single Lifetime Constraint', () => {
    it('grants zero-minimum withdrawal for trial member with positive balance on first payout', () => {
      const result = canUserWithdrawToday({
        isTrialMember: true,
        trialWithdrawalClaimed: false,
        balance: 45, // Any amount > 0
        overrideSundayCheck: true,
      });

      expect(result.allowed).toBe(true);
      expect(result.isTrialExemption).toBe(true);
      expect(result.minRequired).toBe(0);
    });

    it('rejects subsequent withdrawal attempts once lifetime trial withdrawal is used', () => {
      const result = canUserWithdrawToday({
        isTrialMember: true,
        trialWithdrawalClaimed: true, // Already claimed once
        balance: 150,
        overrideSundayCheck: true,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('once in a lifetime');
    });
  });

  describe('Free Registration 2-Day Trial Rules', () => {
    it('allows 2-day free registration users to complete tasks and streak at 1.0x', () => {
      const tierDay1 = getMembershipTier(null, { canEarn: true, dayNumber: 1 });
      expect(tierDay1.isFreeTrial).toBe(true);
      expect(tierDay1.taskMultiplier).toBe(1.0);
      expect(tierDay1.loginMultiplier).toBe(1.0);

      const tierDay2 = getMembershipTier(null, { canEarn: true, dayNumber: 2 });
      expect(tierDay2.isFreeTrial).toBe(true);
      expect(tierDay2.taskMultiplier).toBe(1.0);
    });

    it('strictly locks withdrawal for users who have never deposited', () => {
      const result = canUserWithdrawToday({
        isTrialMember: false,
        hasNeverDeposited: true, // Free registration only, no ₹300 or regular plan
        balance: 200,
        overrideSundayCheck: true,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Withdrawal Locked');
      expect(result.reason).toContain('activating the ₹300 Trial Pass or a Membership Plan');
    });
  });
});
