import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function UserTransactions() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await api.get("/user/invoices");
        setInvoices(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Error loading transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
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
        <div className="text-red-600 font-semibold">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Invoice #</th>
              <th className="px-4 py-2 border">Plan</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No transactions found.</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-2 border">{inv.id.slice(0, 8)}</td>
                  <td className="px-4 py-2 border">{inv.subscription?.plan?.name || "-"}</td>
                  <td className="px-4 py-2 border">${inv.amount}</td>
                  <td className="px-4 py-2 border">{inv.status}</td>
                  <td className="px-4 py-2 border">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2" onClick={() => window.location.href = `/user/invoices/${inv.id}`}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}