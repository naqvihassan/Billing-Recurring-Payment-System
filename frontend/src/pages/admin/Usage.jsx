import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function UsagePage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [selectedSub, setSelectedSub] = useState(null);
  const [planFeatures, setPlanFeatures] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [units, setUnits] = useState("");
  const [usageDate, setUsageDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanFeatureId, setSelectedPlanFeatureId] = useState("");
  const [subscriptionStart, setSubscriptionStart] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const subsRes = await api.get("/admin/subscriptions");
      setSubscriptions(subsRes.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const sub = subscriptions.find((s) => s.id === selectedSubId);
    setSelectedSub(sub || null);
    setPlanFeatures([]);
    setUsageList([]);
    setSelectedPlanFeatureId("");
    setUnits("");
    if (sub) {
      fetchSubscriptionDetails(sub.id);
      fetchUsage(sub.id);
    }
  }, [selectedSubId, subscriptions]);

  const fetchSubscriptionDetails = async (subscriptionId) => {
    try {
      const res = await api.get(`/admin/subscriptions/${subscriptionId}`);
      const plan = res.data?.plan;
      const features = plan?.Features || [];
      setSubscriptionStart(res.data?.started_at || "");
      const pf = [];
      if (features.length && plan?.planFeatures) {
        // attempt to map planFeatureId from through table if present
      }
      // fallback: subscriptionController.getSubscriptionById includes Feature through with planFeature id in through
      const enriched = (plan?.Features || []).map((f) => ({
        id: f.id,
        name: f.name,
        code: f.code,
        planFeatureId: f.PlanFeature?.id || f.planFeatureId || null
      }));
      setPlanFeatures(enriched);
    } catch (e) {
      setError(e.response?.data?.message || "Error loading subscription details");
    }
  };

  const fetchUsage = async (subscriptionId) => {
    try {
      const res = await api.get(`/admin/subscriptions/${subscriptionId}/usage`);
      setUsageList(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error loading usage");
    }
  };

  const submitUsage = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        subscriptionId: selectedSubId,
        planFeatureId: selectedPlanFeatureId,
        units_used: Number(units),
        usage_date: usageDate || undefined,
      };
      await api.post("/admin/usage", payload);
      await fetchUsage(selectedSubId);
      setUnits("");
      setUsageDate("");
      setSelectedPlanFeatureId("");
    } catch (e) {
      setError(e.response?.data?.message || "Error submitting usage");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Record Feature Usage</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-gray-600">Select Subscription</label>
            <select className="input w-full" value={selectedSubId} onChange={(e) => setSelectedSubId(e.target.value)}>
              <option value="">-- Choose --</option>
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.email} • {s.plan?.name} • {s.status}
                </option>
              ))}
            </select>
          </div>

          {selectedSub && (
            <div>
              <label className="text-sm text-gray-600">Plan Feature</label>
              <select className="input w-full" value={selectedPlanFeatureId} onChange={(e) => setSelectedPlanFeatureId(e.target.value)}>
                <option value="">-- Select feature --</option>
                {planFeatures.map((f) => (
                  <option key={f.planFeatureId || f.id} value={f.planFeatureId || ""} disabled={!f.planFeatureId}>
                    {f.name} ({f.code}) {f.planFeatureId ? "" : " - not linkable"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedSub && (
          <form onSubmit={submitUsage} className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm text-gray-600">Units</label>
              <input className="input" type="number" min="0" value={units} onChange={(e) => setUnits(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Usage Date {subscriptionStart && (
                <span className="text-xs text-gray-500">(from {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(subscriptionStart))})</span>
              )}</label>
              <input
                className="input"
                type="date"
                value={usageDate}
                min={subscriptionStart ? new Date(subscriptionStart).toISOString().split('T')[0] : undefined}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setUsageDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full" type="submit" disabled={submitting || !selectedPlanFeatureId || units === ""}>
                {submitting ? 'Saving...' : 'Save Usage'}
              </button>
            </div>
          </form>
        )}

        {selectedSub && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Recent Usage ({usageList.length})</h3>
            {usageList.length === 0 ? (
              <p className="text-gray-600">No usage recorded.</p>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border">Feature</th>
                      <th className="text-left p-2 border">Date</th>
                      <th className="text-left p-2 border">Billing Period</th>
                      <th className="text-right p-2 border">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageList.map((u) => {
                      const featureName = u.planFeature?.feature?.name || '—';
                      const featureCode = u.planFeature?.feature?.code ? ` (${u.planFeature.feature.code})` : '';
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="p-2 border">{featureName}{featureCode}</td>
                          <td className="p-2 border">{new Date(u.usage_date).toLocaleDateString()}</td>
                          <td className="p-2 border">{u.billing_period}</td>
                          <td className="p-2 border text-right">{u.units_used}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
