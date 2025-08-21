import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "../api/axios";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/plans");
      setPlans(response.data);
    } catch (err) {
      setError("Failed to load plans");
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchPlans}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. All plans include our core features with different usage limits.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div key={plan.id} className="card hover:shadow-xl transition-shadow duration-300">
            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-blue-600 mb-1">
                ${plan.monthlyFee}
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">Billed monthly</p>
            </div>

            {/* Features List */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Included Features:</h4>
              <ul className="space-y-3">
                {plan.Features?.map((feature) => {
                  const planFeature = feature.PlanFeature;
                  return (
                    <li key={feature.id} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{feature.name}</div>
                        <div className="text-sm text-gray-600">
                          {planFeature?.included_units || 0} {feature.unit_type || 'units'} included
                          {planFeature?.overage_unit_price && planFeature.overage_unit_price > 0 && (
                            <span className="text-blue-600">
                              , ${planFeature.overage_unit_price}/unit overage
                            </span>
                          )}
                        </div>
                        {feature.description && (
                          <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              {user ? (
                <Link
                  to={`/subscribe/${plan.id}`}
                  className="btn btn-primary w-full"
                >
                  Subscribe Now
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="btn btn-primary w-full"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose BillSync?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Flexible Pricing</h4>
              <p className="text-gray-600 text-sm">Pay only for what you use with transparent overage pricing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Reliable Billing</h4>
              <p className="text-gray-600 text-sm">Automated billing on your chosen day with detailed invoices</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Setup</h4>
              <p className="text-gray-600 text-sm">Get started in minutes with our simple onboarding process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
