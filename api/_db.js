const { kv } = require('@vercel/kv');

function makeStore(prefix) {
  return {
    async get(key, opts = {}) {
      const val = await kv.get(`zen:${prefix}:${key}`);
      if (opts.type === 'json') return val;
      return val != null ? JSON.stringify(val) : null;
    },
    async setJSON(key, val) {
      await kv.set(`zen:${prefix}:${key}`, val);
    },
    async delete(key) {
      await kv.del(`zen:${prefix}:${key}`);
    },
    async list(opts = {}) {
      const pattern = `zen:${prefix}:${opts.prefix || ''}*`;
      let cursor = 0;
      const keys = [];
      do {
        const [nextCursor, batch] = await kv.scan(cursor, { match: pattern, count: 100 });
        cursor = parseInt(nextCursor, 10);
        keys.push(...batch);
      } while (cursor !== 0);
      const blobs = keys.map(k => ({ key: k.replace(`zen:${prefix}:`, '') }));
      return { blobs };
    }
  };
}

function getStore(name) {
  return makeStore(name);
}

module.exports = { getStore };
