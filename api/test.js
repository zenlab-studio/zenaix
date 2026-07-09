module.exports = async (req, res) => {
  res.status(200).json({ ok: true, env: Object.keys(process.env).filter(k => !k.includes('TOKEN') && !k.includes('SECRET') && !k.includes('KEY')).sort() });
};
