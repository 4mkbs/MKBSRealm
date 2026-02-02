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
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateObjectId,
} = require("../middleware/validation");

// Test route without validation
router.post("/test", (req, res) => {
  res.json({ success: true, message: "Server is working" });
});

// Public routes (with validation)
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/profile/:id", validateObjectId, getProfile);

// Protected routes
router.get("/me", protect, getMe);
router.put("/me", protect, validateUpdateProfile, updateProfile);

module.exports = router;
