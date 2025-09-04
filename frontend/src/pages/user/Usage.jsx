import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";

export default function UsageOverview() {
  const { user } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const subsRes = await api.get("/user/subscriptions");
        const subs = subsRes.data || [];
        
        const results = await Promise.all(
          subs.map(async (s) => {
            try {
              const [usageRes, detailsRes] = await Promise.all([
                api.get(`/user/subscriptions/${s.id}/usage`),
                api.get(`/user/subscriptions/${s.id}`)
              ]);
              return {
                ...s,
                usage: usageRes.data || [],
                plan: detailsRes.data?.plan || s.plan
              };
            } catch {
              return { ...s, usage: [], plan: s.plan };
            }
          })
        );
        setSubscriptions(results);
      } catch (e) {
        setError(e.response?.data?.message || "Error loading usage overview");
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
      <h1 className="text-3xl font-bold mb-6">Usage Overview</h1>
      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
          <p className="mt-1 text-sm text-gray-500">Subscribe to a plan to start tracking usage.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{sub.plan?.name}</h2>
              <p className="text-gray-600 mb-2">Status: <span className="font-semibold">{sub.status}</span></p>
              <p className="text-gray-500 mb-4">Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}</p>
              {sub.plan?.Features && sub.plan.Features.length > 0 ? (
                <div className="space-y-4">
                  {sub.plan.Features.map((feature) => {
                    
                    const usageForFeature = sub.usage.filter(u => u.planFeature?.feature?.id === feature.id);
                    const totalUsed = usageForFeature.reduce((sum, u) => sum + Number(u.units_used || 0), 0);
                    
                    const planFeature = (sub.plan?.planFeatures || []).find(pf => pf.featureId === feature.id);
                    const allowed = planFeature?.max_unit_limit ?? feature.max_unit_limit ?? null;
                    const overused = allowed !== null && totalUsed > allowed;
                    const remaining = allowed !== null ? Math.max(0, allowed - totalUsed) : null;
                    return (
                      <div key={feature.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{feature.name} <span className="text-xs text-gray-500">({feature.code})</span></h3>
                            <div className="flex gap-4 mt-1">
                              <span className="text-sm text-gray-700">Allowed: <span className="font-semibold">{allowed ?? 'Unlimited'}</span></span>
                              <span className="text-sm text-blue-700">Used: <span className="font-semibold">{totalUsed}</span></span>
                              {allowed !== null && !overused && (
                                <span className="text-sm text-green-700">Remaining: <span className="font-semibold">{remaining}</span></span>
                              )}
                              {overused && (
                                <span className="text-sm text-red-700">Overused: <span className="font-semibold">{totalUsed - allowed}</span></span>
                              )}
                            </div>
                            {allowed !== null && (
                              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-300 ${overused ? "bg-red-500" : totalUsed > 0.8 * allowed ? "bg-yellow-500" : "bg-blue-500"}`}
                                  style={{ width: `${Math.min(100, (totalUsed / allowed) * 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No features found for this plan.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
