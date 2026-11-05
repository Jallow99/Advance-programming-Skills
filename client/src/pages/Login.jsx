import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../api.js";
import { Alert } from "../components/ui.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = {};
  if (!form.email) errors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Email must be a valid email address.";
  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBlur = (e) => setTouched({ ...touched, [e.target.name]: true });
  const invalid = (f) => touched[f] && errors[f];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 text-primary fw-bold">Login</h2>
              <Alert>{error}</Alert>
              <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    id="email" name="email" type="email"
                    className={"form-control rounded-pill px-3" + (invalid("email") ? " is-invalid" : "")}
                    value={form.email} onChange={onChange} onBlur={onBlur}
                  />
                  <div className="invalid-feedback">{errors.email}</div>
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password" name="password" type="password"
                    className={"form-control rounded-pill px-3" + (invalid("password") ? " is-invalid" : "")}
                    value={form.password} onChange={onChange} onBlur={onBlur}
                  />
                  <div className="invalid-feedback">{errors.password}</div>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-lg rounded-pill shadow-sm" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-sign-in-alt me-2"></i>}
                    Login
                  </button>
                </div>
                <p className="mt-3 text-center">
                  Don't have an account? <Link to="/register">Register here</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
