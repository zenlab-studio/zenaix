const handlers = {
  'auth-login': './_auth-login',
  'auth-register': './_auth-register',
  'auth-change-password': './_auth-change-password',
  'giphy-search': './_giphy-search',
  'hf-proxy': './_hf-proxy',
  'sync-data': './_sync-data',
  'zchat-contacts': './_zchat-contacts',
  'zchat-conversations': './_zchat-conversations',
  'zchat-handle': './_zchat-handle',
  'zchat-lookup': './_zchat-lookup',
  'zchat-messages': './_zchat-messages',
  'zchat-presence': './_zchat-presence',
  'zchat-push-subscribe': './_zchat-push-subscribe',
  'zchat-push-unsubscribe': './_zchat-push-unsubscribe',
  'zchat-push-vapid': './_zchat-push-vapid',
  'zchat-requests': './_zchat-requests',
  'zchat-status': './_zchat-status',
  'zchat-typing': './_zchat-typing',
  'zchat-webrtc': './_zchat-webrtc'
};

const cache = {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const route = (req.url || '').replace(/^\/api\//, '').split('?')[0].split('/')[0];
  if (!route || !handlers[route]) {
    return res.status(404).json({ error: 'API endpoint non trovato.', route });
  }
  try {
    if (!cache[route]) {
      cache[route] = require(handlers[route]);
    }
    return await cache[route](req, res);
  } catch (err) {
    console.error(`[${route}]`, err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
