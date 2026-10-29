import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STATE = {
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
    upiQrUrl: '',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200089123456',
    ifsc: 'HDFC0000123',
    accountHolder: 'TaskCoin Technologies Pvt Ltd',
    instructions: '1. Transfer exact amount via PhonePe/GPay/Paytm/IMPS.\n2. Note 12-digit UTR/Ref No.\n3. Submit with receipt for instant Admin activation.',
    depositQrNote: 'Scan & Pay via any UPI App. Minimum deposit ₹2,000.',
  },
  adminAnnouncement: {
    active: true,
    message: '⚡ Welcome to EarnFlow Pro! 24/7 instant withdrawals & daily task earning active.',
    type: 'gold',
    updatedAt: new Date().toISOString(),
  },
  adminPassword: 'admin123',
  version: 1,
  lastUpdated: Date.now(),
};

// Load or initialize DB
let memoryDb = null;

function loadDb() {
  if (memoryDb) return memoryDb;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = { ...DEFAULT_STATE, ...JSON.parse(data) };
      return memoryDb;
    }
  } catch (err) {
    console.error('Error loading db.json, using default:', err);
  }
  memoryDb = { ...DEFAULT_STATE };
  saveDb();
  return memoryDb;
}

function saveDb() {
  try {
    memoryDb.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

export const db = {
  getState() {
    return loadDb();
  },

  syncState(incoming) {
    const current = loadDb();
    if (!incoming) return current;

    // Merge allUsers by ID
    const userMap = new Map();
    (current.allUsers || []).forEach(u => userMap.set(u.id, u));
    (incoming.allUsers || []).forEach(u => {
      if (!userMap.has(u.id)) {
        userMap.set(u.id, u);
      } else {
        // Keep the one with latest activity or active status
        const existing = userMap.get(u.id);
        userMap.set(u.id, { ...existing, ...u });
      }
    });

    // Merge deposit requests by ID
    const depMap = new Map();
    (current.depositRequests || []).forEach(d => depMap.set(d.id, d));
    (incoming.depositRequests || []).forEach(d => {
      if (!depMap.has(d.id)) {
        depMap.set(d.id, d);
      } else {
        const existing = depMap.get(d.id);
        depMap.set(d.id, { ...existing, ...d });
      }
    });

    // Merge withdrawal requests by ID
    const wdrMap = new Map();
    (current.withdrawalRequests || []).forEach(w => wdrMap.set(w.id, w));
    (incoming.withdrawalRequests || []).forEach(w => {
      if (!wdrMap.has(w.id)) {
        wdrMap.set(w.id, w);
      } else {
        const existing = wdrMap.get(w.id);
        wdrMap.set(w.id, { ...existing, ...w });
      }
    });

    // Merge password reset requests by ID
    const rstMap = new Map();
    (current.passwordResetRequests || []).forEach(r => rstMap.set(r.id, r));
    (incoming.passwordResetRequests || []).forEach(r => {
      if (!rstMap.has(r.id)) {
        rstMap.set(r.id, r);
      } else {
        const existing = rstMap.get(r.id);
        rstMap.set(r.id, { ...existing, ...r });
      }
    });

    // Merge plans
    const planMap = new Map();
    (current.plans || []).forEach(p => planMap.set(p.id, p));
    (incoming.plans || []).forEach(p => {
      if (!planMap.has(p.id)) {
        planMap.set(p.id, p);
      } else {
        const existing = planMap.get(p.id);
        planMap.set(p.id, { ...existing, ...p });
      }
    });

    memoryDb.allUsers = Array.from(userMap.values());
    memoryDb.depositRequests = Array.from(depMap.values());
    memoryDb.withdrawalRequests = Array.from(wdrMap.values());
    memoryDb.passwordResetRequests = Array.from(rstMap.values());
    memoryDb.plans = Array.from(planMap.values());

    if (incoming.paymentSettings) {
      memoryDb.paymentSettings = { ...current.paymentSettings, ...incoming.paymentSettings };
    }
    if (incoming.adminAnnouncement) {
      memoryDb.adminAnnouncement = { ...current.adminAnnouncement, ...incoming.adminAnnouncement };
    }
    if (incoming.adminPassword) {
      memoryDb.adminPassword = incoming.adminPassword;
    }

    saveDb();
    return memoryDb;
  },

  registerUser(userData) {
    const current = loadDb();
    const emailLower = (userData.email || '').trim().toLowerCase();
    const phoneTrim = (userData.phone || '').trim();

    // Check duplicate
    const existing = (current.allUsers || []).find(
      u => (u.email && u.email.toLowerCase() === emailLower) || (u.phone && u.phone === phoneTrim)
    );
    if (existing) {
      return { success: false, message: 'An account already exists with this Email or Mobile Number.' };
    }

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const refCode = userData.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) + Math.floor(100 + Math.random() * 900);

    const newUser = {
      id: newId,
      name: userData.name.trim(),
      email: emailLower,
      phone: phoneTrim,
      password: userData.password,
      referralCode: userData.referralCode || refCode,
      joinedDate: new Date().toISOString(),
      status: 'PENDING_ACTIVATION',
      isActivated: false,
      suspensionReason: '',
      isVerified: false,
      totalDeposited: 0,
      walletBalance: 0.00,
    };

    current.allUsers = [newUser, ...(current.allUsers || [])];
    saveDb();
    return { success: true, user: newUser };
  },

  loginUser(identifier, password) {
    const current = loadDb();
    const idClean = (identifier || '').trim().toLowerCase();
    const matched = (current.allUsers || []).find(
      u => (u.email && u.email.toLowerCase() === idClean) || (u.phone && u.phone.trim() === (identifier || '').trim())
    );

    if (!matched) {
      return { success: false, message: 'No account found with this Mobile/Email.' };
    }
    if (matched.password !== password) {
      return { success: false, message: 'Incorrect password. Please re-enter.' };
    }
    if (matched.status === 'SUSPENDED') {
      return { success: false, message: `Account suspended: ${matched.suspensionReason || 'Contact support'}` };
    }
    if (matched.status === 'DEACTIVATED') {
      return { success: false, message: 'Account is deactivated.' };
    }

    return { success: true, user: matched };
  },

  updateUserStatus(userId, status, reason = '', extraFields = {}) {
    const current = loadDb();
    let updatedUser = null;
    current.allUsers = (current.allUsers || []).map(u => {
      if (u.id === userId) {
        updatedUser = {
          ...u,
          ...(extraFields || {}),
        };
        if (status && status !== 'PASSWORD_RESET') {
          updatedUser.status = status;
          updatedUser.isActivated = status === 'ACTIVE';
          updatedUser.suspensionReason = status === 'SUSPENDED' ? reason : '';
        }
        return updatedUser;
      }
      return u;
    });
    saveDb();
    return { success: Boolean(updatedUser), user: updatedUser };
  },

  deleteUser(userId) {
    const current = loadDb();
    current.allUsers = (current.allUsers || []).filter(u => u.id !== userId);
    saveDb();
    return { success: true };
  },

  submitDeposit(depositData) {
    const current = loadDb();
    const depositRef = depositData.id || `DEP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      id: depositRef,
      userId: depositData.userId || 'USR-GUEST',
      userName: depositData.userName || 'Member',
      userPhone: depositData.userPhone || '',
      amount: Number(depositData.amount) || 0,
      planMonths: depositData.planMonths || 1,
      planDays: depositData.planDays || 30,
      planTitle: depositData.planTitle || 'Tier Plan',
      isUpgrade: Boolean(depositData.isUpgrade),
      previousPlanId: depositData.previousPlanId || null,
      utr: depositData.utr || `UTR${Date.now().toString().slice(-10)}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      rejectionReason: '',
    };

    current.depositRequests = [newReq, ...(current.depositRequests || [])];
    saveDb();
    return { success: true, deposit: newReq };
  },

  reviewDeposit(depositId, action, reason = '') {
    const current = loadDb();
    const req = (current.depositRequests || []).find(d => d.id === depositId);
    if (!req) return { success: false, message: 'Deposit not found' };

    if (action === 'APPROVE') {
      req.status = 'APPROVED';
      const startDate = new Date();
      const totalDays = req.planDays || req.planMonths * 30;
      const maturityDate = new Date();
      maturityDate.setDate(startDate.getDate() + totalDays);

      const approvedPlan = {
        id: `PLN-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: req.userId,
        userName: req.userName,
        userPhone: req.userPhone || '',
        title: req.planTitle,
        amount: req.amount,
        months: req.planMonths,
        days: totalDays,
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
        totalExpectedGain: req.amount * (req.planMonths * 0.15 + 1),
        dailyQuota: (req.amount * 0.15) / 30,
        earnedSoFar: 0,
        status: 'active',
        isUpgrade: req.isUpgrade,
        depositRef: req.id,
        utr: req.utr,
      };

      current.plans = [approvedPlan, ...(current.plans || []).filter(p => p.depositRef !== req.id)];

      // Activate User
      current.allUsers = (current.allUsers || []).map(u => {
        if (u.id === req.userId || u.name === req.userName || (u.phone && req.userPhone && u.phone === req.userPhone)) {
          return {
            ...u,
            status: 'ACTIVE',
            isActivated: true,
            isVerified: true,
            totalDeposited: (u.totalDeposited || 0) + req.amount,
          };
        }
        return u;
      });

      saveDb();
      return { success: true, status: 'APPROVED', plan: approvedPlan };
    } else {
      req.status = 'REJECTED';
      req.rejectionReason = reason || 'Payment not verified';
      saveDb();
      return { success: true, status: 'REJECTED', reason: req.rejectionReason };
    }
  },

  submitWithdrawal(withdrawalData) {
    const current = loadDb();
    const wdrId = withdrawalData.id || `WDR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      id: wdrId,
      userId: withdrawalData.userId || 'USR-GUEST',
      userName: withdrawalData.userName || 'Member',
      userPhone: withdrawalData.userPhone || '',
      userEmail: withdrawalData.userEmail || '',
      amount: Number(withdrawalData.amount) || 0,
      type: withdrawalData.type || 'TASK_REWARD',
      payoutDetails: withdrawalData.payoutDetails || {},
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      rejectionReason: '',
      disbursedUtr: '',
    };

    current.withdrawalRequests = [newReq, ...(current.withdrawalRequests || [])];
    saveDb();
    return { success: true, withdrawal: newReq };
  },

  reviewWithdrawal(withdrawalId, action, utr = '', reason = '') {
    const current = loadDb();
    const req = (current.withdrawalRequests || []).find(w => w.id === withdrawalId);
    if (!req) return { success: false, message: 'Withdrawal not found' };

    if (action === 'APPROVE') {
      req.status = 'APPROVED';
      req.disbursedUtr = utr || `IMPS${Date.now().toString().slice(-9)}`;
      saveDb();
      return { success: true, status: 'APPROVED', utr: req.disbursedUtr };
    } else {
      req.status = 'REJECTED';
      req.rejectionReason = reason || 'Declined by Admin';
      saveDb();
      return { success: true, status: 'REJECTED', reason: req.rejectionReason };
    }
  },

  requestPasswordReset(identifier) {
    const current = loadDb();
    const rawInput = (identifier || '').trim();
    if (!rawInput) return { success: false, message: 'Empty input' };

    const inputLower = rawInput.toLowerCase();
    const inputDigits = rawInput.replace(/\D/g, '');

    const matchedUser = (current.allUsers || []).find(u => {
      if (u.email && u.email.toLowerCase() === inputLower) return true;
      if (u.phone && u.phone.trim() === rawInput) return true;
      const uDigits = (u.phone || '').replace(/\D/g, '');
      if (inputDigits && uDigits) {
        if (inputDigits === uDigits) return true;
        if (inputDigits.length >= 10 && uDigits.endsWith(inputDigits.slice(-10))) return true;
        if (uDigits.length >= 10 && inputDigits.endsWith(uDigits.slice(-10))) return true;
      }
      return false;
    });

    if (!matchedUser) {
      return { success: false, message: 'User not found' };
    }

    const newReq = {
      id: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: matchedUser.id,
      userName: matchedUser.name,
      userPhone: matchedUser.phone,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    current.passwordResetRequests = [newReq, ...(current.passwordResetRequests || [])];
    saveDb();
    return { success: true, request: newReq, user: matchedUser };
  },

  resolvePasswordReset(requestId, customTempPassword) {
    const current = loadDb();
    const req = (current.passwordResetRequests || []).find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found' };

    const tempPass = customTempPassword || `Task@${Math.floor(1000 + Math.random() * 9000)}`;

    current.allUsers = (current.allUsers || []).map(u => {
      if (u.id === req.userId) {
        return { ...u, password: tempPass };
      }
      return u;
    });

    req.status = 'RESOLVED';
    req.resolvedAt = new Date().toISOString();
    req.tempPassword = tempPass;

    saveDb();
    return { success: true, phone: req.userPhone, tempPassword: tempPass };
  },
};
