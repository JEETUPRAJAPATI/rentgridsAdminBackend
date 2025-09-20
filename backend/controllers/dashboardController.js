import User from '../models/User.js';
import Property from '../models/Property.js';
import Payment from '../models/Payment.js';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Metrics Controllers
export const getTotalProperties = asyncHandler(async (req, res) => {
  const count = await Property.countDocuments();
  
  res.json({
    success: true,
    data: { count }
  });
});

export const getActiveListings = asyncHandler(async (req, res) => {
  const count = await Property.countDocuments({ status: 'published' });
  
  res.json({
    success: true,
    data: { count }
  });
});

export const getActiveLeases = asyncHandler(async (req, res) => {
  const count = await Property.countDocuments({ 
    status: 'rented',
    listing_type: 'rent'
  });
  
  res.json({
    success: true,
    data: { count }
  });
});

export const getTenantCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments({ 
    user_type: { $in: ['tenant', 'both'] }
  });
  
  res.json({
    success: true,
    data: { count }
  });
});

export const getLandlordCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments({ 
    user_type: { $in: ['landlord', 'both'] }
  });
  
  res.json({
    success: true,
    data: { count }
  });
});

export const getRevenue = asyncHandler(async (req, res) => {
  const result = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const revenue = result.length > 0 ? result[0].total : 0;
  
  res.json({
    success: true,
    data: { revenue }
  });
});

export const getAdminCount = asyncHandler(async (req, res) => {
  const count = await Admin.countDocuments({ status: 'active' });
  
  res.json({
    success: true,
    data: { count }
  });
});

export const getNewInquiriesToday = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  // For now, return a mock count
  // In a real app, you'd have an Inquiries model
  const count = 0;
  
  res.json({
    success: true,
    data: { count }
  });
});

// Chart Controllers
export const getPropertyStatusChart = asyncHandler(async (req, res) => {
  const data = await Property.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  res.json({
    success: true,
    data
  });
});

export const getRevenueTrendChart = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const data = await Payment.aggregate([
    { 
      $match: { 
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  res.json({
    success: true,
    data
  });
});

export const getUserGrowthChart = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const data = await User.aggregate([
    { 
      $match: { 
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          user_type: '$user_type'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  res.json({
    success: true,
    data
  });
});

export const getLeaseStatusChart = asyncHandler(async (req, res) => {
  const data = await Property.aggregate([
    { $match: { listing_type: { $in: ['rent', 'both'] } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  res.json({
    success: true,
    data
  });
});

export const getInquirySourceChart = asyncHandler(async (req, res) => {
  // Mock data for inquiry sources
  const data = [
    { _id: 'Website', count: 45 },
    { _id: 'Mobile App', count: 32 },
    { _id: 'Referral', count: 18 },
    { _id: 'Social Media', count: 12 },
    { _id: 'Other', count: 8 }
  ];
  
  res.json({
    success: true,
    data
  });
});

// Recent Data Controllers
export const getRecentProperties = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const properties = await Property.find()
    .populate('owner_id', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('title property_type city status is_verified createdAt');
  
  res.json({
    success: true,
    data: properties
  });
});

export const getRecentUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('name email user_type status createdAt');
  
  res.json({
    success: true,
    data: users
  });
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  // Mock activity data - in a real app, you'd have an Activities model
  const activities = [
    {
      id: 1,
      type: 'property_created',
      message: 'New property listed by John Doe',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 2,
      type: 'user_registered',
      message: 'New user registration: Jane Smith',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: 3,
      type: 'payment_completed',
      message: 'Payment completed for subscription',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
    }
  ];
  
  res.json({
    success: true,
    data: activities.slice(0, parseInt(limit))
  });
});