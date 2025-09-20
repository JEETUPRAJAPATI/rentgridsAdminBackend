import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Dashboard API
export const dashboardAPI = {
  // Metrics
  getTotalProperties: () => api.get('/admin/dashboard/metrics/total-properties'),
  getActiveListings: () => api.get('/admin/dashboard/metrics/active-listings'),
  getActiveLeases: () => api.get('/admin/dashboard/metrics/active-leases'),
  getTenantCount: () => api.get('/admin/dashboard/metrics/tenant-count'),
  getLandlordCount: () => api.get('/admin/dashboard/metrics/landlord-count'),
  getRevenue: () => api.get('/admin/dashboard/metrics/revenue'),
  getAdminCount: () => api.get('/admin/dashboard/metrics/admin-count'),
  getNewInquiriesToday: () => api.get('/admin/dashboard/metrics/new-inquiries-today'),

  // Charts
  getPropertyStatusChart: () => api.get('/admin/dashboard/charts/property-status'),
  getRevenueTrendChart: () => api.get('/admin/dashboard/charts/revenue-trend'),
  getUserGrowthChart: () => api.get('/admin/dashboard/charts/user-growth'),

  // Recent data
  getRecentProperties: (params) => api.get('/admin/dashboard/recent/properties', { params }),
  getRecentUsers: (params) => api.get('/admin/dashboard/recent/users', { params }),
  getRecentActivities: (params) => api.get('/admin/dashboard/recent/activities', { params }),
};


// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  blockUser: (id, data) => api.patch(`/admin/users/${id}/block`, data),
  bulkDeleteUsers: (data) => api.post('/admin/users/bulk-delete', data),
  getUserStats: () => api.get('/admin/users/stats'),
  exportUsers: (params) => api.get('/admin/users/export', { params }),
};

// Properties API
export const propertiesAPI = {
  getProperties: (params) => api.get('/properties', { params }),
  getPropertyById: (id, params) => api.get(`/properties/${id}`, { params }),
  createProperty: (data) => api.post('/properties', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  updatePropertyStatus: (id, data) => api.patch(`/properties/${id}/status`, data),
  verifyProperty: (id) => api.post(`/properties/${id}/verify`),
  rejectProperty: (id, data) => api.post(`/properties/${id}/reject`, data),
  getPropertyStats: () => api.get('/properties/stats'),
  getFeaturedProperties: (params) => api.get('/properties/featured', { params }),
  searchProperties: (params) => api.get('/properties/search', { params }),
};

// Staff API
export const staffAPI = {
  getStaff: (params) => api.get('/admin/staff', { params }),
  getStaffById: (id) => api.get(`/admin/staff/${id}`),
  createStaff: (data) => api.post('/admin/staff', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  updateStaffStatus: (id, data) => api.patch(`/admin/staff/${id}/status`, data),
  assignRole: (id, data) => api.patch(`/admin/staff/${id}/assign-role`, data),
  getStaffStats: () => api.get('/admin/staff/stats'),

  // Tasks
  getAllTasks: (params) => api.get('/admin/staff/tasks/all', { params }),
  createTask: (data) => api.post('/admin/staff/tasks', data),
  updateTaskStatus: (id, data) => api.patch(`/admin/staff/tasks/${id}/status`, data),

  // Performance
  getStaffPerformance: (id, params) => api.get(`/admin/staff/${id}/performance`, { params }),
  logPerformance: (data) => api.post('/admin/staff/performance-log', data),
};

// Subscriptions API
export const subscriptionsAPI = {
  getPlans: () => api.get('/admin/subscriptions/plans'),
  createPlan: (data) => api.post('/admin/subscriptions/create', data),
  getPlanById: (id) => api.get(`/admin/subscriptions/${id}`),
  updatePlan: (data) => api.post('/admin/subscriptions/update', data),
  deletePlan: (id) => api.delete(`/admin/subscriptions/${id}`),
  getUserSubscriptions: (params) => api.get('/admin/subscriptions/user-subscriptions', { params }),
  cancelUserSubscription: (data) => api.post('/admin/subscriptions/user-subscription/cancel', data),
  addBonusCredits: (data) => api.post('/admin/subscriptions/user-subscription/add-credits', data),
  suspendUserSubscription: (data) => api.post('/admin/subscriptions/user-subscription/suspend', data),
  getAnalytics: () => api.get('/admin/subscriptions/reports/subscriptions'),
  getPlanUsageReport: (id) => api.get(`/admin/subscriptions/usage/${id}`),
  bulkUpdatePlans: (data) => api.post('/admin/subscriptions/bulk-update', data),
};

// Payments API
export const paymentsAPI = {
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentById: (id) => api.get(`/admin/payments/${id}`),
  getPendingPayments: () => api.get('/admin/payments/pending'),
  getFailedPayments: () => api.get('/admin/payments/failed'),
  refundPayment: (data) => api.post('/admin/payments/refund', data),
  updatePaymentStatus: (data) => api.post('/admin/payments/update-status', data),
  generateInvoice: (data) => api.post('/admin/payments/generate-invoice', data),
  getRevenueAnalytics: () => api.get('/admin/payments/analytics'),
  getPaymentSettings: () => api.get('/admin/payments/settings'),
  updatePaymentSettings: (data) => api.post('/admin/payments/settings/update', data),
};

// Roles and Permissions API
export const rolesAPI = {
  getRoles: () => api.get('/admin/roles'),
  createRole: (data) => api.post('/admin/roles', data),
  getPermissions: () => api.get('/admin/permissions'),
  createPermission: (data) => api.post('/admin/permissions', data),
};

// Admins API
export const adminsAPI = {
  getAdmins: (params) => api.get('/admin/admins', { params }),
  getAdminById: (id) => api.get(`/admin/admins/${id}`),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
};

export default api;