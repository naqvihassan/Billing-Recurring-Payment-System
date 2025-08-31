import axios from '../api/axios';

export const fetchAdminDashboardStats = async () => {
  const response = await axios.get('/admin/dashboard-stats');
  return response.data;
};

export const runBillingForDueAccounts = async () => {
  const response = await axios.post('/admin/run-billing');
  return response.data;
};
