import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTaskStats, errorMessage } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Spinner, formatDate, priorityBadge, priorityLabel } from "../components/ui.jsx";

function StatCard({ label, value, color, icon, to }) {
  return (
    <div className="col-6 col-lg-3 mb-4">
      <Link to={to} className="text-decoration-none">
        <div className="card stat-card shadow-sm border-0 rounded-4 h-100">
          <div className="card-body text-center">
            <i className={`fas ${icon} text-${color} fs-3 mb-2`}></i>
            <div className={`display-6 text-${color}`}>{value}</div>
            <div className="text-muted">{label}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTaskStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(errorMessage(err, "Failed to load dashboard.")));
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Hello, {user?.name}</h2>
        <Link to="/tasks/new" className="btn btn-primary rounded-pill shadow-sm">
          <i className="fas fa-plus-circle me-2"></i>Add Task
        </Link>
      </div>

      <Alert>{error}</Alert>
      {!stats && !error && <Spinner text="Loading dashboard..." />}

      {stats && (
        <>
          <div className="row">
            <StatCard label="Total tasks" value={stats.total} color="primary" icon="fa-list" to="/tasks" />
            <StatCard label="Pending" value={stats.pending} color="warning" icon="fa-hourglass-half" to="/tasks?status=pending" />
            <StatCard label="In progress" value={stats.inProgress} color="info" icon="fa-spinner" to="/tasks?status=in-progress" />
            <StatCard label="Completed" value={stats.completed} color="success" icon="fa-check-circle" to="/tasks?status=completed" />
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Progress</h5>
                  <div className="progress mb-2" style={{ height: 22 }}>
                    <div className="progress-bar bg-success" style={{ width: `${stats.completionRate}%` }}>
                      {stats.completionRate}%
                    </div>
                  </div>
                  <p className="text-muted small">
                    {stats.completed} of {stats.total} tasks completed
                  </p>
                  <div className="d-flex gap-3 flex-wrap">
                    <Link to="/tasks?deadline=overdue" className="text-decoration-none">
                      <span className="badge bg-danger fs-6">{stats.overdue} overdue</span>
                    </Link>
                    <Link to="/tasks?priority=high" className="text-decoration-none">
                      <span className="badge bg-dark fs-6">{stats.highPriorityOpen} high priority open</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Upcoming deadlines</h5>
                  {stats.upcoming.length === 0 ? (
                    <p className="text-muted mb-0">No upcoming deadlines.</p>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {stats.upcoming.map((t) => (
                        <li key={t._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <Link to={`/tasks/${t._id}`} className="text-decoration-none text-truncate me-2">
                            {t.title}
                          </Link>
                          <span className="text-nowrap">
                            <span className={`badge me-2 ${priorityBadge(t.priority)}`}>{priorityLabel[t.priority]}</span>
                            <small className="text-muted">{formatDate(t.dueDate)}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
