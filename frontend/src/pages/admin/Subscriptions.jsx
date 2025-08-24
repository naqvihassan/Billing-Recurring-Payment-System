import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/subscriptions");
      setSubscriptions(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error loading subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = [...subscriptions];
    
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      data = data.filter((s) =>
        s.user?.username?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.plan?.name?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((s) => s.status === statusFilter);
    }

    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [subscriptions, query, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container py-6">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-bold">User Subscriptions</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              className="input w-full sm:w-64"
              placeholder="Search by user, plan, or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Subscriptions ({filtered.length})</h3>
            <button onClick={load} className="btn-secondary btn-sm">Refresh</button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600">No subscriptions found.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border">User</th>
                    <th className="text-left p-2 border">Plan</th>
                    <th className="text-left p-2 border">Status</th>
                    <th className="text-right p-2 border">Monthly Fee</th>
                    <th className="text-left p-2 border">Billing Day</th>
                    <th className="text-left p-2 border">Next Billing</th>
                    <th className="text-left p-2 border">Created</th>
                    <th className="text-center p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-2 border">
                        <div>
                          <div className="font-medium">{s.user?.username || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{s.user?.email || 'No email'}</div>
                        </div>
                      </td>
                      <td className="p-2 border font-medium">{s.plan?.name || 'Unknown Plan'}</td>
                      <td className="p-2 border">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2 border text-right">{formatCurrency(s.monthly_fee_snapshot)}</td>
                      <td className="p-2 border">{s.billing_day}</td>
                      <td className="p-2 border">{formatDate(s.next_billing_date)}</td>
                      <td className="p-2 border">{formatDate(s.createdAt)}</td>
                      <td className="p-2 border text-center">
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => setSelectedSubscription(s)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedSubscription && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Subscription Details</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedSubscription(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Username:</span> {selectedSubscription.user?.username || 'Unknown'}</div>
                  <div><span className="text-gray-600">Email:</span> {selectedSubscription.user?.email || 'No email'}</div>
                  <div><span className="text-gray-600">User ID:</span> {selectedSubscription.user?.id}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Plan Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Plan Name:</span> {selectedSubscription.plan?.name || 'Unknown'}</div>
                  <div><span className="text-gray-600">Monthly Fee:</span> {formatCurrency(selectedSubscription.monthly_fee_snapshot)}</div>
                  <div><span className="text-gray-600">Plan ID:</span> {selectedSubscription.plan?.id}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Subscription Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubscription.status)}`}>
                      {selectedSubscription.status}
                    </span>
                  </div>
                  <div><span className="text-gray-600">Billing Day:</span> {selectedSubscription.billing_day}</div>
                  <div><span className="text-gray-600">Next Billing:</span> {formatDate(selectedSubscription.next_billing_date)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timestamps</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Created:</span> {formatDate(selectedSubscription.createdAt)}</div>
                  <div><span className="text-gray-600">Started:</span> {formatDate(selectedSubscription.started_at)}</div>
                  {selectedSubscription.cancelled_at && (
                    <div><span className="text-gray-600">Cancelled:</span> {formatDate(selectedSubscription.cancelled_at)}</div>
                  )}
                  {selectedSubscription.expires_at && (
                    <div><span className="text-gray-600">Expires:</span> {formatDate(selectedSubscription.expires_at)}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedSubscription(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
