const handlers = {};

function load(name, path) {
  try {
    handlers[name] = require(path);
  } catch (err) {
    console.error(`Failed to load ${name}:`, err.message);
    handlers[name] = async (req, res) => {
      res.status(500).json({ error: `Errore caricamento handler: ${err.message}`, stack: err.stack });
    };
  }
}

load('auth-login', './_auth-login');
load('auth-register', './_auth-register');
load('auth-change-password', './_auth-change-password');
load('giphy-search', './_giphy-search');
load('hf-proxy', './_hf-proxy');
load('sync-data', './_sync-data');
load('zchat-contacts', './_zchat-contacts');
load('zchat-conversations', './_zchat-conversations');
load('zchat-handle', './_zchat-handle');
load('zchat-lookup', './_zchat-lookup');
load('zchat-messages', './_zchat-messages');
load('zchat-presence', './_zchat-presence');
load('zchat-push-subscribe', './_zchat-push-subscribe');
load('zchat-push-unsubscribe', './_zchat-push-unsubscribe');
load('zchat-push-vapid', './_zchat-push-vapid');
load('zchat-requests', './_zchat-requests');
load('zchat-status', './_zchat-status');
load('zchat-typing', './_zchat-typing');
load('zchat-webrtc', './_zchat-webrtc');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const route = (req.url || '').replace(/^\/api\//, '').split('?')[0].split('/')[0];
  const handler = handlers[route];
  if (!handler) {
    return res.status(404).json({ error: 'API endpoint non trovato.', route });
  }
  try {
    return await handler(req, res);
  } catch (err) {
    console.error(`[${route}]`, err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
