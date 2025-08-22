import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="container py-6">
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-3">
          <Link to="/admin/features" className="btn-primary">Manage Features</Link>
          <Link to="/admin/plans" className="btn-secondary">Manage Plans</Link>
          <Link to="/admin/subscriptions" className="btn-secondary">View Subscriptions</Link>
        </div>
      </div>
    </div>
  );
}


