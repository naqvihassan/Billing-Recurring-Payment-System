import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function BillingTabInvoices() {
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
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-center">
      <div className="text-red-600 mb-4">{error}</div>
    </div>
  );

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border text-xs md:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-1 md:px-2 py-2 border whitespace-nowrap text-center"></th>
            <th className="px-1 md:px-2 py-2 border whitespace-nowrap">Invoice #</th>
            <th className="px-1 md:px-2 py-2 border whitespace-nowrap">Date</th>
            <th className="px-1 md:px-2 py-2 border whitespace-nowrap">Amount</th>
            <th className="px-1 md:px-2 py-2 border whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} className="hover:bg-gray-50">
              <td className="px-1 md:px-2 py-2 border whitespace-nowrap text-center">
                <button
                  className="inline-flex items-center justify-center transition group
                    w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800
                    md:w-auto md:h-auto md:bg-transparent md:hover:bg-transparent md:text-blue-700 md:hover:text-blue-900"
                  title="View Invoice Details"
                  onClick={() => navigate(`/user/invoices/${inv.id}`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden md:inline ml-2 text-sm font-medium">Details</span>
                </button>
              </td>
              <td className="px-1 md:px-2 py-2 border whitespace-nowrap">{inv.id.slice(0, 8)}</td>
              <td className="px-1 md:px-2 py-2 border whitespace-nowrap">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
              <td className="px-1 md:px-2 py-2 border whitespace-nowrap">${Number(inv.amount).toFixed(2)}</td>
              <td className="px-1 md:px-2 py-2 border whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'unpaid' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{inv.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
