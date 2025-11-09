export default async function handler(req, res) {
  try {
    const mod = await import("../server/index.js");
    const app = mod.default || mod.app || mod.server;
    if (typeof app === 'function') {
      return app(req, res);
    }
    res.statusCode = 500;
    res.end("Server app not exported");
  } catch (err) {
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
