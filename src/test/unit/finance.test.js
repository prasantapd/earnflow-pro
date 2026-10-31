import { describe, it, expect } from 'vitest';
import {
  getMembershipTier,
  DEFAULT_PLAN_MULTIPLIERS,
  calculateEarnings,
  getNextSundayStatus,
  canUserWithdrawToday,
  formatINR,
  formatCompactINR,
} from '../../utils/finance.js';

describe('Unit Tests: Finance & Multipliers System (TDD)', () => {
  describe('₹2,000 Base Anchor & Default Multipliers', () => {
    it('should strictly anchor ₹2,000 plan to 1.0x baseline', () => {
      const tier = getMembershipTier({ id: 'silver', price: 2000, name: '₹2,000 Starter' });
      expect(tier.multiplier).toBe(1.0);
      expect(tier.taskMultiplier).toBe(1.0);
      expect(tier.loginMultiplier).toBe(1.0);
    });

    it('should anchor ₹300 3-day Trial Pass to 1.0x baseline (identical to ₹2,000 plan)', () => {
      const trialStatus = {
        isTrialActive: true,
        trialPlan: { price: 300, name: '3-Day Trial Pass' },
        hasClaimedTrial: true,
      };
      const tier = getMembershipTier(null, trialStatus);
      expect(tier.multiplier).toBe(1.0);
      expect(tier.taskMultiplier).toBe(1.0);
      expect(tier.loginMultiplier).toBe(1.0);
      expect(tier.name).toContain('Trial Pass');
    });

    it('should resolve default multipliers correctly for standard tiers', () => {
      expect(DEFAULT_PLAN_MULTIPLIERS['2000']).toBe(1.0);
      expect(DEFAULT_PLAN_MULTIPLIERS['300']).toBe(1.0);
      expect(DEFAULT_PLAN_MULTIPLIERS['3500']).toBe(1.75);
      expect(DEFAULT_PLAN_MULTIPLIERS['5000']).toBe(2.5);
      expect(DEFAULT_PLAN_MULTIPLIERS['7500']).toBe(3.75);
      expect(DEFAULT_PLAN_MULTIPLIERS['10000']).toBe(5.0);
      expect(DEFAULT_PLAN_MULTIPLIERS['25000']).toBe(12.5);
      expect(DEFAULT_PLAN_MULTIPLIERS['50000']).toBe(25.0);
    });
  });

  describe('Admin Dynamic Multiplier Overrides (5.5x, 6.0x, Custom)', () => {
    it('should allow Admin to set ₹10,000 plan multiplier to 5.5x instead of 5.0x', () => {
      const customMultipliers = {
        ...DEFAULT_PLAN_MULTIPLIERS,
        '10000': 5.5,
      };
      const tier = getMembershipTier(
        { id: 'gold-10k', price: 10000, name: 'Executive Pro' },
        null,
        customMultipliers
      );
      expect(tier.multiplier).toBe(5.5);
      expect(tier.taskMultiplier).toBe(5.5);
      expect(tier.loginMultiplier).toBe(5.5);
    });

    it('should allow Admin to set ₹10,000 plan multiplier to 6.0x', () => {
      const customMultipliers = {
        ...DEFAULT_PLAN_MULTIPLIERS,
        '10000': 6.0,
      };
      const tier = getMembershipTier(
        { id: 'gold-10k', price: 10000, name: 'Executive Pro' },
        null,
        customMultipliers
      );
      expect(tier.multiplier).toBe(6.0);
      expect(tier.taskMultiplier).toBe(6.0);
      expect(tier.loginMultiplier).toBe(6.0);
    });

    it('should allow Admin to adjust multipliers for any tier dynamically', () => {
      const customMultipliers = {
        ...DEFAULT_PLAN_MULTIPLIERS,
        '3500': 2.0,
        '5000': 3.0,
        '7500': 4.5,
        '25000': 15.0,
        '50000': 30.0,
      };

      const tier3500 = getMembershipTier({ price: 3500 }, null, customMultipliers);
      expect(tier3500.multiplier).toBe(2.0);

      const tier5000 = getMembershipTier({ price: 5000 }, null, customMultipliers);
      expect(tier5000.multiplier).toBe(3.0);

      const tier7500 = getMembershipTier({ price: 7500 }, null, customMultipliers);
      expect(tier7500.multiplier).toBe(4.5);

      const tier25k = getMembershipTier({ price: 25000 }, null, customMultipliers);
      expect(tier25k.multiplier).toBe(15.0);

      const tier50k = getMembershipTier({ price: 50000 }, null, customMultipliers);
      expect(tier50k.multiplier).toBe(30.0);
    });

    it('should never allow ₹2,000 anchor to be altered even if passed erroneously', () => {
      const modifiedMultipliers = {
        ...DEFAULT_PLAN_MULTIPLIERS,
        '2000': 9.9, // Attempt to corrupt baseline
      };
      const tier = getMembershipTier({ price: 2000 }, null, modifiedMultipliers);
      expect(tier.multiplier).toBe(1.0); // Baseline lock invariant
    });
  });

  describe('Earnings Calculations (Base & Multiplier Scaling)', () => {
    it('should calculate baseline earnings correctly for ₹2,000 plan', () => {
      const earnings = calculateEarnings(2000);
      expect(earnings.multiplier).toBe(1.0);
      expect(earnings.daily).toBe(100);
      expect(earnings.monthly).toBe(3000);
      expect(earnings.tasksPerDay).toBe(10);
      expect(earnings.perTask).toBe(10);
    });

    it('should scale earnings correctly when custom multiplier is applied (5.5x)', () => {
      const earnings = calculateEarnings(10000, 5.5);
      expect(earnings.multiplier).toBe(5.5);
      expect(earnings.daily).toBe(100 * 5.5); // ₹550/day
      expect(earnings.monthly).toBe(3000 * 5.5); // ₹16,500/month
      expect(earnings.tasksPerDay).toBe(10);
      expect(earnings.perTask).toBe(10 * 5.5); // ₹55/task
    });

    it('should scale earnings correctly when 6.0x multiplier is applied', () => {
      const earnings = calculateEarnings(10000, 6.0);
      expect(earnings.multiplier).toBe(6.0);
      expect(earnings.daily).toBe(600);
      expect(earnings.monthly).toBe(18000);
      expect(earnings.perTask).toBe(60);
    });
  });

  describe('Withdrawal Eligibility & Trial Rules', () => {
    it('should calculate Sunday status correctly', () => {
      const status = getNextSundayStatus();
      expect(status).toHaveProperty('isOpen');
      expect(status).toHaveProperty('nextSunday');
      expect(status).toHaveProperty('windowStart');
      expect(status).toHaveProperty('windowEnd');
      expect(typeof status.isOpen).toBe('boolean');
    });

    it('should allow trial members to withdraw with ₹0 minimum (zero threshold rule)', () => {
      const trialEligibility = canUserWithdrawToday({
        isTrialMember: true,
        trialWithdrawalClaimed: false,
        balance: 150, // Below standard ₹500 minimum
        overrideSundayCheck: true,
      });

      expect(trialEligibility.allowed).toBe(true);
      expect(trialEligibility.isTrialExemption).toBe(true);
    });

    it('should block trial members if they already claimed their lifetime trial withdrawal', () => {
      const trialEligibility = canUserWithdrawToday({
        isTrialMember: true,
        trialWithdrawalClaimed: true, // Already used once in lifetime
        balance: 300,
        overrideSundayCheck: true,
      });

      expect(trialEligibility.allowed).toBe(false);
      expect(trialEligibility.reason).toContain('once in a lifetime');
    });

    it('should enforce standard ₹500 minimum for non-trial members', () => {
      const normalEligibility = canUserWithdrawToday({
        isTrialMember: false,
        balance: 400, // Below ₹500
        overrideSundayCheck: true,
      });

      expect(normalEligibility.allowed).toBe(false);
      expect(normalEligibility.reason).toContain('Minimum withdrawal');
    });

    it('should allow standard members with sufficient balance on valid days', () => {
      const normalEligibility = canUserWithdrawToday({
        isTrialMember: false,
        balance: 1500,
        overrideSundayCheck: true,
      });

      expect(normalEligibility.allowed).toBe(true);
    });
  });

  describe('Currency Formatters', () => {
    it('should format INR numbers cleanly', () => {
      expect(formatINR(2000)).toContain('2,000');
      expect(formatINR(10000)).toContain('10,000');
      expect(formatINR(0)).toContain('0');
    });

    it('should format compact INR correctly', () => {
      expect(formatCompactINR(2000)).toBe('₹2K');
      expect(formatCompactINR(10000)).toBe('₹10K');
      expect(formatCompactINR(500)).toBe('₹500');
    });
  });
});
