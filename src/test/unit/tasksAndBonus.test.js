import { describe, it, expect } from 'vitest';
import { getMembershipTier, DEFAULT_PLAN_MULTIPLIERS } from '../../utils/finance.js';

describe('Unit Tests: Tasks & Daily Login Bonus Multipliers', () => {
  const sampleTask = {
    id: 'yt-task-01',
    title: 'Watch Luxury Product Ad',
    baseReward: 50, // Base authored for ₹2,000 members
    duration: 30,
  };

  const loginStreakDays = [
    { day: 1, baseAmount: 20 },
    { day: 7, baseAmount: 100 },
    { day: 14, baseAmount: 250 },
    { day: 30, baseAmount: 1000 },
  ];

  describe('Task Reward Calculations per Tier', () => {
    it('calculates reward for ₹2,000 member as base (1.0x)', () => {
      const tier = getMembershipTier({ price: 2000 });
      const payout = sampleTask.baseReward * tier.taskMultiplier;
      expect(payout).toBe(50);
    });

    it('calculates reward for ₹300 trial member as base (1.0x)', () => {
      const tier = getMembershipTier(null, { isTrialActive: true, trialPlan: { price: 300 } });
      const payout = sampleTask.baseReward * tier.taskMultiplier;
      expect(payout).toBe(50);
    });

    it('calculates reward for ₹10,000 member with default 5.0x multiplier', () => {
      const tier = getMembershipTier({ price: 10000 });
      const payout = sampleTask.baseReward * tier.taskMultiplier;
      expect(payout).toBe(250);
    });

    it('calculates reward for ₹10,000 member when Admin sets 5.5x multiplier', () => {
      const customMultipliers = { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 5.5 };
      const tier = getMembershipTier({ price: 10000 }, null, customMultipliers);
      const payout = sampleTask.baseReward * tier.taskMultiplier;
      expect(payout).toBe(275);
    });

    it('calculates reward for ₹10,000 member when Admin sets 6.0x multiplier', () => {
      const customMultipliers = { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 6.0 };
      const tier = getMembershipTier({ price: 10000 }, null, customMultipliers);
      const payout = sampleTask.baseReward * tier.taskMultiplier;
      expect(payout).toBe(300);
    });

    it('respects task-level multiplierOverride booster regardless of member plan', () => {
      const boostedTask = {
        ...sampleTask,
        multiplierOverride: 2.5, // Special flash task booster
      };

      const tier2000 = getMembershipTier({ price: 2000 });
      const tier10k = getMembershipTier({ price: 10000 });

      // If task has booster, booster overrides or scales
      const getPayout = (task, tier) => {
        const mult = task.multiplierOverride || tier.taskMultiplier;
        return task.baseReward * mult;
      };

      expect(getPayout(boostedTask, tier2000)).toBe(125); // 50 * 2.5
      expect(getPayout(boostedTask, tier10k)).toBe(125); // Booster overrides standard tier
      expect(getPayout(sampleTask, tier10k)).toBe(250); // Standard task uses tier 5.0x
    });
  });

  describe('Daily Login Streak Bonus Calculations', () => {
    it('calculates Day 1 to Day 30 login bonuses for ₹2,000 member (1.0x)', () => {
      const tier = getMembershipTier({ price: 2000 });
      loginStreakDays.forEach(({ day, baseAmount }) => {
        const payout = Math.round(baseAmount * tier.loginMultiplier);
        expect(payout).toBe(baseAmount);
      });
    });

    it('calculates Day 1 to Day 30 login bonuses for ₹10,000 member with 5.5x multiplier', () => {
      const customMultipliers = { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 5.5 };
      const tier = getMembershipTier({ price: 10000 }, null, customMultipliers);

      expect(Math.round(20 * tier.loginMultiplier)).toBe(110); // Day 1: 20 * 5.5 = 110
      expect(Math.round(100 * tier.loginMultiplier)).toBe(550); // Day 7: 100 * 5.5 = 550
      expect(Math.round(250 * tier.loginMultiplier)).toBe(1375); // Day 14: 250 * 5.5 = 1375
      expect(Math.round(1000 * tier.loginMultiplier)).toBe(5500); // Day 30: 1000 * 5.5 = 5500
    });

    it('calculates Day 1 to Day 30 login bonuses for ₹10,000 member with 6.0x multiplier', () => {
      const customMultipliers = { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 6.0 };
      const tier = getMembershipTier({ price: 10000 }, null, customMultipliers);

      expect(Math.round(20 * tier.loginMultiplier)).toBe(120); // Day 1: 20 * 6 = 120
      expect(Math.round(100 * tier.loginMultiplier)).toBe(600); // Day 7: 100 * 6 = 600
      expect(Math.round(250 * tier.loginMultiplier)).toBe(1500); // Day 14: 250 * 6 = 1500
      expect(Math.round(1000 * tier.loginMultiplier)).toBe(6000); // Day 30: 1000 * 6 = 6000
    });
  });
});
