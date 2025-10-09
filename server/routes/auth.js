const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function sign(user) {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: user.id,
    expiresIn: JWT_EXPIRES_IN,
  });
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      passwordHash,
      fullName: fullName || "",
      role: "user",
    });

    const token = sign(user);
    return res
      .status(201)
      .json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      });
  } catch (e) {
    console.error("Register error:", e);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign(user);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
