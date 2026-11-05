// Path: backend/models/Task.js
const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
  // Reference to the User who created the task (owner of the task)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Refers to the 'User' model
  },
  // Title of the task, required field
  title: {
    type: String,
    required: [true, "Please add a task title"],
    trim: true, // Remove whitespace from both ends of a string
  },
  // Description of the task, optional
  description: {
    type: String,
    required: false,
    trim: true,
  },
  // Status of the task (e.g., 'pending', 'in-progress', 'completed')
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"], // Allowed values for status
    default: "pending", // Default status for new tasks
  },
  // Priority of the task
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  // Due date for the task, optional
  dueDate: {
    type: Date,
    required: false,
  },
  // Timestamp for when the task was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", TaskSchema); // Export the Task model
