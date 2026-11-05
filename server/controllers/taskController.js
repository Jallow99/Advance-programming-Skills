// Path: server/controllers/taskController.js
const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get tasks for the logged-in user (supports search, filters, pagination)
// @route   GET /api/tasks?search=&status=&priority=&sort=&page=&limit=
// @access  Private
// Response: { tasks, page, pages, total }
const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, deadline, sort = "newest" } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 9, 1), 50);

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  // Deadline filter: overdue | today | week
  if (deadline) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    if (deadline === "overdue") {
      filter.dueDate = { $lt: startOfDay };
      if (!status) filter.status = { $ne: "completed" };
    } else if (deadline === "today") {
      filter.dueDate = { $gte: startOfDay, $lt: endOfDay };
    } else if (deadline === "week") {
      filter.dueDate = {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    }
  }
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    due: { dueDate: 1 },
  };

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .sort(sortMap[sort] || sortMap.newest)
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    tasks,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
  });
});

// @desc    Dashboard summary for the logged-in user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  const [total, pending, inProgress, completed, overdue, high] =
    await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: "pending" }),
      Task.countDocuments({ user: userId, status: "in-progress" }),
      Task.countDocuments({ user: userId, status: "completed" }),
      Task.countDocuments({
        user: userId,
        status: { $ne: "completed" },
        dueDate: { $lt: now },
      }),
      Task.countDocuments({
        user: userId,
        status: { $ne: "completed" },
        priority: "high",
      }),
    ]);

  const upcoming = await Task.find({
    user: userId,
    status: { $ne: "completed" },
    dueDate: { $gte: now },
  })
    .sort({ dueDate: 1 })
    .limit(5);

  res.status(200).json({
    total,
    pending,
    inProgress,
    completed,
    overdue,
    highPriorityOpen: high,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    upcoming,
  });
});

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: "Not authorized to view this task" });
    return;
  }
  res.status(200).json(task);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  if (!title) {
    res.status(400).json({ message: "Please add a title for the task" });
    return;
  }

  const task = await Task.create({
    user: req.user._id,
    title,
    description,
    status,
    priority,
    dueDate: dueDate || undefined,
  });

  res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: "Not authorized to update this task" });
    return;
  }

  if (title !== undefined) task.title = title || task.title;
  // description and dueDate can be cleared by sending an empty value
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || undefined;

  const updatedTask = await task.save();
  res.status(200).json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: "Not authorized to delete this task" });
    return;
  }

  await Task.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Task removed" });
});

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
