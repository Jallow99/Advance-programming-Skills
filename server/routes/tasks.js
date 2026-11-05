// Path: server/routes/tasks.js
const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getTasks).post(protect, createTask);

// Must be declared BEFORE "/:id", otherwise "stats" is treated as an id
router.get("/stats", protect, getTaskStats);

router
  .route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
