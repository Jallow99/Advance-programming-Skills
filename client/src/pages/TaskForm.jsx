import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTask, createTask, updateTask, errorMessage } from "../api.js";
import { Alert, Spinner } from "../components/ui.jsx";

const empty = { title: "", description: "", status: "pending", priority: "medium", dueDate: "" };

export default function TaskForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getTask(id)
      .then(({ data: t }) =>
        setForm({
          title: t.title,
          description: t.description || "",
          status: t.status,
          priority: t.priority || "medium",
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().substring(0, 10) : "",
        })
      )
      .catch((err) => {
        setError(errorMessage(err, "Failed to load task."));
        if ([401, 403, 404].includes(err.response?.status)) navigate("/tasks");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const titleInvalid = touched && !form.title.trim();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setTouched(true);
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      if (isEdit) await updateTask(id, form);
      else await createTask(form);
      setSuccess(isEdit ? "Task updated successfully!" : "Task created successfully!");
      setTimeout(() => navigate("/tasks"), 1000);
    } catch (err) {
      setError(errorMessage(err, isEdit ? "Failed to update task." : "Failed to create task."));
      setSaving(false);
    }
  };

  if (loading) return <Spinner text="Loading task..." />;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className={"card-title text-center mb-4 " + (isEdit ? "text-primary" : "text-success")}>
                <i className={"fas me-2 " + (isEdit ? "fa-edit" : "fa-plus-circle")}></i>
                {isEdit ? "Edit Task" : "Add New Task"}
              </h2>
              <Alert type="success">{success}</Alert>
              <Alert>{error}</Alert>

              <form onSubmit={onSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Task Title</label>
                  <input
                    id="title" name="title" type="text"
                    className={"form-control rounded-pill px-3" + (titleInvalid ? " is-invalid" : "")}
                    value={form.title} onChange={onChange}
                  />
                  <div className="invalid-feedback">Task title is required.</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description (Optional)</label>
                  <textarea
                    id="description" name="description" rows="3"
                    className="form-control rounded-3 px-3"
                    value={form.description} onChange={onChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select id="status" name="status" className="form-select rounded-pill px-3" value={form.status} onChange={onChange}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select id="priority" name="priority" className="form-select rounded-pill px-3" value={form.priority} onChange={onChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="dueDate" className="form-label">Due Date (Optional)</label>
                  <input id="dueDate" name="dueDate" type="date" className="form-control rounded-pill px-3" value={form.dueDate} onChange={onChange} />
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" disabled={saving} className={"btn btn-lg rounded-pill shadow-sm " + (isEdit ? "btn-primary" : "btn-success")}>
                    {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                    {isEdit ? "Update Task" : "Create Task"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-lg rounded-pill" onClick={() => navigate("/tasks")}>
                    <i className="fas fa-times-circle me-2"></i>Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
