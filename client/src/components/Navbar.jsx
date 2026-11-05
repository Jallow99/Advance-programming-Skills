import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const link = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/" onClick={close}>
          <i className="fas fa-clipboard-check me-2"></i>Task Manager
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={"collapse navbar-collapse" + (open ? " show" : "")}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={link} to="/" end onClick={close}>Home</NavLink>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink className={link} to="/dashboard" onClick={close}>Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={link} to="/tasks" onClick={close}>My Tasks</NavLink>
                </li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink className={link} to="/admin/users" onClick={close}>
                  <i className="fas fa-user-shield me-1"></i>Users
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav align-items-lg-center">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <NavLink className={link} to="/login" onClick={close}>
                    <i className="fas fa-sign-in-alt me-1"></i>Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={link} to="/register" onClick={close}>
                    <i className="fas fa-user-plus me-1"></i>Register
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-lg-3">
                    <i className="fas fa-user-circle me-1"></i>
                    {user?.name || "User"}
                    {isAdmin && <span className="badge bg-warning text-dark ms-2">Admin</span>}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i>Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
