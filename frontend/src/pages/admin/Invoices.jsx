import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/invoices");
        setInvoices(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Error loading invoices");
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
      <h2 className="text-2xl font-bold mb-6">All Invoices</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border text-center"></th>
              <th className="px-4 py-2 border">Invoice #</th>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Plan</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-2 border text-center">
                    <button
                      className="inline-flex items-center justify-center transition group
                        w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800
                        md:w-auto md:h-auto md:bg-transparent md:hover:bg-transparent md:text-blue-700 md:hover:text-blue-900"
                      title="View Invoice Details"
                      onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden md:inline ml-2 text-sm font-medium">Details</span>
                    </button>
                  </td>
                  <td className="px-4 py-2 border">{inv.id.slice(0, 8)}</td>
                  <td className="px-4 py-2 border">{inv.user?.username || inv.user?.email || inv.userId}</td>
                  <td className="px-4 py-2 border">{inv.subscription?.plan?.name || "-"}</td>
                  <td className="px-4 py-2 border">${inv.amount}</td>
                  <td className="px-4 py-2 border">{inv.status}</td>
                  <td className="px-4 py-2 border">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition"
                      title="View Invoice"
                      onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
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
