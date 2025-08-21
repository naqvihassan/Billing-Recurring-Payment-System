import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function Plans() {
  const [features, setFeatures] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ name: "", monthlyFee: "", featureDetails: {} });
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

  const toggleFeature = (id) => {
    setForm((prev) => {
      const featureDetails = { ...prev.featureDetails };
      if (featureDetails[id]) {
        delete featureDetails[id];
      } else {
        featureDetails[id] = { included_units: "", overage_unit_price: "" };
      }
      return { ...prev, featureDetails };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const features = Object.entries(form.featureDetails).map(([featureId, v]) => ({
        featureId,
        included_units: Number(v.included_units),
        overage_unit_price: v.overage_unit_price === "" ? null : Number(v.overage_unit_price),
      }));
      const payload = {
        name: form.name.trim(),
        monthlyFee: Number(form.monthlyFee),
        features,
      };
      await api.post("/admin/plans", payload);
      setForm({ name: "", monthlyFee: "", featureDetails: {} });
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
                <div key={f.id} className={`border rounded p-3 ${form.featureDetails[f.id] ? 'ring-2 ring-blue-500' : ''}`}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(form.featureDetails[f.id])}
                      onChange={() => toggleFeature(f.id)}
                    />
                    <span className="text-sm">{f.name} ({f.code})</span>
                    <span className="ml-auto text-xs text-gray-500">${Number(f.unit_price).toFixed(2)} • max {f.max_unit_limit}</span>
                  </label>
                  {form.featureDetails[f.id] && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        className="input"
                        type="number"
                        min="0"
                        placeholder={`Included units (max: ${f.max_unit_limit})`}
                        max={f.max_unit_limit}
                        value={form.featureDetails[f.id].included_units}
                        onChange={(e) => setForm({
                          ...form,
                          featureDetails: {
                            ...form.featureDetails,
                            [f.id]: { ...form.featureDetails[f.id], included_units: e.target.value },
                          },
                        })}
                        required
                      />
                      {Number(form.featureDetails[f.id].included_units) > Number(f.max_unit_limit) && (
                        <div className="col-span-2 text-sm text-red-600 mt-1">
                          Cannot exceed maximum limit of {f.max_unit_limit} units
                        </div>
                      )}
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Overage price (optional)"
                        value={form.featureDetails[f.id].overage_unit_price}
                        onChange={(e) => setForm({
                          ...form,
                          featureDetails: {
                            ...form.featureDetails,
                            [f.id]: { ...form.featureDetails[f.id], overage_unit_price: e.target.value },
                          },
                        })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Selected: {Object.keys(form.featureDetails).length} features
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


