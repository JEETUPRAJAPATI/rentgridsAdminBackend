import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { staffAPI } from '../services/api';
import { 
  UserCheck, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Staff = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    role_id: ''
  });

  // Fetch staff
  const { data: staffData, isLoading } = useQuery(
    ['staff', filters],
    () => staffAPI.getStaff(filters),
    { keepPreviousData: true }
  );

  // Fetch staff stats
  const { data: statsData } = useQuery('staffStats', staffAPI.getStaffStats);

  // Fetch tasks
  const { data: tasksData } = useQuery(
    'allTasks',
    () => staffAPI.getAllTasks({ limit: 10 })
  );

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const stats = [
    {
      name: 'Total Staff',
      value: statsData?.data?.total_staff || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Staff',
      value: statsData?.data?.active_staff || 0,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      name: 'Inactive Staff',
      value: statsData?.data?.inactive_staff || 0,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      name: 'Suspended Staff',
      value: statsData?.data?.suspended_staff || 0,
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff members, roles, and tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add Staff
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
            </div>
            <div className="card-body">
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      className="form-input pl-10"
                      value={filters.search}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Staff Cards */}
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : staffData?.data?.data?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No staff members found
                  </div>
                ) : (
                  staffData?.data?.data?.map((staff) => (
                    <div key={staff._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          {staff.avatar ? (
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-indigo-600 font-medium">
                              {staff.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff.name}</p>
                          <p className="text-sm text-gray-500">{staff.email}</p>
                          <p className="text-sm text-gray-500">{staff.phone}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {staff.role_id?.name}
                            </span>
                            <span className={`badge ${
                              staff.status === 'active' ? 'badge-success' : 
                              staff.status === 'inactive' ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {staff.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="Edit Staff"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete Staff"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {tasksData?.data?.data?.slice(0, 5).map((task) => (
                  <div key={task._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned to: {task.staff_id?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`badge ${
                            task.status === 'completed' ? 'badge-success' : 
                            task.status === 'in-progress' ? 'badge-info' : 
                            task.status === 'pending' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`badge ${
                            task.priority === 'urgent' ? 'badge-danger' : 
                            task.priority === 'high' ? 'badge-warning' : 
                            task.priority === 'medium' ? 'badge-info' : 'badge-gray'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Staff by Role */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Staff by Role</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {statsData?.data?.staff_by_role?.map((role, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role._id}</span>
                    <span className="font-medium text-gray-900">{role.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;