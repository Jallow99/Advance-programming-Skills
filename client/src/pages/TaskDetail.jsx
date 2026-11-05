import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTask, deleteTask, updateTask, errorMessage } from "../api.js";
import {
  Alert, Spinner, formatDate, isOverdue,
  statusBadge, statusLabel, priorityBadge, priorityLabel,
} from "../components/ui.jsx";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTask(id)
      .then((res) => setTask(res.data))
      .catch((err) => setError(errorMessage(err, "Failed to load task.")));
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      navigate("/tasks");
    } catch (err) {
      setError(errorMessage(err, "Failed to delete task."));
    }
  };

  const markComplete = async () => {
    try {
      const { data } = await updateTask(id, { status: "completed" });
      setTask(data);
    } catch (err) {
      setError(errorMessage(err, "Failed to update task."));
    }
  };

  if (!task && !error) return <Spinner text="Loading task..." />;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Alert>{error}</Alert>
          {task && (
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4">
                <h2 className="fw-bold mb-3">{task.title}</h2>
                <div className="mb-3">
                  <span className={`badge rounded-pill me-2 ${statusBadge(task.status)}`}>{statusLabel[task.status]}</span>
                  <span className={`badge rounded-pill ${priorityBadge(task.priority)}`}>{priorityLabel[task.priority]} priority</span>
                </div>
                <p className="text-muted mb-1">Created: {formatDate(task.createdAt)}</p>
                <p className={"mb-3 " + (isOverdue(task) ? "text-danger fw-bold" : "text-muted")}>
                  Due: {formatDate(task.dueDate)}{isOverdue(task) && " (overdue)"}
                </p>
                <h6 className="fw-bold">Description</h6>
                <p style={{ whiteSpace: "pre-wrap" }}>{task.description || "No description provided."}</p>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  {task.status !== "completed" && (
                    <button className="btn btn-success rounded-pill" onClick={markComplete}>
                      <i className="fas fa-check me-1"></i>Mark complete
                    </button>
                  )}
                  <Link to={`/tasks/edit/${task._id}`} className="btn btn-outline-primary rounded-pill">
                    <i className="fas fa-edit me-1"></i>Edit
                  </Link>
                  <button className="btn btn-outline-danger rounded-pill" onClick={onDelete}>
                    <i className="fas fa-trash-alt me-1"></i>Delete
                  </button>
                  <Link to="/tasks" className="btn btn-outline-secondary rounded-pill ms-auto">Back to tasks</Link>
                </div>
              </div>
            </div>
          )}
          {!task && <Link to="/tasks" className="btn btn-outline-secondary rounded-pill">Back to tasks</Link>}
        </div>
      </div>
    </div>
  );
}
