const handlers = {
  'auth-login': require('./_auth-login'),
  'auth-register': require('./_auth-register'),
  'auth-change-password': require('./_auth-change-password'),
  'giphy-search': require('./_giphy-search'),
  'hf-proxy': require('./_hf-proxy'),
  'sync-data': require('./_sync-data'),
  'zchat-contacts': require('./_zchat-contacts'),
  'zchat-conversations': require('./_zchat-conversations'),
  'zchat-handle': require('./_zchat-handle'),
  'zchat-lookup': require('./_zchat-lookup'),
  'zchat-messages': require('./_zchat-messages'),
  'zchat-presence': require('./_zchat-presence'),
  'zchat-push-subscribe': require('./_zchat-push-subscribe'),
  'zchat-push-unsubscribe': require('./_zchat-push-unsubscribe'),
  'zchat-push-vapid': require('./_zchat-push-vapid'),
  'zchat-requests': require('./_zchat-requests'),
  'zchat-status': require('./_zchat-status'),
  'zchat-typing': require('./_zchat-typing'),
  'zchat-webrtc': require('./_zchat-webrtc')
};

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
