import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../api.js";
import { Alert } from "../components/ui.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email) errors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Email must be a valid email address.";
  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (!form.confirmPassword) errors.confirmPassword = "Confirm Password is required.";
  else if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match.";

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBlur = (e) => setTouched({ ...touched, [e.target.name]: true });
  const invalid = (f) => touched[f] && errors[f];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      navigate("/dashboard", { replace: true }); // registration also logs the user in
    } catch (err) {
      setError(errorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = "text") => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        id={name} name={name} type={type}
        className={"form-control rounded-pill px-3" + (invalid(name) ? " is-invalid" : "")}
        value={form[name]} onChange={onChange} onBlur={onBlur}
      />
      <div className="invalid-feedback">{errors[name]}</div>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 text-success fw-bold">Register</h2>
              <Alert>{error}</Alert>
              <form onSubmit={onSubmit} noValidate>
                {field("name", "Name")}
                {field("email", "Email address", "email")}
                {field("password", "Password", "password")}
                {field("confirmPassword", "Confirm Password", "password")}
                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-success btn-lg rounded-pill shadow-sm" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-user-plus me-2"></i>}
                    Register
                  </button>
                </div>
                <p className="mt-3 text-center">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
