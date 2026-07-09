const { getStore } = require('./_db');
const { verifyToken, getTokenFromReq } = require('./_session');

function normalizeHandle(handle) {
  return (handle || '').trim().toLowerCase().replace(/^@/, '');
}

function validateHandle(handle) {
  const h = normalizeHandle(handle);
  if (h.length < 3) return 'L\'handle deve avere almeno 3 caratteri.';
  if (h.length > 20) return 'L\'handle può avere massimo 20 caratteri.';
  if (!/^[a-z0-9_.]+$/.test(h)) return 'L\'handle può contenere solo lettere, numeri, punto e underscore.';
  return null;
}

function makeConvId(handleA, handleB) {
  return [normalizeHandle(handleA), normalizeHandle(handleB)].sort().join('_');
}

function msgId() {
  return 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

async function requireAuth(req, res) {
  const token = getTokenFromReq(req);
  const payload = verifyToken(token);
  if (!payload || !payload.username) {
    res.status(401).json({ error: 'Sessione non valida. Accedi di nuovo.' });
    return null;
  }
  const store = getStore('zen-accounts');
  const key = `user:${payload.username}`;
  const account = await store.get(key, { type: 'json' });
  if (!account) {
    res.status(404).json({ error: 'Account non trovato.' });
    return null;
  }
  return { payload, account, store, key };
}

async function getHandleIndex(handle) {
  const store = getStore('zchat-handles');
  return store.get(`handle:${normalizeHandle(handle)}`, { type: 'json' });
}

async function setHandleIndex(handle, data) {
  const store = getStore('zchat-handles');
  await store.setJSON(`handle:${normalizeHandle(handle)}`, data);
}

async function removeHandleIndex(handle) {
  const store = getStore('zchat-handles');
  await store.delete(`handle:${normalizeHandle(handle)}`);
}

async function getConversation(convId) {
  const store = getStore('zchat-conversations');
  return store.get(`conv:${convId}`, { type: 'json' });
}

async function saveConversation(convId, conv) {
  const store = getStore('zchat-conversations');
  conv.updatedAt = new Date().toISOString();
  await store.setJSON(`conv:${convId}`, conv);
  return conv;
}

function publicProfile(entry) {
  if (!entry) return null;
  return {
    handle: entry.handle || normalizeHandle(entry.handle),
    name: entry.name || entry.handle,
    avatar: entry.avatar || { type: 'initial', content: (entry.name || '?')[0].toUpperCase() },
    status: entry.status || null,
    online: entry.online || false,
    lastSeen: entry.lastSeen || null
  };
}

async function getAccountByUsername(username) {
  const store = getStore('zen-accounts');
  return store.get(`user:${username}`, { type: 'json' });
}

async function saveAccount(username, account) {
  const store = getStore('zen-accounts');
  account.updatedAt = new Date().toISOString();
  await store.setJSON(`user:${username}`, account);
  return account;
}

function isContact(account, handle) {
  const h = normalizeHandle(handle);
  return (account.zchatContacts || []).some(c => normalizeHandle(c.handle) === h);
}

function isAccepted(account, handle) {
  const h = normalizeHandle(handle);
  return (account.zchatAcceptedChats || []).includes(h);
}

function isBlocked(account, handle) {
  const h = normalizeHandle(handle);
  const block = (account.zchatBlocks || {})[h];
  return block && block.permanent;
}

function canReceiveFrom(recipient, senderHandle) {
  const h = normalizeHandle(senderHandle);
  if (isBlocked(recipient, h)) return { ok: false, reason: 'blocked' };
  if (isContact(recipient, h) || isAccepted(recipient, h)) return { ok: true };
  return { ok: false, reason: 'request' };
}

function parseBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  try { return JSON.parse(req.body || '{}'); }
  catch (e) { return null; }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
}

module.exports = {
  normalizeHandle,
  validateHandle,
  makeConvId,
  msgId,
  requireAuth,
  getHandleIndex,
  setHandleIndex,
  removeHandleIndex,
  getConversation,
  saveConversation,
  publicProfile,
  getAccountByUsername,
  saveAccount,
  isContact,
  isAccepted,
  isBlocked,
  canReceiveFrom,
  parseBody,
  cors
};
