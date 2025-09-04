import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function UserInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await api.get("/user/invoices");
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
        <div className="text-red-600 mb-4">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Invoices</h1>
      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Invoice #</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{inv.id.slice(0, 8)}</td>
                  <td className="p-2 border">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="p-2 border">${Number(inv.amount).toFixed(2)}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'unpaid' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{inv.status}</span>
                  </td>
                  <td className="p-2 border">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2" onClick={() => navigate(`/user/invoices/${inv.id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
