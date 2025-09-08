import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import api from "../api/axios";

export default function Subscribe() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [billingDay, setBillingDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/plans`);
      const planData = response.data.find(p => p.id === planId);
      if (!planData) {
        setError("Plan not found");
        return;
      }
      setPlan(planData);
    } catch (err) {
      setError("Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/user/subscribe", {
        planId,
        billingDay: parseInt(billingDay)
      });

      alert("Subscription created successfully!");
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={() => navigate("/plans")} className="btn btn-primary">
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Subscribe to {plan?.name}
          </h1>
          <p className="text-gray-600">
            Complete your subscription by choosing your billing day and confirming your plan.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan?.name}</h2>
            <div className="text-4xl font-bold text-blue-600 mb-1">
              ${plan?.monthlyFee}
              <span className="text-lg font-normal text-gray-500">/month</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Included Features:</h3>
            <ul className="space-y-3">
              {plan?.Features?.map((feature) => (
                <li key={feature.id} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{feature.name}</div>
                    <div className="text-sm text-gray-600">
                      ${Number(feature.unit_price).toFixed(2)} per unit • max {feature.max_unit_limit} units
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Subscription Details</h3>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubscribe}>
            <div className="mb-6">
              <label htmlFor="billingDay" className="block text-sm font-medium text-gray-700 mb-2">
                Billing Day
              </label>
              <select
                id="billingDay"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose the day of the month when you'll be billed (1-28).
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Important Information:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll be charged ${plan?.monthlyFee} immediately upon subscription</li>
                <li>• Future billing will occur on the {billingDay}th of each month</li>
                <li>• You can cancel your subscription at any time</li>
                <li>• Overage charges will be calculated based on feature usage</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/plans")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Creating Subscription..." : "Subscribe Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
