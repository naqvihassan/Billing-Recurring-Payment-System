import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminInvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/invoices/${invoiceId}`);
        setInvoice(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Error loading invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

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
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );

  if (!invoice) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate(-1)}>Back</button>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Invoice</h2>
            <div className="text-gray-500">Invoice #: {invoice.id}</div>
            <div className="text-gray-500">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
            <div className="text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{invoice.user?.username || invoice.user?.email || invoice.userId}</div>
            <div className="text-gray-500">{invoice.user?.email}</div>
          </div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Plan:</span> {invoice.subscription?.plan?.name || "-"}
        </div>
        <div className="mb-4 flex items-center gap-4">
          <span className="font-semibold">Status:</span>
          <span className={invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'}>{invoice.status}</span>
          <select
            className="input border rounded px-2 py-1 ml-2"
            value={invoice.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                const res = await api.patch(`/admin/invoices/${invoice.id}/status`, { status: newStatus });
                setInvoice(res.data.invoice);
              } catch (err) {
                alert('Failed to update status');
              }
            }}
          >
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Notes:</span> {invoice.notes || "-"}
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Features Included</h3>
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Feature</th>
                <th className="px-4 py-2 border">Unit Price</th>
                <th className="px-4 py-2 border">Max Units</th>
              </tr>
            </thead>
            <tbody>
              {invoice.subscription?.plan?.Features?.length ? invoice.subscription.plan.Features.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-2 border">{f.name}</td>
                  <td className="px-4 py-2 border">${f.unit_price}</td>
                  <td className="px-4 py-2 border">{f.max_unit_limit}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">No features found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <h3 className="text-lg font-semibold mb-2">Charges</h3>
        <table className="min-w-full bg-white border rounded-lg shadow mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Amount</th>
              {invoice.lineItems?.some(item => item.units !== undefined || item.unitPrice !== undefined) && <th className="px-4 py-2 border">Units</th>}
              {invoice.lineItems?.some(item => item.unitPrice !== undefined) && <th className="px-4 py-2 border">Unit Price</th>}
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems?.length ? invoice.lineItems.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 border">{item.type}</td>
                <td className="px-4 py-2 border">{item.description}</td>
                <td className="px-4 py-2 border">${item.amount}</td>
                {item.units !== undefined && <td className="px-4 py-2 border">{item.units}</td>}
                {item.unitPrice !== undefined && <td className="px-4 py-2 border">{item.unitPrice}</td>}
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No charges found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-sm text-gray-500 mb-4">Units and Unit Price are shown only for overuse charges.</div>
        <div className="flex justify-end text-xl font-bold mt-6">
          Total: ${invoice.amount}
        </div>
      </div>
    </div>
  );
}
