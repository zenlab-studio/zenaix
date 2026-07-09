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

load('auth-login', '../src/_auth-login');
load('auth-register', '../src/_auth-register');
load('auth-change-password', '../src/_auth-change-password');
load('giphy-search', '../src/_giphy-search');
load('hf-proxy', '../src/_hf-proxy');
load('sync-data', '../src/_sync-data');
load('zchat-contacts', '../src/_zchat-contacts');
load('zchat-conversations', '../src/_zchat-conversations');
load('zchat-handle', '../src/_zchat-handle');
load('zchat-lookup', '../src/_zchat-lookup');
load('zchat-messages', '../src/_zchat-messages');
load('zchat-presence', '../src/_zchat-presence');
load('zchat-push-subscribe', '../src/_zchat-push-subscribe');
load('zchat-push-unsubscribe', '../src/_zchat-push-unsubscribe');
load('zchat-push-vapid', '../src/_zchat-push-vapid');
load('zchat-requests', '../src/_zchat-requests');
load('zchat-status', '../src/_zchat-status');
load('zchat-typing', '../src/_zchat-typing');
load('zchat-webrtc', '../src/_zchat-webrtc');

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
