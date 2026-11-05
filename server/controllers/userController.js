// Path: server/controllers/userController.js
// Admin-only user management (CRUD on user records)
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Task = require("../models/Task");

// @desc    List all users with their task counts
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  const counts = await Task.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(
    users.map((u) => ({ ...u.toObject(), taskCount: countMap.get(String(u._id)) || 0 }))
  );
});

// @desc    Get one user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
});

// @desc    Update a user's name, email or role
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { name, email, role } = req.body;

  if (role !== undefined) {
    if (!["user", "admin"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    // Stop an admin from removing their own admin rights by accident
    if (user._id.equals(req.user._id) && role !== "admin") {
      res.status(400).json({ message: "You cannot remove your own admin role" });
      return;
    }
    user.role = role;
  }
  if (name) user.name = name;
  if (email && email !== user.email) {
    const taken = await User.findOne({ email });
    if (taken) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }
    user.email = email;
  }

  const saved = await user.save();
  res.json({ _id: saved._id, name: saved.name, email: saved.email, role: saved.role });
});

// @desc    Delete a user and all of their tasks
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (user._id.equals(req.user._id)) {
    res.status(400).json({ message: "You cannot delete your own account here" });
    return;
  }
  await Task.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
  res.json({ message: "User and their tasks removed" });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
