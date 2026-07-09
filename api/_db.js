const { put, get, del, list } = require('@vercel/blob');

function storePath(prefix, key = '') {
  return `zen/${prefix}/${key}`.replace(/\/+/g, '/');
}

async function blobGet(pathname) {
  try {
    const blob = await get(pathname);
    return await blob.text();
  } catch {
    return null;
  }
}

function makeStore(prefix) {
  return {
    async get(key, opts = {}) {
      const pathname = storePath(prefix, `${key}.json`);
      const text = await blobGet(pathname);
      if (text == null) return null;
      const parsed = JSON.parse(text);
      if (opts.type === 'json') return parsed;
      return JSON.stringify(parsed);
    },
    async setJSON(key, val) {
      const pathname = storePath(prefix, `${key}.json`);
      await put(pathname, JSON.stringify(val), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false
      });
    },
    async delete(key) {
      const pathname = storePath(prefix, `${key}.json`);
      try { await del(pathname); } catch { }
    },
    async list(opts = {}) {
      const folder = storePath(prefix, '');
      const prefixFilter = opts.prefix || '';
      const { blobs: allBlobs } = await list({ prefix: folder });
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
