import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  "User authentication with JWT and role-based access",
  "Full CRUD operations for tasks",
  "Dashboard, search and filters",
  "RESTful API with Node.js and Express.js",
  "MongoDB Atlas database",
];

export default function Home() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5 text-center">
              <h1 className="card-title text-primary mb-4 fw-bold">Welcome to Task Manager!</h1>
              <p className="card-text fs-5 mb-4">
                Organize assignments, track deadlines, and keep your goals on schedule.
              </p>

              {isLoggedIn ? (
                <>
                  <h3 className="mb-4">
                    Hello, <span className="text-success">{user?.name}</span>!
                  </h3>
                  <Link to="/dashboard" className="btn btn-primary btn-lg rounded-pill px-4 me-3 shadow-sm">
                    <i className="fas fa-chart-pie me-2"></i>Dashboard
                  </Link>
                  <Link to="/tasks" className="btn btn-outline-primary btn-lg rounded-pill px-4 me-3 shadow-sm">
                    <i className="fas fa-tasks me-2"></i>My Tasks
                  </Link>
                  <button onClick={logout} className="btn btn-outline-danger btn-lg rounded-pill px-4 shadow-sm mt-2 mt-md-0">
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </>
              ) : (
                <>
                  <p className="card-text fs-5 mb-4">Join us today to experience seamless task management.</p>
                  <Link to="/register" className="btn btn-success btn-lg rounded-pill px-4 me-3 shadow-sm">
                    <i className="fas fa-user-plus me-2"></i>Register
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg rounded-pill px-4 shadow-sm">
                    <i className="fas fa-sign-in-alt me-2"></i>Login
                  </Link>
                </>
              )}

              <hr className="my-5" />
              <h4 className="text-secondary mb-3">Key Features:</h4>
              <ul className="list-unstyled text-start mx-auto" style={{ maxWidth: 600 }}>
                {features.map((f) => (
                  <li key={f} className="d-flex align-items-center mb-2">
                    <i className="fas fa-check-circle text-info me-3 fs-4"></i>
                    <span className="fs-5">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
