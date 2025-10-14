const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const authRequired = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// require admin for all routes
router.use(authRequired, requireRole("admin"));

const sanitize = (u) => ({
  _id: u._id,
  email: u.email,
  fullName: u.fullName || "",
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const genPassword = () => crypto.randomBytes(9).toString("base64url");

router.get("/", async (_req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users.map(sanitize));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    const fullName = (req.body?.fullName || "").trim();
    const role = (req.body?.role || "user").trim();
    const passwordRaw = (req.body?.password || "").trim();

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!["user", "admin"].includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const password = passwordRaw || genPassword();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, fullName, role, passwordHash });
    res.status(201).json(sanitize(user));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (typeof req.body?.email === "string")
      updates.email = req.body.email.trim().toLowerCase();
    if (typeof req.body?.fullName === "string")
      updates.fullName = req.body.fullName.trim();
    if (typeof req.body?.role === "string") {
      const role = req.body.role.trim();
      if (!["user", "admin"].includes(role))
        return res.status(400).json({ error: "Invalid role" });
      updates.role = role;
    }
    if (typeof req.body?.password === "string" && req.body.password.trim()) {
      updates.passwordHash = await bcrypt.hash(req.body.password.trim(), 10);
    }

    if (updates.email) {
      const dup = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      });
      if (dup) return res.status(409).json({ error: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(sanitize(user));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    // prevent self-delete
    if (req.userId && String(req.userId) === String(id))
      return res
        .status(400)
        .json({ error: "You cannot delete your own account" });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
