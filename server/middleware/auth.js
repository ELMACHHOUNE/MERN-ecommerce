const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    if (!JWT_SECRET)
      return res.status(500).json({ error: "Server misconfigured" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role || "user" };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { authRequired, requireRole };
