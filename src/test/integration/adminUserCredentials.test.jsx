import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPanelView from '../../views/AdminPanelView';
import * as AppContextModule from '../../context/AppContext';

describe('Integration Tests: Admin User Management Credentials & Password Visibility', () => {
  const mockUsers = [
    {
      id: 'USR-1001',
      name: 'Rahim Khan',
      email: 'rahim@example.com',
      phone: '9876543210',
      password: 'rahimSecretPass@2026',
      status: 'ACTIVE',
      totalDeposited: 2000,
      walletBalance: 450.50,
      joinedDate: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'USR-1002',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9123456780',
      password: 'priyaPassword#777',
      status: 'PENDING_ACTIVATION',
      totalDeposited: 300,
      walletBalance: 60.00,
      joinedDate: '2026-10-30T10:00:00.000Z',
    },
  ];

  const mockPlans = [
    { id: 'plan-1', userId: 'USR-1001', name: 'Starter Tier', amount: 2000, status: 'ACTIVE' },
    { id: 'plan-2', userId: 'USR-1002', name: '3-Day Trial Pass', amount: 300, isTrial: true, status: 'ACTIVE' },
  ];

  let mockShowToast;
  let mockResetUserPassword;
  let mockClipboardWrite;

  beforeEach(() => {
    mockShowToast = vi.fn();
    mockResetUserPassword = vi.fn();
    mockClipboardWrite = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText: mockClipboardWrite,
      },
    });

    const mockContext = {
      allUsers: mockUsers,
      plans: mockPlans,
      depositRequests: [],
      withdrawalRequests: [],
      activateUser: vi.fn(),
      deactivateUser: vi.fn(),
      suspendUser: vi.fn(),
      deleteUser: vi.fn(),
      resetUserPassword: mockResetUserPassword,
      approveDeposit: vi.fn(),
      rejectDeposit: vi.fn(),
      approveWithdrawal: vi.fn(),
      rejectWithdrawal: vi.fn(),
      totalLockedPrincipal: 2300,
      forceSunday: false,
      toggleForceSunday: vi.fn(),
      showToast: mockShowToast,
      dailyTaskRoster: [],
      dailyVideoTasks: [],
      taskRosterPresets: {},
      applyTaskRosterPreset: vi.fn(),
      addCustomDailyTask: vi.fn(),
      updateDailyTask: vi.fn(),
      deleteDailyTask: vi.fn(),
      toggleDailyTaskStatus: vi.fn(),
      gamingStats: { totalMatchesPlayed: 100 },
      paymentSettings: {},
      updatePaymentSettings: vi.fn(),
      adminAnnouncement: { active: false },
      updateAdminAnnouncement: vi.fn(),
      scheduledTasksByDate: {},
      addTaskForDate: vi.fn(),
      updateTaskForDate: vi.fn(),
      deleteTaskForDate: vi.fn(),
      toggleTaskStatusForDate: vi.fn(),
      copyTasksToDate: vi.fn(),
      applyPresetToDate: vi.fn(),
      adminPassword: 'admin',
      updateAdminPassword: vi.fn(),
      switchRole: vi.fn(),
      streakRewards: {},
      updateStreakRewards: vi.fn(),
      planMultipliers: { 300: 1.0, 2000: 1.0 },
      updatePlanMultipliers: vi.fn(),
      passwordResetRequests: [],
      resolvePasswordReset: vi.fn(),
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(mockContext);
  });

  it('renders user login details including phone, email, and password in user management', () => {
    render(<AdminPanelView />);

    // Verify User Management header and users are rendered
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText('Rahim Khan')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();

    // Verify phone numbers are present
    expect(screen.getByText('9876543210')).toBeInTheDocument();
    expect(screen.getByText('9123456780')).toBeInTheDocument();

    // Verify passwords or masked representation exists
    // With password visibility active or toggled, passwords must appear
    const passwordElements = screen.getAllByTestId('user-password-display');
    expect(passwordElements.length).toBe(2);
  });

  it('allows admin to toggle password visibility individually and in bulk', () => {
    render(<AdminPanelView />);

    // Check individual toggle buttons
    const toggleButtons = screen.getAllByTestId('toggle-password-btn');
    expect(toggleButtons.length).toBe(2);

    // Click toggle for the first user
    fireEvent.click(toggleButtons[0]);

    // Check bulk toggle button exists
    const bulkToggleBtn = screen.getByTestId('bulk-toggle-password-btn');
    expect(bulkToggleBtn).toBeInTheDocument();
    fireEvent.click(bulkToggleBtn);
  });

  it('allows admin to copy password and full login credentials to clipboard with 1-click', async () => {
    render(<AdminPanelView />);

    // Find 1-click copy password buttons
    const copyPassButtons = screen.getAllByTestId('copy-password-btn');
    expect(copyPassButtons.length).toBe(2);

    // Copy first user's password
    fireEvent.click(copyPassButtons[0]);
    expect(mockClipboardWrite).toHaveBeenCalledWith('rahimSecretPass@2026');

    // Find copy full credentials buttons
    const copyCredsButtons = screen.getAllByTestId('copy-credentials-btn');
    expect(copyCredsButtons.length).toBe(2);

    // Copy second user's credentials
    fireEvent.click(copyCredsButtons[1]);
    expect(mockClipboardWrite).toHaveBeenCalledWith(
      expect.stringContaining('9123456780')
    );
    expect(mockClipboardWrite).toHaveBeenCalledWith(
      expect.stringContaining('priyaPassword#777')
    );
  });
});
