import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { subscriptionsAPI } from '../services/api';
import { 
  CreditCard, 
  Plus, 
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';

const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState('plans');

  // Fetch subscription plans
  const { data: plansData, isLoading: plansLoading } = useQuery(
    'subscriptionPlans',
    subscriptionsAPI.getPlans
  );

  // Fetch user subscriptions
  const { data: userSubscriptionsData, isLoading: subscriptionsLoading } = useQuery(
    'userSubscriptions',
    () => subscriptionsAPI.getUserSubscriptions({ limit: 20 })
  );

  // Fetch analytics
  const { data: analyticsData } = useQuery(
    'subscriptionAnalytics',
    subscriptionsAPI.getAnalytics
  );

  const stats = [
    {
      name: 'Total Subscriptions',
      value: analyticsData?.data?.summary?.total_subscriptions || 0,
      icon: CreditCard,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Subscriptions',
      value: analyticsData?.data?.summary?.active_subscriptions || 0,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Total Revenue',
      value: `₹${(analyticsData?.data?.summary?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      name: 'Monthly Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage subscription plans and user subscriptions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Create Plan
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('plans')}
          >
            Subscription Plans
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscriptions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('subscriptions')}
          >
            User Subscriptions
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="card-body">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            plansData?.data?.map((plan) => (
              <div key={plan._id} className={`card relative ${plan.is_popular ? 'ring-2 ring-indigo-500' : ''}`}>
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="card-body">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{plan.duration_days} days</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{plan.visit_credits} visit credits</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`badge ${
                        plan.status === 'active' ? 'badge-success' : 'badge-gray'
                      }`}>
                        {plan.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Plan"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete Plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Credits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptionsLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-2"></div>
                        Loading subscriptions...
                      </div>
                    </td>
                  </tr>
                ) : userSubscriptionsData?.data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  userSubscriptionsData?.data?.data?.map((subscription) => (
                    <tr key={subscription._id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{subscription.user_id?.name}</p>
                          <p className="text-sm text-gray-500">{subscription.user_id?.email}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{subscription.plan_id?.name}</p>
                          <p className="text-sm text-gray-500">₹{subscription.plan_id?.price?.toLocaleString()}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          subscription.status === 'active' ? 'badge-success' : 
                          subscription.status === 'expired' ? 'badge-danger' : 
                          subscription.status === 'cancelled' ? 'badge-gray' : 'badge-warning'
                        }`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-500">
                          {new Date(subscription.start_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-500">
                          {new Date(subscription.end_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm">
                          <p className="text-gray-900">{subscription.remaining_credits} remaining</p>
                          <p className="text-gray-500">of {subscription.total_credits}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Add Credits"
                          >
                            Add Credits
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Cancel Subscription"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Plan</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {analyticsData?.data?.summary?.plan_breakdown?.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{plan._id}</p>
                      <p className="text-sm text-gray-500">{plan.count} subscribers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{plan.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {analyticsData?.data?.summary?.monthly_revenue?.slice(0, 6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{month.count} payments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{month.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;