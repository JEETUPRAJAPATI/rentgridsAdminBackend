import express from 'express';
import {
  // Metrics
  getTotalProperties,
  getActiveListings,
  getActiveLeases,
  getTenantCount,
  getLandlordCount,
  getRevenue,
  getAdminCount,
  getNewInquiriesToday,
  
  // Charts
  getPropertyStatusChart,
  getRevenueTrendChart,
  getUserGrowthChart,
  getLeaseStatusChart,
  getInquirySourceChart,
  
  // Recent Data
  getRecentProperties,
  getRecentUsers,
  getRecentActivities
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require admin access
router.use(protect, adminOnly);

// Metrics endpoints
router.get('/metrics/total-properties', getTotalProperties);
router.get('/metrics/active-listings', getActiveListings);
router.get('/metrics/active-leases', getActiveLeases);
router.get('/metrics/tenant-count', getTenantCount);
router.get('/metrics/landlord-count', getLandlordCount);
router.get('/metrics/revenue', getRevenue);
router.get('/metrics/admin-count', getAdminCount);
router.get('/metrics/new-inquiries-today', getNewInquiriesToday);

// Chart endpoints
router.get('/charts/property-status', getPropertyStatusChart);
router.get('/charts/revenue-trend', getRevenueTrendChart);
router.get('/charts/user-growth', getUserGrowthChart);
router.get('/charts/lease-status', getLeaseStatusChart);
router.get('/charts/inquiry-source', getInquirySourceChart);

// Recent data endpoints
router.get('/recent/properties', getRecentProperties);
router.get('/recent/users', getRecentUsers);
router.get('/recent/activities', getRecentActivities);

export default router;