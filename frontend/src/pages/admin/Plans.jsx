import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function Plans() {
  const [features, setFeatures] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ name: "", monthlyFee: "", selectedFeatures: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [warnings, setWarnings] = useState([]);

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

  const startEdit = (p) => {
    setError("");
    setEditing({
      id: p.id,
      name: p.name,
      monthlyFee: String(p.monthlyFee),
      featureIds: (p.Features || []).map((f) => f.id),
    });
  };

  const toggleEditFeature = (featureId) => {
    if (!editing) return;
    const next = new Set(editing.featureIds);
    if (next.has(featureId)) next.delete(featureId); else next.add(featureId);
    setEditing({ ...editing, featureIds: Array.from(next) });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const name = editing.name?.trim();
    const monthlyFee = Number(editing.monthlyFee);
    if (!name || !Number.isFinite(monthlyFee) || monthlyFee < 0) {
      setError("Please provide a valid name and monthly fee");
      return;
    }
    try {
      const res = await api.put(`/admin/plans/${editing.id}`, {
        name,
        monthlyFee,
        features: editing.featureIds,
      });
      const serverWarnings = res.data?.warnings?.failedFeatureRemovals || [];
      setWarnings(serverWarnings);
      setEditing(null);
      setLoading(true);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Error");
    }
  };

  const requestDelete = (id) => {
    setError("");
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/admin/plans/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      setLoading(true);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Error");
      setConfirmDeleteId(null);
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
        {error && (
          <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <div className="font-semibold mb-1">Action failed</div>
            <div>{error}</div>
            <div className="text-right mt-2">
              <button className="text-red-800 underline" onClick={() => setError("")}>Dismiss</button>
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
            <div className="font-semibold mb-1">Some features could not be removed:</div>
            <ul className="list-disc ml-5 space-y-1">
              {warnings.map((w, idx) => (
                <li key={idx}>{w.featureName || w.featureCode || w.featureId}: {w.reason}</li>
              ))}
            </ul>
            <div className="text-right mt-2">
              <button className="text-yellow-800 underline" onClick={() => setWarnings([])}>Dismiss</button>
            </div>
          </div>
        )}

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
                    <th className="text-right p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2 border font-medium">{p.name}</td>
                      <td className="p-2 border">${Number(p.monthlyFee).toFixed(2)}</td>
                      <td className="p-2 border text-gray-700">{p.Features?.map((f) => f.name).join(", ") || "No features"}</td>
                      <td className="p-2 border text-right">
                        <div className="flex justify-end gap-2">
                          <button className="btn-secondary btn-sm" onClick={() => startEdit(p)}>Edit</button>
                          <button className="btn-danger btn-sm" onClick={() => requestDelete(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-4">
            <h4 className="text-lg font-semibold mb-3">Edit Plan</h4>
            <div className="grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Monthly Fee</label>
                  <input className="input" type="number" step="0.01" min="0" value={editing.monthlyFee} onChange={(e) => setEditing({ ...editing, monthlyFee: e.target.value })} />
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">Select features</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-auto pr-1">
                  {features.map((f) => (
                    <label key={f.id} className={`flex items-center gap-2 p-2 border rounded ${editing.featureIds.includes(f.id) ? 'ring-2 ring-blue-500' : ''}`}>
                      <input
                        type="checkbox"
                        checked={editing.featureIds.includes(f.id)}
                        onChange={() => toggleEditFeature(f.id)}
                      />
                      <span className="text-sm">{f.name} ({f.code})</span>
                      <span className="ml-auto text-xs text-gray-500">${Number(f.unit_price).toFixed(2)} • max {f.max_unit_limit}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
            <h4 className="text-lg font-semibold mb-2">Delete Plan?</h4>
            <p className="text-sm text-gray-600">This cannot be undone. If the plan has active subscribers, deletion will be blocked.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


