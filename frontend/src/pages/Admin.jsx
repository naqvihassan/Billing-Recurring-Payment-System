import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import api from "../api/axios";

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState("...");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/user/admin/health");
        setStatus(res.data.status);
      } catch (e) {
        setError(e.response?.data?.message || "Error");
      }
    };
    fetch();
  }, []);

  if (!user || user.role !== "admin") {
    return <div className="p-6">Forbidden</div>;
  }

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