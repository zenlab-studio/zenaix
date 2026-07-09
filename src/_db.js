function getBlobBaseUrl() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN non configurato');
  }
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const storeId = payload && (payload.storeId || payload.iss || payload.sub);
    if (storeId) return `https://${storeId}.blob.vercel-storage.com`;
  } catch {}
  throw new Error('Impossibile ricavare l\'URL del Blob store dal token');
}

let _baseUrl;
async function ensureBaseUrl() {
  if (!_baseUrl) {
    _baseUrl = process.env.BLOB_API_URL || getBlobBaseUrl();
  }
  return _baseUrl;
}

function storePath(prefix, key = '') {
  return `zen/${prefix}/${key}`.replace(/\/+/g, '/');
}

async function blobFetch(pathname, options = {}) {
  const base = await ensureBaseUrl();
  const url = `${base}/${pathname}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      ...options.headers
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Blob API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res;
}

function makeStore(prefix) {
  return {
    async get(key, opts = {}) {
      const pathname = storePath(prefix, `${key}.json`);
      const res = await blobFetch(pathname, { method: 'GET' });
      if (!res) return null;
      const text = await res.text();
      const parsed = JSON.parse(text);
      if (opts.type === 'json') return parsed;
      return JSON.stringify(parsed);
    },
    async setJSON(key, val) {
      const pathname = storePath(prefix, `${key}.json`);
      await blobFetch(pathname, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(val)
      });
    },
    async delete(key) {
      const pathname = storePath(prefix, `${key}.json`);
      try { await blobFetch(pathname, { method: 'DELETE' }); } catch {}
    },
    async list(opts = {}) {
      const base = await ensureBaseUrl();
      const folder = storePath(prefix, '');
      const prefixFilter = opts.prefix || '';
      const url = `${base}?prefix=${encodeURIComponent(folder)}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      if (!res.ok) return { blobs: [] };
      const data = await res.json();
      const allBlobs = data.blobs || [];
      const filtered = allBlobs.filter(b => {
        const key = b.pathname.replace(folder, '').replace('.json', '');
        return key.startsWith(prefixFilter);
      });
      return {
        blobs: filtered.map(b => ({
          key: b.pathname.replace(folder, '').replace('.json', '')
        }))
      };
    }
  };
}

function getStore(name) {
  return makeStore(name);
}

module.exports = { getStore };
