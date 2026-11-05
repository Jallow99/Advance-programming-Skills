import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getTasks, deleteTask, errorMessage } from "../api.js";
import {
  Alert, Spinner, formatDate, isOverdue,
  statusBadge, statusLabel, priorityBadge, priorityLabel,
} from "../components/ui.jsx";

export default function TaskList() {
  const navigate = useNavigate();
  // Filters live in the URL, so dashboard links like /tasks?status=pending work
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const status = params.get("status") || "";
  const priority = params.get("priority") || "";
  const deadline = params.get("deadline") || "";
  const sort = params.get("sort") || "newest";
  const page = parseInt(params.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState({ tasks: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page"); // back to page 1 when a filter changes
    setParams(next);
  };

  // Debounce the search box so we don't call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) setParam("search", searchInput);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const load = () => {
    setLoading(true);
    setError("");
    getTasks({ search, status, priority, deadline, sort, page, limit: 9 })
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err, "Failed to fetch tasks.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, status, priority, deadline, sort, page]);

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      // If that was the last task on this page, step back one page
      if (data.tasks.length === 1 && page > 1) setParam("page", String(page - 1));
      else load();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete task."));
    }
  };

  const hasFilters = search || status || priority || deadline;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">My Tasks</h2>
        <Link to="/tasks/new" className="btn btn-primary btn-lg rounded-pill shadow-sm">
          <i className="fas fa-plus-circle me-2"></i>Add New Task
        </Link>
      </div>

      {/* Search + filters */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <input
                className="form-control" placeholder="Search title or description..."
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={status} onChange={(e) => setParam("status", e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={priority} onChange={(e) => setParam("priority", e.target.value)}>
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={deadline} onChange={(e) => setParam("deadline", e.target.value)}>
                <option value="">Any deadline</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="week">Next 7 days</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={sort} onChange={(e) => setParam("sort", e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="due">Due date</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button
              className="btn btn-link btn-sm mt-2 p-0"
              onClick={() => { setSearchInput(""); setParams({}); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <Alert>{error}</Alert>
      {loading && <Spinner text="Loading tasks..." />}

      {!loading && !error && data.tasks.length === 0 && (
        <div className="alert alert-info text-center my-5" role="alert">
          <h4 className="alert-heading">No tasks found!</h4>
          <p className="mb-0">
            {hasFilters ? "Try changing or clearing your filters." : 'Click "Add New Task" to get started.'}
          </p>
        </div>
      )}

      {!loading && data.tasks.length > 0 && (
        <>
          <p className="text-muted small">{data.total} task{data.total === 1 ? "" : "s"}</p>
          <div className="row">
            {data.tasks.map((task) => (
              <div key={task._id} className="col-md-6 col-lg-4 mb-4">
                <div className={"card task-card h-100 shadow-sm border-0 rounded-4" + (isOverdue(task) ? " overdue" : "")}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate mb-2 fw-bold">
                      <Link to={`/tasks/${task._id}`} className="text-decoration-none text-dark">
                        {task.title}
                      </Link>
                    </h5>
                    <div className="mb-2">
                      <span className={`badge rounded-pill me-2 ${statusBadge(task.status)}`}>{statusLabel[task.status]}</span>
                      <span className={`badge rounded-pill ${priorityBadge(task.priority)}`}>{priorityLabel[task.priority]}</span>
                    </div>
                    <p className="card-text text-muted small mb-1">Created: {formatDate(task.createdAt)}</p>
                    {task.dueDate && (
                      <p className={"card-text small mb-3 " + (isOverdue(task) ? "text-danger fw-bold" : "text-muted")}>
                        Due: {formatDate(task.dueDate)}{isOverdue(task) && " (overdue)"}
                      </p>
                    )}
                    <p className="card-text flex-grow-1">{task.description || "No description provided."}</p>
                    <div className="mt-auto d-flex justify-content-end gap-2">
                      <button onClick={() => navigate(`/tasks/edit/${task._id}`)} className="btn btn-outline-primary btn-sm rounded-pill">
                        <i className="fas fa-edit me-1"></i>Edit
                      </button>
                      <button onClick={() => onDelete(task._id)} className="btn btn-outline-danger btn-sm rounded-pill">
                        <i className="fas fa-trash-alt me-1"></i>Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.pages > 1 && (
            <nav className="d-flex justify-content-center align-items-center gap-3 mb-5">
              <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>
                Previous
              </button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn btn-outline-secondary btn-sm" disabled={page >= data.pages} onClick={() => setParam("page", String(page + 1))}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
