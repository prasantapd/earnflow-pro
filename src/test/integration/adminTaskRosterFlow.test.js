import { describe, it, expect } from 'vitest';
import { getMembershipTier, DEFAULT_PLAN_MULTIPLIERS } from '../../utils/finance.js';

describe('Integration Tests: Admin Task Roster Authoring & Multiplier Cascade', () => {
  // Simulates Admin authoring daily tasks for ₹2,000 members
  let dailyTaskRoster = [
    {
      id: 'task-yt-01',
      title: 'Watch Luxury Product Ad',
      category: 'Video',
      baseReward: 50, // Base reward authored for ₹2,000 members
      duration: 30,
    },
    {
      id: 'task-quiz-02',
      title: 'Brand Knowledge Quiz',
      category: 'Quiz',
      baseReward: 30,
      duration: 20,
    },
  ];

  // Helper calculating user task payout
  const resolveUserTaskPayout = (task, memberTier) => {
    const effectiveMultiplier = (task.multiplierOverride && task.multiplierOverride > 0)
      ? task.multiplierOverride
      : memberTier.taskMultiplier;
    return +(task.baseReward * effectiveMultiplier).toFixed(2);
  };

  it('cascades base rewards to ₹2,000 and ₹300 trial members at 1.0x', () => {
    const tier2000 = getMembershipTier({ price: 2000 });
    const tierTrial = getMembershipTier({ amount: 300, isTrial: true });

    expect(resolveUserTaskPayout(dailyTaskRoster[0], tier2000)).toBe(50);
    expect(resolveUserTaskPayout(dailyTaskRoster[0], tierTrial)).toBe(50);
    expect(resolveUserTaskPayout(dailyTaskRoster[1], tier2000)).toBe(30);
    expect(resolveUserTaskPayout(dailyTaskRoster[1], tierTrial)).toBe(30);
  });

  it('cascades base rewards to ₹10,000 members when multiplier is changed from 5.0x to 5.5x', () => {
    const defaultTier10k = getMembershipTier({ price: 10000 });
    expect(resolveUserTaskPayout(dailyTaskRoster[0], defaultTier10k)).toBe(250); // 50 * 5.0

    // Admin updates ₹10,000 multiplier to 5.5x
    const adminMultipliers55 = { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 5.5 };
    const tier10k_55 = getMembershipTier({ price: 10000 }, null, adminMultipliers55);
    expect(resolveUserTaskPayout(dailyTaskRoster[0], tier10k_55)).toBe(275); // 50 * 5.5
    expect(resolveUserTaskPayout(dailyTaskRoster[1], tier10k_55)).toBe(165); // 30 * 5.5
  });

  it('cascades base rewards to ₹10,000 members when multiplier is set to 6.0x', () => {
    const adminMultipliers60 = { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 6.0 };
    const tier10k_60 = getMembershipTier({ price: 10000 }, null, adminMultipliers60);
    expect(resolveUserTaskPayout(dailyTaskRoster[0], tier10k_60)).toBe(300); // 50 * 6.0
    expect(resolveUserTaskPayout(dailyTaskRoster[1], tier10k_60)).toBe(180); // 30 * 6.0
  });

  it('allows Admin to edit an individual task base reward and duration', () => {
    // Admin edits task-yt-01 base reward to ₹80
    dailyTaskRoster = dailyTaskRoster.map((t) => {
      if (t.id === 'task-yt-01') {
        return { ...t, baseReward: 80, duration: 45 };
      }
      return t;
    });

    const tier2000 = getMembershipTier({ price: 2000 });
    const tier10k_55 = getMembershipTier({ price: 10000 }, null, { ...DEFAULT_PLAN_MULTIPLIERS, '10000': 5.5 });

    expect(resolveUserTaskPayout(dailyTaskRoster[0], tier2000)).toBe(80); // ₹80 base for ₹2000 member
    expect(resolveUserTaskPayout(dailyTaskRoster[0], tier10k_55)).toBe(440); // 80 * 5.5 = ₹440 for ₹10k member
  });

  it('honors Admin individual task multiplier booster override over plan tier multipliers', () => {
    // Admin sets a special 3.0x booster on quiz task
    const boostedTask = {
      ...dailyTaskRoster[1],
      multiplierOverride: 3.0,
    };

    const tier2000 = getMembershipTier({ price: 2000 });
    const tier10k = getMembershipTier({ price: 10000 });

    // Both get the 3.0x task booster override
    expect(resolveUserTaskPayout(boostedTask, tier2000)).toBe(90); // 30 * 3.0
    expect(resolveUserTaskPayout(boostedTask, tier10k)).toBe(90); // 30 * 3.0
  });
});
