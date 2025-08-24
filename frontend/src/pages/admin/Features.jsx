import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", unit_price: "", max_unit_limit: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAtDesc");
  const [editing, setEditing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/admin/features");
      setFeatures(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isFormValid = useMemo(() => {
    const unitPrice = Number(form.unit_price);
    const maxLimit = Number(form.max_unit_limit);
    return (
      form.name.trim().length > 0 &&
      form.code.trim().length > 0 &&
      Number.isFinite(unitPrice) && unitPrice >= 0 &&
      Number.isInteger(maxLimit) && maxLimit >= 0
    );
  }, [form]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        unit_price: Number(form.unit_price),
        max_unit_limit: Number(form.max_unit_limit),
      };
      await api.post("/admin/features", payload);
      setForm({ name: "", code: "", unit_price: "", max_unit_limit: "" });
      setLoading(true);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Error");
    }
  };

  const filtered = useMemo(() => {
    let data = [...features];
    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter((f) =>
        f.name?.toLowerCase().includes(q) ||
        f.code?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "nameAsc":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "priceAsc":
        data.sort((a, b) => Number(a.unit_price) - Number(b.unit_price));
        break;
      case "priceDesc":
        data.sort((a, b) => Number(b.unit_price) - Number(a.unit_price));
        break;
      default:
        break;
    }
    return data;
  }, [features, query, sortBy]);

  const startEdit = (f) => {
    setError("");
    setEditing({ id: f.id, name: f.name, unit_price: String(f.unit_price), max_unit_limit: String(f.max_unit_limit) });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const name = editing.name?.trim();
    const unit_price = Number(editing.unit_price);
    const max_unit_limit = Number(editing.max_unit_limit);
    if (!name || !Number.isFinite(unit_price) || unit_price < 0 || !Number.isInteger(max_unit_limit) || max_unit_limit < 0) {
      setError("Please provide valid values");
      return;
    }
    try {
      await api.put(`/admin/features/${editing.id}`, { name, unit_price, max_unit_limit });
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
      await api.delete(`/admin/features/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      setLoading(true);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Error");
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="container py-6">
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-bold">Features</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              className="input w-full sm:w-64"
              placeholder="Search by name or code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input w-40"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAtDesc">Newest</option>
              <option value="nameAsc">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
              <option value="priceAsc">Price Low-High</option>
              <option value="priceDesc">Price High-Low</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <form onSubmit={submit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input className="input" placeholder="e.g. API Requests" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Code</label>
            <input className="input" placeholder="e.g. api_requests" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Unit Price</label>
            <input className="input" type="number" step="0.01" min="0" placeholder="e.g. 0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Max Unit Limit</label>
            <input className="input" type="number" min="0" placeholder="e.g. 100000" value={form.max_unit_limit} onChange={(e) => setForm({ ...form, max_unit_limit: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary w-full" type="submit" disabled={!isFormValid}>Create Feature</button>
          </div>
        </form>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Existing ({filtered.length})</h3>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600">No features found.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border">Name</th>
                    <th className="text-left p-2 border">Code</th>
                    <th className="text-right p-2 border">Unit Price</th>
                    <th className="text-right p-2 border">Max Units</th>
                    <th className="text-right p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="p-2 border font-medium">{f.name}</td>
                      <td className="p-2 border text-gray-700">{f.code}</td>
                      <td className="p-2 border text-right">${Number(f.unit_price).toFixed(2)}</td>
                      <td className="p-2 border text-right">{f.max_unit_limit}</td>
                      <td className="p-2 border text-right">
                        <div className="flex justify-end gap-2">
                          <button className="btn-secondary btn-sm" onClick={() => startEdit(f)}>Edit</button>
                          <button className="btn-danger btn-sm" onClick={() => requestDelete(f.id)}>Delete</button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
            <h4 className="text-lg font-semibold mb-3">Edit Feature</h4>
            <div className="grid gap-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Unit Price</label>
                <input className="input" type="number" step="0.01" min="0" value={editing.unit_price} onChange={(e) => setEditing({ ...editing, unit_price: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max Unit Limit</label>
                <input className="input" type="number" min="0" value={editing.max_unit_limit} onChange={(e) => setEditing({ ...editing, max_unit_limit: e.target.value })} />
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
            <h4 className="text-lg font-semibold mb-2">Delete Feature?</h4>
            <p className="text-sm text-gray-600">This cannot be undone. If the feature is used by plans with active subscribers, deletion will be blocked.</p>
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


