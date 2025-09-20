import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Download,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    user_type: '',
    is_blocked: ''
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading } = useQuery(
    ['users', filters],
    () => usersAPI.getUsers(filters),
    { keepPreviousData: true }
  );

  // Fetch user stats
  const { data: statsData } = useQuery('userStats', usersAPI.getUserStats);

  // Delete user mutation
  const deleteUserMutation = useMutation(usersAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      queryClient.invalidateQueries('userStats');
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  // Block/Unblock user mutation
  const blockUserMutation = useMutation(
    ({ id, is_blocked }) => usersAPI.blockUser(id, { is_blocked }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('users');
        const action = variables.is_blocked ? 'blocked' : 'unblocked';
        toast.success(`User ${action} successfully`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  );

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation(usersAPI.bulkDeleteUsers, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('users');
      queryClient.invalidateQueries('userStats');
      setSelectedUsers([]);
      toast.success(`${data.data.deletedCount} users deleted successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete users');
    }
  });

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === usersData?.data?.data?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData?.data?.data?.map(user => user._id) || []);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      bulkDeleteMutation.mutate({ userIds: selectedUsers });
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleBlockUser = (userId, isBlocked) => {
    blockUserMutation.mutate({ id: userId, is_blocked: !isBlocked });
  };

  const stats = [
    {
      name: 'Total Users',
      value: statsData?.data?.total_users || 0,
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Users',
      value: statsData?.data?.active_users || 0,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      name: 'Blocked Users',
      value: statsData?.data?.blocked_users || 0,
      icon: UserX,
      color: 'bg-red-500'
    },
    {
      name: 'New This Month',
      value: statsData?.data?.new_users_this_month || 0,
      icon: Plus,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage all users, tenants, and landlords</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add User
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

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="form-input pl-10"
                  value={filters.search}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <select
                className="form-select"
                value={filters.user_type}
                onChange={(e) => handleFilterChange('user_type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="both">Both</option>
              </select>
              <select
                className="form-select"
                value={filters.is_blocked}
                onChange={(e) => handleFilterChange('is_blocked', e.target.value)}
              >
                <option value="">All Users</option>
                <option value="false">Active</option>
                <option value="true">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === usersData?.data?.data?.length && usersData?.data?.data?.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : usersData?.data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                usersData?.data?.data?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="rounded"
                      />
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.user_type === 'tenant' ? 'badge-info' : 
                        user.user_type === 'landlord' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={`badge ${
                          user.status === 'active' ? 'badge-success' : 
                          user.status === 'inactive' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {user.status}
                        </span>
                        {user.is_blocked && (
                          <span className="badge badge-danger">Blocked</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className={`${user.is_blocked ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
                          title={user.is_blocked ? 'Unblock User' : 'Block User'}
                          onClick={() => handleBlockUser(user._id, user.is_blocked)}
                          disabled={blockUserMutation.isLoading}
                        >
                          {user.is_blocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deleteUserMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
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
        {usersData?.data?.pagination && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((usersData.data.pagination.page - 1) * usersData.data.pagination.limit) + 1} to{' '}
                {Math.min(usersData.data.pagination.page * usersData.data.pagination.limit, usersData.data.pagination.total)} of{' '}
                {usersData.data.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={usersData.data.pagination.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {usersData.data.pagination.page} of {usersData.data.pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={usersData.data.pagination.page === usersData.data.pagination.pages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;