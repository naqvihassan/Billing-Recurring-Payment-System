import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function BillingTabTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await axios.get("/user/transactions");
        setTransactions(res.data);
      } catch (err) {
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  if (loading) return <div className="p-4">Loading transactions...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!transactions.length) return <div className="p-4">No transactions found.</div>;

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white rounded shadow text-xs md:text-sm">
        <thead>
          <tr>
            <th className="px-1 md:px-4 py-2 border whitespace-nowrap">Date</th>
            <th className="px-1 md:px-4 py-2 border whitespace-nowrap">Type</th>
            <th className="px-1 md:px-4 py-2 border whitespace-nowrap">Amount</th>
            <th className="px-1 md:px-4 py-2 border whitespace-nowrap">Status</th>
            <th className="px-1 md:px-4 py-2 border whitespace-nowrap">Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-1 md:px-4 py-2 border whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
              <td className="px-1 md:px-4 py-2 border whitespace-nowrap">{tx.type}</td>
              <td className="px-1 md:px-4 py-2 border whitespace-nowrap">${tx.amount.toFixed(2)}</td>
              <td className="px-1 md:px-4 py-2 border whitespace-nowrap">{tx.status}</td>
              <td className="px-1 md:px-4 py-2 border whitespace-nowrap">{tx.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
