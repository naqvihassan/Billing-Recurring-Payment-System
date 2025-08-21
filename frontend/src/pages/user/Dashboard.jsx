import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/user/profile");
        setProfile(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container py-6">
      <div className="card">
        <h2 className="text-2xl font-bold">User Dashboard</h2>
        <p className="text-gray-600">Welcome back, {profile.username}</p>
      </div>
    </div>
  );
}


