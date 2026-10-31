import { db } from './db.js';

export async function handleApiRequest(pathname, method, body = {}) {
  const normPath = pathname.replace(/\/+$/, ''); // strip trailing slash
  const key = `${method.toUpperCase()} ${normPath}`;

  try {
    switch (key) {
      case 'GET /api/health':
        return { status: 200, data: { status: 'ok', timestamp: Date.now() } };

      case 'GET /api/sync':
        return { status: 200, data: db.getState() };

      case 'POST /api/sync':
        return { status: 200, data: db.syncState(body) };

      case 'POST /api/register':
        return { status: 200, data: db.registerUser(body) };

      case 'POST /api/login':
        return { status: 200, data: db.loginUser(body.identifier, body.password) };

      case 'POST /api/user/status':
        return { status: 200, data: db.updateUserStatus(body.userId, body.status, body.reason, body.extraFields || (body.password ? { password: body.password } : {})) };

      case 'POST /api/user/delete':
        return { status: 200, data: db.deleteUser(body.userId) };

      case 'POST /api/deposit/submit':
        return { status: 200, data: db.submitDeposit(body) };

      case 'POST /api/deposit/review':
        return { status: 200, data: db.reviewDeposit(body.depositId, body.action, body.reason) };

      case 'POST /api/withdrawal/submit':
        return { status: 200, data: db.submitWithdrawal(body) };

      case 'POST /api/withdrawal/review':
        return { status: 200, data: db.reviewWithdrawal(body.withdrawalId, body.action, body.utr, body.reason) };

      case 'POST /api/password-reset/request':
        return { status: 200, data: db.requestPasswordReset(body.identifier) };

      case 'POST /api/password-reset/resolve':
        return { status: 200, data: db.resolvePasswordReset(body.requestId, body.tempPassword) };

      case 'GET /api':
        return { status: 200, data: { status: 'ok', server: 'EarnFlow Pro Backend API' } };

      case 'GET /api/deposits':
        return { status: 200, data: db.getState().depositRequests || [] };

      case 'POST /api/deposits':
        return { status: 200, data: db.submitDeposit(body) };

      case 'GET /api/users':
        return { status: 200, data: db.getState().allUsers || [] };

      case 'GET /api/plans':
        return { status: 200, data: db.getState().plans || [] };

      default:
        return { status: 404, data: { error: 'Not Found', path: pathname, method } };
    }
  } catch (err) {
    console.error('API Error:', err);
    return { status: 500, data: { error: 'Internal Server Error', message: err.message } };
  }
}
