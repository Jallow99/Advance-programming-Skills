import { useEffect, useState } from "react";
import { getUsers, updateUser, deleteUser, errorMessage } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert, Spinner, formatDate } from "../components/ui.jsx";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(null); // user being edited

  const load = () =>
    getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(errorMessage(err, "Failed to load users.")));

  useEffect(() => { load(); }, []);

  const flash = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await updateUser(editing._id, { name: editing.name, email: editing.email, role: editing.role });
      setEditing(null);
      flash("User updated.");
      load();
    } catch (err) {
      setError(errorMessage(err, "Failed to update user."));
    }
  };

  const onDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all of their tasks? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteUser(u._id);
      flash("User deleted.");
      load();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete user."));
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary fw-bold mb-4">User Management</h2>
      <Alert type="success">{success}</Alert>
      <Alert>{error}</Alert>
      {!users && !error && <Spinner text="Loading users..." />}

      {users && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Tasks</th><th>Joined</th><th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}{u._id === me._id && <span className="text-muted"> (you)</span>}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={"badge " + (u.role === "admin" ? "bg-warning text-dark" : "bg-secondary")}>{u.role}</span>
                    </td>
                    <td>{u.taskCount}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-outline-primary btn-sm rounded-pill me-2" onClick={() => setEditing({ ...u })}>
                        <i className="fas fa-edit me-1"></i>Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        disabled={u._id === me._id}
                        onClick={() => onDelete(u)}
                      >
                        <i className="fas fa-trash-alt me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content rounded-4" onSubmit={onSave}>
              <div className="modal-header">
                <h5 className="modal-title">Edit user</h5>
                <button type="button" className="btn-close" onClick={() => setEditing(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" required value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
