import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { paymentsAPI } from '../services/api';
import { 
  DollarSign, 
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

const Payments = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    start_date: '',
    end_date: '',
    user_type: ''
  });

  // Fetch payments
  const { data: paymentsData, isLoading } = useQuery(
    ['payments', filters],
    () => paymentsAPI.getAllPayments(filters),
    { keepPreviousData: true }
  );

  // Fetch analytics
  const { data: analyticsData } = useQuery(
    'paymentAnalytics',
    paymentsAPI.getRevenueAnalytics
  );

  // Fetch pending payments
  const { data: pendingPayments } = useQuery(
    'pendingPayments',
    paymentsAPI.getPendingPayments
  );

  // Fetch failed payments
  const { data: failedPayments } = useQuery(
    'failedPayments',
    paymentsAPI.getFailedPayments
  );

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
      refunded: 'badge-info',
      cancelled: 'badge-gray'
    };
    return badges[status] || 'badge-gray';
  };

  const stats = [
    {
      name: 'Total Revenue',
      value: `₹${(analyticsData?.data?.summary?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      name: 'Monthly Revenue',
      value: `₹${(analyticsData?.data?.summary?.monthly_revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+8%'
    },
    {
      name: 'Pending Payments',
      value: pendingPayments?.data?.data?.length || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-2'
    },
    {
      name: 'Failed Payments',
      value: failedPayments?.data?.data?.length || 0,
      icon: XCircle,
      color: 'bg-red-500',
      change: '+1'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="btn btn-primary">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                className="form-input pl-10"
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="form-select"
              value={filters.user_type}
              onChange={(e) => handleFilterChange('user_type', e.target.value)}
            >
              <option value="">All Users</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
            <input
              type="date"
              className="form-input"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              className="form-input"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Loading payments...
                    </div>
                  </td>
                </tr>
              ) : paymentsData?.data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                paymentsData?.data?.data?.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className="font-mono text-sm text-gray-900">
                        {payment.payment_id}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{payment.user_id?.name}</p>
                        <p className="text-sm text-gray-500">{payment.user_id?.email}</p>
                        <span className={`badge ${
                          payment.user_type === 'tenant' ? 'badge-info' : 'badge-success'
                        }`}>
                          {payment.user_type}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{payment.plan_id?.name}</p>
                        <p className="text-sm text-gray-500">₹{payment.plan_id?.price?.toLocaleString()}</p>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </div>
                      {payment.currency && (
                        <div className="text-sm text-gray-500">{payment.currency}</div>
                      )}
                    </td>
                    <td>
                      <div className="capitalize text-sm text-gray-600">
                        {payment.payment_method}
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-gray-500 font-mono">
                          {payment.transaction_id.substring(0, 12)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`badge ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      {payment.status === 'refunded' && payment.refund_amount && (
                        <div className="text-xs text-blue-600 mt-1">
                          Refunded: ₹{payment.refund_amount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            className="text-orange-600 hover:text-orange-800"
                            title="Refund Payment"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="Generate Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paymentsData?.data?.pagination && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((paymentsData.data.pagination.page - 1) * paymentsData.data.pagination.limit) + 1} to{' '}
                {Math.min(paymentsData.data.pagination.page * paymentsData.data.pagination.limit, paymentsData.data.pagination.total)} of{' '}
                {paymentsData.data.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={paymentsData.data.pagination.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {paymentsData.data.pagination.page} of {paymentsData.data.pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={paymentsData.data.pagination.page === paymentsData.data.pagination.pages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Revenue Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Plan</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {Object.entries(analyticsData?.data?.summary?.plan_breakdown || {}).map(([plan, revenue]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{plan}</span>
                  <span className="font-medium text-gray-900">₹{revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Revenue Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Daily Revenue (Last 7 days)</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {analyticsData?.data?.summary?.daily_revenue?.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-900">₹{day.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;