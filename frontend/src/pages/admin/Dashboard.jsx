import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminDashboardStats, runBillingForDueAccounts } from "../../api/admin";

export default function Dashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    activeSubCount: 0,
    totalRevenue: 0,
    featureCount: 0,
    planCount: 0,
    overdueInvoices: [],
    mostPopularPlan: null,
    revenueTrend: [],
    userTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [billingMessage, setBillingMessage] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const data = await fetchAdminDashboardStats();
        setStats(data);
      } catch (e) {

      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 border border-gray-100">
          <div className="p-3 bg-blue-100 rounded-lg mb-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-7V7a4 4 0 00-3-3.87M9 4V3a4 4 0 013-3.87" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.userCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 border border-gray-100">
          <div className="p-3 bg-green-100 rounded-lg mb-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500">Active Subscriptions</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.activeSubCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 border border-gray-100">
          <div className="p-3 bg-yellow-100 rounded-lg mb-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2zm-7 4h6" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500">Overdue Invoices</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.overdueInvoices.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 border border-gray-100">
          <div className="p-3 bg-purple-100 rounded-lg mb-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : `$${Number(stats.totalRevenue).toLocaleString()}`}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 border border-gray-100">
          <div className="p-3 bg-indigo-100 rounded-lg mb-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500">Features</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.featureCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 border border-gray-100">
          <div className="p-3 bg-pink-100 rounded-lg mb-2">
            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500">Plans</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.planCount}</div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
          onClick={async () => {
            setBillingMessage("");
            try {
              const res = await runBillingForDueAccounts();
              setBillingMessage(res.message || "Billing run complete.");
            } catch (e) {
              setBillingMessage("Error running billing.");
            }
          }}
        >
          Run Billing for Due Accounts Today
        </button>
      </div>
      {billingMessage && (
        <div className="mb-6 text-center text-sm text-green-700 bg-green-100 rounded p-2">
          {billingMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <h2 className="text-xl font-bold mb-4">Top Overdue Invoices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
              ) : stats.overdueInvoices.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">No overdue invoices</td></tr>
              ) : (
                stats.overdueInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{inv.id}</td>
                    <td className="px-4 py-2">{inv.userName || inv.userId}</td>
                    <td className="px-4 py-2">${Number(inv.amount).toFixed(2)}</td>
                    <td className="px-4 py-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{inv.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


