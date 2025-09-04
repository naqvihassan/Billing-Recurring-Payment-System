import { useState, useEffect } from "react";
import api from "../../api/axios";
import BillingTabInvoices from "./BillingTabInvoices";
import BillingTabTransactions from "./BillingTabTransactions";



export default function BillingPayments() {
  const [tab, setTab] = useState("invoices");
  const [summary, setSummary] = useState({ amountDue: "0.00", nextBillingDate: null });
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoadingSummary(true);
        const res = await api.get("/user/billing-summary");
        setSummary(res.data);
      } catch {
        setSummary({ amountDue: "0.00", nextBillingDate: null });
      } finally {
        setLoadingSummary(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Billing & Payments</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Amount Due</div>
          <div className="text-xs text-gray-500 mb-1">Sum of all unpaid invoices</div>
          <div className={`text-2xl font-bold ${!loadingSummary && Number(summary.amountDue) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {loadingSummary ? <span className="animate-pulse">...</span> : `$${summary.amountDue}`}
          </div>
        </div>
        <div>
          <div className="text-lg font-semibold">Next Billing Date</div>
          <div className="text-xl text-gray-700">
            {loadingSummary ? <span className="animate-pulse">...</span> : summary.nextBillingDate ? new Date(summary.nextBillingDate).toLocaleDateString() : "--/--/----"}
          </div>
        </div>
      </div>
      <div className="mb-6 flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-all duration-150 ${tab === "invoices" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
          onClick={() => setTab("invoices")}
        >
          Invoices
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-all duration-150 ${tab === "transactions" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
          onClick={() => setTab("transactions")}
        >
          Transactions
        </button>
      </div>
     <div>
  {tab === "invoices" && <BillingTabInvoices />}
  {tab === "transactions" && <BillingTabTransactions />}
      </div>
    </div>
  );
}
