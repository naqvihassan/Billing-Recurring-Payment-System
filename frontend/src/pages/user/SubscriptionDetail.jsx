import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import api from "../../api/axios";

export default function SubscriptionDetail() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [subscriptionId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/subscriptions/${subscriptionId}`);
      setSubscription(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Error loading subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await api.put(`/user/subscriptions/${subscriptionId}/cancel`);
      await fetchSubscription();
      setShowCancelConfirm(false);
    } catch (e) {
      setError(e.response?.data?.message || "Error cancelling subscription");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="container py-6">
        <div className="card text-center">
          <div className="text-red-600 mb-4">{error || "Subscription not found"}</div>
          <Link to="/user/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link to="/user/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subscription.plan?.name}</h1>
            <p className="text-gray-600 mt-1">Subscription Details</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(subscription.monthly_fee_snapshot)}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Billing Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Billing Day:</span>
                <span className="font-medium">{subscription.billing_day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Billing:</span>
                <span className="font-medium">{formatDate(subscription.next_billing_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">{formatDate(subscription.started_at)}</span>
              </div>
              {subscription.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled:</span>
                  <span className="font-medium">{formatDate(subscription.cancelled_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Plan Features</h3>
            {subscription.plan?.Features && subscription.plan.Features.length > 0 ? (
              <div className="space-y-2">
                {subscription.plan.Features.map((feature) => (
                  <div key={feature.id} className="flex justify-between items-center">
                    <span className="text-sm">{feature.name}</span>
                    <span className="text-xs text-gray-500">
                      {feature.max_unit_limit > 0 ? `Up to ${feature.max_unit_limit}` : 'Unlimited'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No features included</p>
            )}
          </div>
        </div>

        {subscription.status === 'active' && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Subscription</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You can cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.
                </p>
              </div>
              <button
                className="btn-danger"
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        )}

        {subscription.status === 'cancelled' && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Subscription Cancelled</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your subscription has been cancelled. You'll continue to have access until the end of your current billing period.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
              >
                Keep Subscription
              </button>
              <button
                className="btn-danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
