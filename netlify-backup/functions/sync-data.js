// ══════════════════════════════════════════════════════
// ZEN ACCOUNT — Sync dati (profilo + chat)
// GET  /.netlify/functions/sync-data      → scarica i dati dell'account
// POST /.netlify/functions/sync-data      → salva profilo/chat/usage
// Richiede header: Authorization: Bearer <token>
// ══════════════════════════════════════════════════════
const { getStore, connectLambda } = require('@netlify/blobs');
const { verifyToken, getTokenFromEvent, jsonResponse } = require('./_session');

exports.handler = async (event) => {
  connectLambda(event); // richiesto in Lambda compatibility mode prima di usare getStore()
  if (event.httpMethod === 'OPTIONS') return jsonResponse(200, {});

  const token = getTokenFromEvent(event);
  const payload = verifyToken(token);
  if (!payload || !payload.username) return jsonResponse(401, { error: 'Sessione non valida. Accedi di nuovo.' });

  const store = getStore('zen-accounts');
  const key = `user:${payload.username}`;
  const account = await store.get(key, { type: 'json' });
  if (!account) return jsonResponse(404, { error: 'Account non trovato.' });

  if (event.httpMethod === 'GET') {
    const { passwordHash: _omit, ...safeAccount } = account;
    return jsonResponse(200, { account: safeAccount });
  }

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch (e) { return jsonResponse(400, { error: 'JSON non valido.' }); }

    // Solo questi campi possono essere aggiornati via sync — mai passwordHash o username
    const updatable = ['name', 'avatar', 'plan', 'chats', 'usage', 'designs', 'designInbox', 'zchatHandle', 'zchatHandleCreatedAt', 'zchatContacts', 'zchatAiChat', 'zchatSettings', 'zchatE2ePublicKey', 'zchatAcceptedChats', 'zchatBlocks', 'zchatIncomingRequests', 'zchatStatus', 'zchatCallHistory', 'zchatPin', 'zchatKnownDevices'];
    const updated = { ...account };
    for (const field of updatable) {
      if (body[field] !== undefined) updated[field] = body[field];
    }
    updated.updatedAt = new Date().toISOString();

    await store.setJSON(key, updated);
    const { passwordHash: _omit2, ...safeAccount } = updated;
    return jsonResponse(200, { account: safeAccount });
  }

  return jsonResponse(405, { error: 'Metodo non permesso.' });
};
