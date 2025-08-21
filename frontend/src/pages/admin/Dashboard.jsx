import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {
  const [status, setStatus] = useState("...");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/user/admin/health");
        setStatus(res.data.status);
      } catch (e) {
        setError(e.response?.data?.message || "Error");
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="container py-6">
      <div className="card">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-600">Health: {status}</p>
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}


