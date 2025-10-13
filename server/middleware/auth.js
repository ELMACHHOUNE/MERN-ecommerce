const jwt = require("jsonwebtoken");

function getToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer") return null;
  return token || null;
}

function authRequired(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload?.id || payload?._id || payload?.sub;
    req.userRole = payload?.role;
    req.user = payload;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    next();
  } catch (_e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function requireRole(role) {
  const roles = Array.isArray(role) ? role : [role];
  return (req, res, next) => {
    const userRole = req.userRole || req.user?.role;
    if (!userRole) return res.status(403).json({ message: "Forbidden" });
    if (!roles.includes(userRole))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// Default export (keeps `const auth = require("../middleware/auth")` working)
module.exports = authRequired;
// Named exports (keeps `{ authRequired, requireRole } = require("../middleware/auth")` working)
module.exports.authRequired = authRequired;
module.exports.requireRole = requireRole;
