import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { handleApiRequest } from '../../../server/apiHandler.js';
import { db } from '../../../server/db.js';

describe('End-to-End Live Sync: User Registration, Activation, Deposit Approval & Withdrawal Disbursal', () => {
  beforeEach(() => {
    // Reset db state to clean test state
    const cleanState = {
      allUsers: [],
      depositRequests: [],
      withdrawalRequests: [],
      passwordResetRequests: [],
      plans: [],
      transactions: [],
      paymentSettings: {
        upiId: 'taskcoin@ybl',
        upiPhone: '9876543210',
        upiName: 'TaskCoin Corporate Treasury',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200089123456',
        ifsc: 'HDFC0000123',
        accountHolder: 'TaskCoin Technologies Pvt Ltd',
      },
      planMultipliers: {
        300: 1.0,
        2000: 1.0,
        3500: 1.75,
        5000: 2.5,
      },
    };
    db.resetState(cleanState);
  });

  it('Flow 1: User registers -> Admin sees user in pending queue -> Admin activates user directly', async () => {
    // 1. User registers
    const regPayload = {
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      phone: '9876500001',
      password: 'RohanPassword@123',
    };
    const regRes = await handleApiRequest('/api/register', 'POST', regPayload);
    expect(regRes.status).toBe(200);
    expect(regRes.data.success).toBe(true);
    expect(regRes.data.user.status).toBe('PENDING_ACTIVATION');
    expect(regRes.data.user.isActivated).toBe(false);

    const userId = regRes.data.user.id;

    // 2. Admin inspects users
    const usersRes = await handleApiRequest('/api/users', 'GET');
    expect(usersRes.status).toBe(200);
    const rohan = usersRes.data.find((u) => u.id === userId);
    expect(rohan).toBeDefined();
    expect(rohan.status).toBe('PENDING_ACTIVATION');

    // 3. Admin activates user
    const actRes = await handleApiRequest('/api/user/status', 'POST', {
      userId,
      status: 'ACTIVE',
    });
    expect(actRes.status).toBe(200);
    expect(actRes.data.success).toBe(true);
    expect(actRes.data.user.status).toBe('ACTIVE');
    expect(actRes.data.user.isActivated).toBe(true);

    // 4. Verify GET /api/sync reflects the activated user
    const syncRes = await handleApiRequest('/api/sync', 'GET');
    const updatedUser = syncRes.data.allUsers.find((u) => u.id === userId);
    expect(updatedUser.status).toBe('ACTIVE');
    expect(updatedUser.isActivated).toBe(true);
  });

  it('Flow 2: User deposits with UTR -> Admin verifies & approves deposit -> Plan activates and user becomes ACTIVE', async () => {
    // 1. Register user
    const regRes = await handleApiRequest('/api/register', 'POST', {
      name: 'Priyanka Sen',
      email: 'priyanka@example.com',
      phone: '9876500002',
      password: 'Password@2026',
    });
    const user = regRes.data.user;

    // 2. User submits a 90-day deposit of ₹5,000 with UTR
    const depPayload = {
      id: 'DEP-TEST-9001',
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount: 5000,
      planMonths: 3,
      planDays: 90,
      planTitle: 'Quarterly Growth Tier',
      utr: 'UTR987654321012',
    };
    const depRes = await handleApiRequest('/api/deposit/submit', 'POST', depPayload);
    expect(depRes.status).toBe(200);
    expect(depRes.data.success).toBe(true);
    expect(depRes.data.deposit.status).toBe('PENDING');

    // 3. Admin inspects deposit requests queue
    const depositsRes = await handleApiRequest('/api/deposits', 'GET');
    expect(depositsRes.status).toBe(200);
    const pendingDep = depositsRes.data.find((d) => d.id === 'DEP-TEST-9001');
    expect(pendingDep).toBeDefined();
    expect(pendingDep.amount).toBe(5000);
    expect(pendingDep.planDays).toBe(90);
    expect(pendingDep.utr).toBe('UTR987654321012');

    // 4. Admin reviews and APPROVES deposit
    const reviewRes = await handleApiRequest('/api/deposit/review', 'POST', {
      depositId: 'DEP-TEST-9001',
      action: 'APPROVE',
    });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.data.success).toBe(true);
    expect(reviewRes.data.status).toBe('APPROVED');
    expect(reviewRes.data.plan).toBeDefined();
    expect(reviewRes.data.plan.amount).toBe(5000);
    expect(reviewRes.data.plan.days).toBe(90);
    expect(reviewRes.data.plan.status).toBe('active');

    // 5. Verify User is now ACTIVE and totalDeposited is ₹5,000
    const syncRes = await handleApiRequest('/api/sync', 'GET');
    const updatedPriyanka = syncRes.data.allUsers.find((u) => u.id === user.id);
    expect(updatedPriyanka.status).toBe('ACTIVE');
    expect(updatedPriyanka.isActivated).toBe(true);
    expect(updatedPriyanka.totalDeposited).toBe(5000);

    // 6. Verify Active Plan in DB
    const userPlan = syncRes.data.plans.find((p) => p.userId === user.id && p.status === 'active');
    expect(userPlan).toBeDefined();
    expect(userPlan.amount).toBe(5000);
    expect(userPlan.days).toBe(90);
    expect(userPlan.depositRef).toBe('DEP-TEST-9001');
  });

  it('Flow 3: User requests withdrawal -> Admin disburses with IMPS UTR -> Ledger updates to COMPLETED', async () => {
    // 1. Create active user with wallet balance of ₹1,200
    const regRes = await handleApiRequest('/api/register', 'POST', {
      name: 'Amitabh Roy',
      email: 'amitabh@example.com',
      phone: '9876500003',
      password: 'Amitabh@123',
    });
    const user = regRes.data.user;

    // Credit wallet balance to user
    await handleApiRequest('/api/user/status', 'POST', {
      userId: user.id,
      status: 'ACTIVE',
      extraFields: { walletBalance: 1200 },
    });

    // 2. User requests withdrawal of ₹500
    const wdrPayload = {
      id: 'WDR-TEST-7001',
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount: 500,
      type: 'TASK_REWARD',
      payoutDetails: {
        type: 'upi_id',
        upiId: 'amitabh@okaxis',
        holderName: 'Amitabh Roy',
      },
    };
    const wdrRes = await handleApiRequest('/api/withdrawal/submit', 'POST', wdrPayload);
    expect(wdrRes.status).toBe(200);
    expect(wdrRes.data.success).toBe(true);
    expect(wdrRes.data.withdrawal.status).toBe('PENDING');

    // 3. Verify server debited user's walletBalance from 1200 to 700
    const midSync = await handleApiRequest('/api/sync', 'GET');
    const midUser = midSync.data.allUsers.find((u) => u.id === user.id);
    expect(midUser.walletBalance).toBe(700);

    // 4. Admin reviews and APPROVES withdrawal with custom IMPS UTR
    const reviewRes = await handleApiRequest('/api/withdrawal/review', 'POST', {
      withdrawalId: 'WDR-TEST-7001',
      action: 'APPROVE',
      utr: 'IMPS20261031998877',
    });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.data.success).toBe(true);
    expect(reviewRes.data.status).toBe('APPROVED');
    expect(reviewRes.data.utr).toBe('IMPS20261031998877');

    // 5. Verify final status on server
    const finalSync = await handleApiRequest('/api/sync', 'GET');
    const approvedWdr = finalSync.data.withdrawalRequests.find((w) => w.id === 'WDR-TEST-7001');
    expect(approvedWdr.status).toBe('APPROVED');
    expect(approvedWdr.disbursedUtr).toBe('IMPS20261031998877');
  });

  it('Flow 4: Withdrawal rejected by Admin -> User wallet balance is accurately refunded', async () => {
    // 1. Create active user with wallet balance of ₹800
    const regRes = await handleApiRequest('/api/register', 'POST', {
      name: 'Sunita Das',
      email: 'sunita@example.com',
      phone: '9876500004',
      password: 'Sunita@123',
    });
    const user = regRes.data.user;

    await handleApiRequest('/api/user/status', 'POST', {
      userId: user.id,
      status: 'ACTIVE',
      extraFields: { walletBalance: 800 },
    });

    // 2. User requests withdrawal of ₹300
    await handleApiRequest('/api/withdrawal/submit', 'POST', {
      id: 'WDR-TEST-7002',
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount: 300,
      type: 'TASK_REWARD',
    });

    // Verify balance debited to 500
    let sync = await handleApiRequest('/api/sync', 'GET');
    let sunita = sync.data.allUsers.find((u) => u.id === user.id);
    expect(sunita.walletBalance).toBe(500);

    // 3. Admin rejects withdrawal due to incorrect UPI
    const rejRes = await handleApiRequest('/api/withdrawal/review', 'POST', {
      withdrawalId: 'WDR-TEST-7002',
      action: 'REJECT',
      reason: 'Invalid UPI ID format',
    });
    expect(rejRes.status).toBe(200);
    expect(rejRes.data.status).toBe('REJECTED');

    // 4. Verify balance refunded back to ₹800
    sync = await handleApiRequest('/api/sync', 'GET');
    sunita = sync.data.allUsers.find((u) => u.id === user.id);
    expect(sunita.walletBalance).toBe(800);

    const rejectedWdr = sync.data.withdrawalRequests.find((w) => w.id === 'WDR-TEST-7002');
    expect(rejectedWdr.status).toBe('REJECTED');
    expect(rejectedWdr.rejectionReason).toBe('Invalid UPI ID format');
  });

  it('Flow 5: Sync state protection guarantees active accounts and approved decisions are not downgraded', async () => {
    // 1. Setup active user and approved deposit in DB
    await handleApiRequest('/api/register', 'POST', {
      id: 'USR-SECURE-1',
      name: 'Secure User',
      email: 'secure@example.com',
      phone: '9876500005',
      password: 'Pass@123',
    });
    await handleApiRequest('/api/user/status', 'POST', {
      userId: 'USR-SECURE-1',
      status: 'ACTIVE',
      extraFields: { totalDeposited: 0, walletBalance: 400 },
    });
    await handleApiRequest('/api/deposit/submit', 'POST', {
      id: 'DEP-SECURE-1',
      userId: 'USR-SECURE-1',
      amount: 2000,
      status: 'APPROVED',
    });
    await handleApiRequest('/api/deposit/review', 'POST', {
      depositId: 'DEP-SECURE-1',
      action: 'APPROVE',
    });

    // 2. Simulate stale client sending an old state where user was PENDING_ACTIVATION and deposit was PENDING
    const stalePayload = {
      allUsers: [
        {
          id: 'USR-SECURE-1',
          name: 'Secure User',
          phone: '9876500005',
          status: 'PENDING_ACTIVATION',
          isActivated: false,
          totalDeposited: 0,
        },
      ],
      depositRequests: [
        {
          id: 'DEP-SECURE-1',
          userId: 'USR-SECURE-1',
          status: 'PENDING',
        },
      ],
    };

    const syncRes = await handleApiRequest('/api/sync', 'POST', stalePayload);
    expect(syncRes.status).toBe(200);

    // Verify server PROTECTED the ACTIVE status and APPROVED deposit from being downgraded!
    const verifiedUser = syncRes.data.allUsers.find((u) => u.id === 'USR-SECURE-1');
    expect(verifiedUser.status).toBe('ACTIVE');
    expect(verifiedUser.isActivated).toBe(true);
    expect(verifiedUser.totalDeposited).toBe(2000);

    const verifiedDep = syncRes.data.depositRequests.find((d) => d.id === 'DEP-SECURE-1');
    expect(verifiedDep.status).toBe('APPROVED');
  });
});
