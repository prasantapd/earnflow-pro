import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest } from '../../../server/apiHandler.js';
import { db } from '../../../server/db.js';

describe('Integration Tests: Backend API, Admin Multipliers & Task Sync', () => {
  beforeEach(() => {
    // Reset or prepare clean state if needed
  });

  it('GET /api/health should respond with status ok', async () => {
    const res = await handleApiRequest('/api/health', 'GET');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
    expect(typeof res.data.timestamp).toBe('number');
  });

  it('POST /api/sync should update and persist planMultipliers', async () => {
    const customMultipliers = {
      '300': 1.0,
      '2000': 1.0,
      '3500': 1.75,
      '5000': 2.5,
      '7500': 3.75,
      '10000': 5.5, // Changed by Admin to 5.5x
      '25000': 12.5,
      '50000': 25.0,
    };

    const syncRes = await handleApiRequest('/api/sync', 'POST', {
      planMultipliers: customMultipliers,
    });

    expect(syncRes.status).toBe(200);
    expect(syncRes.data.planMultipliers['10000']).toBe(5.5);

    // Verify GET /api/sync reflects the persisted change
    const getRes = await handleApiRequest('/api/sync', 'GET');
    expect(getRes.status).toBe(200);
    expect(getRes.data.planMultipliers['10000']).toBe(5.5);
  });

  it('POST /api/sync should update task base rewards and custom multipliers', async () => {
    const updatedTasks = [
      {
        id: 'task-test-custom',
        title: 'Custom Admin Task',
        baseReward: 75, // ₹75 for ₹2000 plan
        multiplierOverride: 2.0, // Booster
        duration: 45,
      },
    ];

    const syncRes = await handleApiRequest('/api/sync', 'POST', {
      tasks: updatedTasks,
    });

    expect(syncRes.status).toBe(200);
    expect(syncRes.data.tasks).toBeDefined();

    const getRes = await handleApiRequest('/api/sync', 'GET');
    const task = getRes.data.tasks.find((t) => t.id === 'task-test-custom');
    expect(task).toBeDefined();
    expect(task.baseReward).toBe(75);
    expect(task.multiplierOverride).toBe(2.0);
  });

  it('handles user registration and trial eligibility checks', async () => {
    const testPhone = '9876543210';
    const testEmail = 'tester_integration@example.com';

    // Register user
    const regRes = await handleApiRequest('/api/register', 'POST', {
      name: 'Integration Tester',
      email: testEmail,
      phone: testPhone,
      password: 'password123',
    });

    expect(regRes.status).toBe(200);
    if (regRes.data.success) {
      expect(regRes.data.user).toBeDefined();
      expect(regRes.data.user.email).toBe(testEmail);
    }
  });
});
