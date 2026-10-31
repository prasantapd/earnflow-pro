import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskCenterView from '../../views/TaskCenterView';
import * as AppContextModule from '../../context/AppContext';

describe('Integration Tests: TaskCenterView Rendering & Stability', () => {
  it('renders TaskCenterView cleanly without throwing ReferenceError for progressPercent', () => {
    const mockContext = {
      user: { id: 'u1', name: 'Task Runner', email: 'runner@test.com' },
      rewardWallet: 350,
      tasksCompletedToday: { 'task-1': 50 },
      totalDailyQuota: 500,
      isWithdrawalAllowed: true,
      dailyTaskRoster: [
        { id: 'task-1', title: 'Watch Ad', status: 'ACTIVE', reward: 50, type: 'video', duration: 20 },
        { id: 'task-2', title: 'Focus Track', status: 'ACTIVE', reward: 30, type: 'music', duration: 20 },
      ],
      userMembershipTier: {
        taskMultiplier: 1.0,
        loginMultiplier: 1.0,
        tierBadge: 'Starter (₹2,000)',
      },
      activePlan: { id: 'plan-2000', amount: 2000, name: 'Starter' },
      pendingPlan: null,
      pendingDeposit: null,
      isUserActivated: true,
      canUserEarn: true,
      freeTrialStatus: null,
      showToast: vi.fn(),
      t: (key) => key,
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

    // Render component
    const { container } = render(
      <TaskCenterView
        onOpenWithdraw={vi.fn()}
        onOpenDeposit={vi.fn()}
        setActiveTab={vi.fn()}
      />
    );

    // Verify task completion progress is rendered correctly (1 / 2 Done = 50% Complete)
    expect(screen.getByText(/1 \/ 2 Done/i)).toBeInTheDocument();
    expect(screen.getByText(/50% Complete/i)).toBeInTheDocument();
  });

  it('renders 0% progress cleanly when no tasks are completed yet', () => {
    const mockContext = {
      user: { id: 'u2', name: 'Fresh Member' },
      rewardWallet: 0,
      tasksCompletedToday: {},
      dailyTaskRoster: [
        { id: 't1', title: 'Task 1', status: 'ACTIVE', reward: 40, type: 'video' },
      ],
      userMembershipTier: { taskMultiplier: 1.0 },
      activePlan: { id: 'p1', amount: 2000 },
      isUserActivated: true,
      canUserEarn: true,
      showToast: vi.fn(),
      t: (key) => key,
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);

    render(
      <TaskCenterView
        onOpenWithdraw={vi.fn()}
        onOpenDeposit={vi.fn()}
        setActiveTab={vi.fn()}
      />
    );

    expect(screen.getByText(/0 \/ 1 Done/i)).toBeInTheDocument();
    expect(screen.getAllByText(/0% Complete/i).length).toBeGreaterThan(0);
  });
});
