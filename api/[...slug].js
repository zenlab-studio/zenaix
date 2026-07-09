const handlerNames = {
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

const handlerCache = {};

module.exports = async (req, res) => {
  const slug = req.query.slug || [];
  const route = Array.isArray(slug) ? slug[0] : slug;
  const modPath = handlerNames[route];
  if (!modPath) {
    return res.status(404).json({ error: 'API endpoint non trovato.', route });
  }
  try {
    if (!handlerCache[route]) {
      handlerCache[route] = require(modPath);
    }
    return await handlerCache[route](req, res);
  } catch (err) {
    console.error(`[${route}]`, err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
