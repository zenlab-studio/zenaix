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
  const slug = req.query.slug || [];
  const route = Array.isArray(slug) ? slug[0] : slug;
  const handler = handlers[route];
  if (handler) {
    try {
      return await handler(req, res);
    } catch (err) {
      console.error(`[${route}]`, err);
      res.status(500).json({ error: err.message, stack: err.stack });
    }
    return;
  }
  res.status(404).json({ error: 'API endpoint non trovato.', route });
};
