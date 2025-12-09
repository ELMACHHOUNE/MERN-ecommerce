const bcrypt = require("bcryptjs");
const User = require("../models/User");

const sanitize = (u) => {
  if (!u) return null;
  const { _id, email, fullName, role, createdAt, updatedAt } = u.toObject();
  return { id: _id, email, fullName, role, createdAt, updatedAt };
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(sanitize(user));
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof fullName === "string") user.fullName = fullName.trim();
    if (typeof email === "string") {
      const nextEmail = email.trim().toLowerCase();
      if (nextEmail !== user.email) {
        const exists = await User.findOne({
          email: nextEmail,
          _id: { $ne: user._id },
        });
        if (exists)
          return res.status(409).json({ message: "Email already in use" });
        user.email = nextEmail;
      }
    }
    if (password && String(password).trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(String(password).trim(), salt);
    }

    await user.save();
    return res.json(sanitize(user));
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};
