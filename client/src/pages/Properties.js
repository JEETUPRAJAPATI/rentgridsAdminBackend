import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { propertiesAPI } from '../services/api';
import { 
  Building, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const Properties = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    property_type: '',
    listing_type: '',
    status: '',
    city: '',
    is_featured: '',
    is_verified: ''
  });

  const queryClient = useQueryClient();

  // Fetch properties
  const { data: propertiesData, isLoading } = useQuery(
    ['properties', filters],
    () => propertiesAPI.getProperties(filters),
    { keepPreviousData: true }
  );

  // Fetch property stats
  const { data: statsData } = useQuery('propertyStats', propertiesAPI.getPropertyStats);

  // Delete property mutation
  const deletePropertyMutation = useMutation(propertiesAPI.deleteProperty, {
    onSuccess: () => {
      queryClient.invalidateQueries('properties');
      queryClient.invalidateQueries('propertyStats');
      toast.success('Property deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete property');
    }
  });

  // Verify property mutation
  const verifyPropertyMutation = useMutation(propertiesAPI.verifyProperty, {
    onSuccess: () => {
      queryClient.invalidateQueries('properties');
      toast.success('Property verified successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify property');
    }
  });

  // Reject property mutation
  const rejectPropertyMutation = useMutation(
    ({ id, reason }) => propertiesAPI.rejectProperty(id, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties');
        toast.success('Property rejected successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject property');
      }
    }
  );

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deletePropertyMutation.mutate(propertyId);
    }
  };

  const handleVerifyProperty = (propertyId) => {
    verifyPropertyMutation.mutate(propertyId);
  };

  const handleRejectProperty = (propertyId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectPropertyMutation.mutate({ id: propertyId, reason });
    }
  };

  const formatPrice = (price, type) => {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString()}${type === 'rent' ? '/month' : ''}`;
  };

  const stats = [
    {
      name: 'Total Properties',
      value: statsData?.data?.total_properties || 0,
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      name: 'Published',
      value: statsData?.data?.published_properties || 0,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      name: 'Draft',
      value: statsData?.data?.draft_properties || 0,
      icon: Edit,
      color: 'bg-yellow-500'
    },
    {
      name: 'Featured',
      value: statsData?.data?.featured_properties || 0,
      icon: Star,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
          <p className="text-gray-600">Manage all property listings and verifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add Property
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="form-input pl-10"
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
            <select
              className="form-select"
              value={filters.property_type}
              onChange={(e) => handleFilterChange('property_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
              <option value="office">Office</option>
            </select>
            <select
              className="form-select"
              value={filters.listing_type}
              onChange={(e) => handleFilterChange('listing_type', e.target.value)}
            >
              <option value="">All Listings</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
              <option value="both">Both</option>
            </select>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="card-body">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : propertiesData?.data?.data?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No properties found</p>
          </div>
        ) : (
          propertiesData?.data?.data?.map((property) => (
            <div key={property._id} className="card hover:shadow-lg transition-shadow duration-200">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`badge ${
                    property.status === 'published' ? 'badge-success' : 
                    property.status === 'draft' ? 'badge-warning' : 'badge-gray'
                  }`}>
                    {property.status}
                  </span>
                  {property.is_featured && (
                    <span className="badge bg-purple-100 text-purple-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Verification status */}
                <div className="absolute top-2 right-2">
                  {property.is_verified ? (
                    <div className="bg-green-100 text-green-800 p-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 p-1 rounded-full">
                      <XCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="card-body">
                {/* Property Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.locality}, {property.city}
                </div>

                {/* Property Details */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{property.bedroom} BHK • {property.area} {property.area_unit}</span>
                  <span className="capitalize">{property.property_type}</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {property.listing_type === 'rent' && (
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(property.monthly_rent, 'rent')}
                      </p>
                    )}
                    {property.listing_type === 'sale' && (
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(property.sale_price, 'sale')}
                      </p>
                    )}
                    {property.listing_type === 'both' && (
                      <div>
                        <p className="text-sm font-semibold text-green-600">
                          {formatPrice(property.monthly_rent, 'rent')}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          {formatPrice(property.sale_price, 'sale')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Views: {property.views}</p>
                    <p className="text-xs text-gray-500">Inquiries: {property.inquiries}</p>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {property.owner_id?.name}</span>
                  <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      title="Edit Property"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      title="Delete Property"
                      onClick={() => handleDeleteProperty(property._id)}
                      disabled={deletePropertyMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Verification Actions */}
                  {!property.is_verified && (
                    <div className="flex items-center space-x-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleVerifyProperty(property._id)}
                        disabled={verifyPropertyMutation.isLoading}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Verify
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectProperty(property._id)}
                        disabled={rejectPropertyMutation.isLoading}
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {propertiesData?.data?.pagination && (
        <div className="card">
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((propertiesData.data.pagination.page - 1) * propertiesData.data.pagination.limit) + 1} to{' '}
                {Math.min(propertiesData.data.pagination.page * propertiesData.data.pagination.limit, propertiesData.data.pagination.total)} of{' '}
                {propertiesData.data.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={propertiesData.data.pagination.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {propertiesData.data.pagination.page} of {propertiesData.data.pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={propertiesData.data.pagination.page === propertiesData.data.pagination.pages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;