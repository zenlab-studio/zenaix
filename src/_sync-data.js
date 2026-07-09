const { getStore } = require('./_db');
const { verifyToken, getTokenFromReq } = require('./_session');
const { cors, parseBody } = require('./_zchat');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = getTokenFromReq(req);
  const payload = verifyToken(token);
  if (!payload || !payload.username) return res.status(401).json({ error: 'Sessione non valida. Accedi di nuovo.' });

  const store = getStore('zen-accounts');
  const key = `user:${payload.username}`;
  const account = await store.get(key, { type: 'json' });
  if (!account) return res.status(404).json({ error: 'Account non trovato.' });

  if (req.method === 'GET') {
    const { passwordHash: _omit, ...safeAccount } = account;
    return res.status(200).json({ account: safeAccount });
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'JSON non valido.' });

    const updatable = ['name', 'avatar', 'plan', 'chats', 'usage', 'designs', 'designInbox', 'zchatHandle', 'zchatHandleCreatedAt', 'zchatContacts', 'zchatAiChat', 'zchatSettings', 'zchatE2ePublicKey', 'zchatAcceptedChats', 'zchatBlocks', 'zchatIncomingRequests', 'zchatStatus', 'zchatCallHistory', 'zchatPin', 'zchatKnownDevices'];
    const updated = { ...account };
    for (const field of updatable) {
      if (body[field] !== undefined) updated[field] = body[field];
    }
    updated.updatedAt = new Date().toISOString();

    await store.setJSON(key, updated);
    const { passwordHash: _omit2, ...safeAccount } = updated;
    return res.status(200).json({ account: safeAccount });
  }

  res.status(405).json({ error: 'Metodo non permesso.' });
};
