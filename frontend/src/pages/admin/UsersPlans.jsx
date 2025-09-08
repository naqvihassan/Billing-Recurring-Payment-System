import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminUsersPlans() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/users");
        const usersList = res.data || [];
        
        const results = await Promise.all(
          usersList.map(async (user) => {
            try {
              const subsRes = await api.get(`/admin/users/${user.id}/subscriptions`);
              return { ...user, subscriptions: subsRes.data || [] };
            } catch {
              return { ...user, subscriptions: [] };
            }
          })
        );
        setUsers(results);
      } catch (e) {
        setError(e.response?.data?.message || "Error loading users");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="text-red-600 mb-4">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Users & Their Plans</h1>
      {users.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {users.filter(user => user.role !== 'admin').map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.username || user.email}</h2>
              <p className="text-gray-600 mb-2">Email: <span className="font-semibold">{user.email}</span></p>
              <p className="text-gray-500 mb-4">Role: {user.role}</p>
              {user.subscriptions.length === 0 ? (
                <p className="text-gray-500">No plans/subscriptions found.</p>
              ) : (
                <div className="space-y-2">
                  {user.subscriptions.map((sub) => (
                    <div key={sub.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <span className="font-semibold text-blue-700">{sub.plan?.name || "Unknown Plan"}</span>
                        <span className="ml-2 text-xs text-gray-500">({sub.status})</span>
                      </div>
                      <div className="text-sm text-gray-600">Next billing: {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "-"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
