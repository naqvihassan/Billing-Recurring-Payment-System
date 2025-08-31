import { useState } from "react";
import api from "../../api/axios";

export default function AdminBillingActions() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleRunBilling = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await api.post("/admin/run-billing");
      setResult(res.data?.message || "Billing run complete.");
    } catch (e) {
      setResult(e.response?.data?.message || "Error running billing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Admin Billing Actions</h2>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        onClick={handleRunBilling}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Billing for Due Accounts"}
      </button>
      {result && <div className="mt-4 text-lg font-semibold text-gray-700">{result}</div>}
    </div>
  );
}