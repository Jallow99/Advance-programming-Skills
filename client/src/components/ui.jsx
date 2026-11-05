// Small shared helpers used by several pages

export const statusLabel = { pending: "Pending", "in-progress": "In Progress", completed: "Completed" };
export const priorityLabel = { low: "Low", medium: "Medium", high: "High" };

export const statusBadge = (s) =>
  ({ pending: "bg-warning text-dark", "in-progress": "bg-info text-dark", completed: "bg-success" }[s] || "bg-secondary");

export const priorityBadge = (p) =>
  ({ low: "bg-secondary", medium: "bg-primary", high: "bg-danger" }[p] || "bg-secondary");

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

export const isOverdue = (task) =>
  !!task.dueDate && task.status !== "completed" && new Date(task.dueDate) < new Date(new Date().toDateString());

export function Spinner({ text = "Loading..." }) {
  return (
    <div className="text-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      <p className="mt-2">{text}</p>
    </div>
  );
}

export function Alert({ type = "danger", children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type} text-center mb-3`} role="alert">
      {children}
    </div>
  );
}
