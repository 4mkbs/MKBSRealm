const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile/:id", getProfile);

// Protected routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);

module.exports = router;
