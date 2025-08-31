import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";

export default function Dashboard() {
  const USAGE_FILTERS = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 30 Days", value: "30days" },
  ];
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usageFilter, setUsageFilter] = useState("today");
  const usagePeriodLabel = USAGE_FILTERS.find(f => f.value === usageFilter)?.label || "";
  const [usageLoading, setUsageLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      setThisMonthTotal(0);
      return;
    }
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const total = invoices
      .filter(inv => {
        const d = new Date(inv.invoiceDate);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    setThisMonthTotal(total);
  }, [invoices]);
  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const res = await api.get("/user/invoices");
      setInvoices(res.data || []);
    } catch (e) {
      setInvoicesError(e.response?.data?.message || "Error loading invoices");
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && subscriptions.length > 0) {
      fetchUsageData();
    }
  }, [usageFilter, subscriptions, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const subsRes = await api.get("/user/subscriptions");
      const subs = subsRes.data || [];
      setSubscriptions(subs);
    } catch (e) {
      setError(e.response?.data?.message || "Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async () => {
    try {
      setUsageLoading(true);
      const pad2 = (n) => String(n).padStart(2, '0');
      const toLocalYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      const now = new Date();
      const usageResults = await Promise.all(
        subscriptions.map(async (s) => {
          try {
            const u = await api.get(`/user/subscriptions/${s.id}/usage`);
            return u.data || [];
          } catch {
            return [];
          }
        })
      );
      const allUsage = usageResults.flat();
      let filteredUsage = [];
      if (usageFilter === "today") {
        const todayIso = toLocalYmd(now);
        filteredUsage = allUsage.filter((u) => {
          const d = new Date(u.usage_date);
          return toLocalYmd(d) === todayIso;
        });
      } else if (usageFilter === "7days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setHours(0,0,0,0);
        sevenDaysAgo.setDate(now.getDate() - 6);
        filteredUsage = allUsage.filter((u) => {
          const d = new Date(u.usage_date);
          d.setHours(0,0,0,0);
          return d >= sevenDaysAgo && d <= now;
        });
      } else if (usageFilter === "30days") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setHours(0,0,0,0);
        thirtyDaysAgo.setDate(now.getDate() - 29);
        filteredUsage = allUsage.filter((u) => {
          const d = new Date(u.usage_date);
          d.setHours(0,0,0,0);
          return d >= thirtyDaysAgo && d <= now;
        });
      }
      
      const byFeature = new Map();
      for (const u of filteredUsage) {
        const feature = u.planFeature?.feature || {};
        const key = feature.id || u.planFeatureId || `${feature.name}|${feature.code}`;
        if (!byFeature.has(key)) {
          byFeature.set(key, {
            featureId: feature.id,
            featureName: feature.name || 'Unknown Feature',
            featureCode: feature.code,
            unitPrice: Number(feature.unit_price || 0),
            totalUnits: 0,
          });
        }
        const item = byFeature.get(key);
        item.totalUnits += Number(u.units_used || 0);
      }
      setUsage(Array.from(byFeature.values()));
    } finally {
      setUsageLoading(false);
    }
  };

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
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Welcome back, <span className="text-blue-600">{user?.username}</span>!
        </h1>
        <p className="text-lg text-gray-500">
          Manage your subscriptions, track usage, and view billing information.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-3 border border-gray-100">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Active Subscriptions</div>
            <div className="text-2xl font-bold text-gray-900">{subscriptions.filter(s => s.status === 'active').length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-3 border border-gray-100">
          <div className="p-3 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">This Month's Bill</div>
            <div className="text-2xl font-bold text-gray-900">${thisMonthTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-3 border border-gray-100">
          <div className="p-3 bg-purple-100 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Usage <span className='text-xs text-gray-400'>({usagePeriodLabel})</span></div>
            <div className="text-2xl font-bold text-gray-900">{usage.length} features</div>
          </div>
        </div>

        {(() => {
          const today = new Date();
          const pad2 = n => String(n).padStart(2, '0');
          const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
          const todaysInvoices = invoices.filter(inv => {
            const d = new Date(inv.invoiceDate);
            const dStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
            return dStr === todayStr;
          });
          const todayTotal = todaysInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
          return (
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-3 border border-gray-100">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Invoices Today</div>
                <div className="text-2xl font-bold text-gray-900">{todaysInvoices.length} <span className="text-xs font-normal">invoice{todaysInvoices.length !== 1 ? 's' : ''}</span></div>
                <div className="text-sm text-blue-700 font-semibold">Total: ${todayTotal.toFixed(2)}</div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const unpaid = invoices.filter(inv => inv.status === 'unpaid');
          const unpaidTotal = unpaid.reduce((sum, inv) => sum + Number(inv.amount), 0);
          return (
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-3 border border-gray-100">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2zm-7 4h6" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Outstanding Bills</div>
                <div className="text-2xl font-bold text-gray-900">{unpaid.length} <span className="text-xs font-normal">bill{unpaid.length !== 1 ? 's' : ''}</span></div>
                <div className="text-sm text-yellow-700 font-semibold">Total: ${unpaidTotal.toFixed(2)}</div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex justify-end mb-8">
        <Link to="/user/billings" className="btn btn-primary btn-sm">View All Billing</Link>
      </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow flex flex-col" style={{maxHeight: '420px'}}>
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Active Plan{subscriptions.filter(s => s.status === 'active').length !== 1 ? 's' : ''}</h2>
                </div>
                <div className="p-6 overflow-y-auto" style={{flex: 1, minHeight: 0}}>
                  {subscriptions.filter(s => s.status === 'active').length === 0 ? (
                    <div className="text-gray-500 text-sm">No active plan</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {subscriptions.filter(s => s.status === 'active').map(s => (
                        <li key={s.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <div className="font-semibold text-indigo-800 text-base">{s.plan?.name || 'Unnamed Plan'}</div>
                            <div className="text-xs text-gray-500">Status: {s.plan?.status || 'active'}</div>
                            {s.plan?.description && <div className="text-xs text-gray-400 mt-1">{s.plan.description}</div>}
                          </div>
                          <button className="btn btn-xs btn-primary" onClick={() => navigate(`/user/subscriptions/${s.id}`)}>Details</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow flex flex-col" style={{maxHeight: '420px'}}>
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Usage</h2>
                  <select
                    className="input w-40"
                    value={usageFilter}
                    onChange={e => setUsageFilter(e.target.value)}
                  >
                    {USAGE_FILTERS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="p-6 overflow-y-auto" style={{flex: 1, minHeight: 0}}>
                  {usageLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : usage.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No usage data</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Usage data will appear here once you start using your subscribed features.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {usage.map((f) => (
                        <div key={f.featureId || f.featureName} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {f.featureName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {f.totalUnits} units used {usageFilter === 'today' ? 'today' : usageFilter === '7days' ? 'last 7 days' : 'last 30 days'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ${(f.totalUnits * f.unitPrice).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Plan History</h2>
              </div>
              <div className="p-6 overflow-x-auto">
                {subscriptions.length === 0 ? (
                  <div className="text-gray-500 text-sm">No plans found</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {subscriptions.map(s => {
                        const start = s.started_at || s.start_date;
                        let end = s.expires_at || s.cancelled_at || s.end_date;
                        return (
                          <tr key={s.id}>
                            <td className="px-4 py-2 font-medium text-gray-900">{s.plan?.name || 'Unnamed Plan'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{s.status}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{start ? new Date(start).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{s.status === 'active' ? 'Present' : (end ? new Date(end).toLocaleDateString() : '-')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
    </div>
  );
}