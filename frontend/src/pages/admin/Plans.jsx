import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function Plans() {
  const [features, setFeatures] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ name: "", monthlyFee: "", selectedFeatures: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const [fRes, pRes] = await Promise.all([
        api.get("/admin/features"),
        api.get("/admin/plans"),
      ]);
      setFeatures(fRes.data);
      setPlans(pRes.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFeature = (featureId) => {
    setForm((prev) => {
      const selectedFeatures = [...prev.selectedFeatures];
      const index = selectedFeatures.indexOf(featureId);
      if (index > -1) {
        selectedFeatures.splice(index, 1);
      } else {
        selectedFeatures.push(featureId);
      }
      return { ...prev, selectedFeatures };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        monthlyFee: Number(form.monthlyFee),
        features: form.selectedFeatures,
      };
      await api.post("/admin/plans", payload);
      setForm({ name: "", monthlyFee: "", selectedFeatures: [] });
      setLoading(true);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Error");
    }
  };

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.Features?.some((f) => f.name?.toLowerCase().includes(q) || f.code?.toLowerCase().includes(q))
    );
  }, [plans, query]);

  return (
    <div className="container py-6">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Plans</h2>
          <input
            className="input w-full sm:w-64"
            placeholder="Search plans or features"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}

        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" type="number" step="0.01" min="0" placeholder="Monthly fee" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} required />
          </div>
          <div>
            <p className="font-semibold mb-2">Select features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.id} className={`border rounded p-3 ${form.selectedFeatures.includes(f.id) ? 'ring-2 ring-blue-500' : ''}`}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.selectedFeatures.includes(f.id)}
                      onChange={() => toggleFeature(f.id)}
                    />
                    <span className="text-sm">{f.name} ({f.code})</span>
                    <span className="ml-auto text-xs text-gray-500">${Number(f.unit_price).toFixed(2)} • max {f.max_unit_limit}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Selected: {form.selectedFeatures.length} features
            </div>
            <button className="btn-primary w-full sm:w-auto" type="submit">Create Plan</button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Existing ({filteredPlans.length})</h3>
          {loading ? (
            <p>Loading...</p>
          ) : filteredPlans.length === 0 ? (
            <p className="text-gray-600">No plans found.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border">Plan</th>
                    <th className="text-left p-2 border">Monthly Fee</th>
                    <th className="text-left p-2 border">Features</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2 border font-medium">{p.name}</td>
                      <td className="p-2 border">${Number(p.monthlyFee).toFixed(2)}</td>
                      <td className="p-2 border text-gray-700">{p.Features?.map((f) => f.name).join(", ") || "No features"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


