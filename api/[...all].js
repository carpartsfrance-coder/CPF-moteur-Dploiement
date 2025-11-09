module.exports = async function handler(req, res) {
  try {
    const mod = await import("../server/index.js");
    const app = mod.default;
    return app(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
};
