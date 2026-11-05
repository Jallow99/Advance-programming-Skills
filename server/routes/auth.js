// Path: backend/routes/auth.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth"); // Import the protect middleware

// Route for user registration
router.post("/register", registerUser);

// Route for user login
router.post("/login", loginUser);

// Route to get user profile, protected by authentication middleware
router.get("/profile", protect, getUserProfile);

module.exports = router;
