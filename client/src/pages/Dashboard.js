import React from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp,
  Home,
  UserCheck,
  Activity,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  // Fetch dashboard metrics
  const { data: totalProperties } = useQuery('totalProperties', dashboardAPI.getTotalProperties);
  const { data: activeListings } = useQuery('activeListings', dashboardAPI.getActiveListings);
  const { data: tenantCount } = useQuery('tenantCount', dashboardAPI.getTenantCount);
  const { data: landlordCount } = useQuery('landlordCount', dashboardAPI.getLandlordCount);
  const { data: revenue } = useQuery('revenue', dashboardAPI.getRevenue);
  const { data: newInquiries } = useQuery('newInquiries', dashboardAPI.getNewInquiriesToday);

  // Fetch recent data
  const { data: recentProperties } = useQuery('recentProperties', 
    () => dashboardAPI.getRecentProperties({ limit: 5 })
  );
  const { data: recentUsers } = useQuery('recentUsers', 
    () => dashboardAPI.getRecentUsers({ limit: 5 })
  );
  const { data: recentActivities } = useQuery('recentActivities', 
    () => dashboardAPI.getRecentActivities({ limit: 10 })
  );

  const stats = [
    {
      name: 'Total Properties',
      value: totalProperties?.data?.count || 0,
      icon: Building,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Listings',
      value: activeListings?.data?.count || 0,
      icon: Home,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Tenants',
      value: tenantCount?.data?.count || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Total Landlords',
      value: landlordCount?.data?.count || 0,
      icon: UserCheck,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: `₹${(revenue?.data?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+23%',
      changeType: 'positive'
    },
    {
      name: 'New Inquiries Today',
      value: newInquiries?.data?.count || 0,
      icon: Activity,
      color: 'bg-red-500',
      change: '+3',
      changeType: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </button>
          <button className="btn btn-primary">
            <TrendingUp className="h-4 w-4" />
            View Reports
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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

      {/* Recent Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentProperties?.data?.data?.map((property) => (
                <div key={property._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{property.title}</p>
                      <p className="text-sm text-gray-500">{property.city} • {property.property_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      property.status === 'published' ? 'badge-success' : 
                      property.status === 'draft' ? 'badge-warning' : 'badge-gray'
                    }`}>
                      {property.status}
                    </span>
                    {property.is_verified && (
                      <div className="text-xs text-green-600 mt-1">✓ Verified</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentUsers?.data?.data?.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      user.user_type === 'tenant' ? 'badge-info' : 
                      user.user_type === 'landlord' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {user.user_type}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {recentActivities?.data?.data?.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.type === 'property_created' ? 'bg-green-100 text-green-800' :
                  activity.type === 'user_registered' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'payment_completed' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;