const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMe, updateMe } = require("../controllers/userController");

router.get("/", auth, getMe);
router.put("/", auth, updateMe);

module.exports = router;
