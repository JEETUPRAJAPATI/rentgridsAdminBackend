import express from 'express';
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getUserSubscriptions,
  getSubscriptionAnalytics,
  cancelUserSubscription,
  addBonusCredits,
  suspendUserSubscription,
  getPlanUsageReport,
  bulkUpdatePlans
} from '../controllers/subscriptionController.js';
import { protect, adminOnly, hasPermission } from '../middleware/auth.js';
import {
  validateCreateSubscriptionPlan,
  validatePagination,
  validateId
} from '../middleware/validation.js';

const router = express.Router();

// Subscription plan management
router.get('/plans', protect, adminOnly, getSubscriptionPlans);
router.post('/create', protect, hasPermission('subscriptions', 'create'), validateCreateSubscriptionPlan, createSubscriptionPlan);
router.get('/:id', protect, adminOnly, validateId, getSubscriptionPlanById);
router.post('/update', protect, hasPermission('subscriptions', 'update'), updateSubscriptionPlan);
router.delete('/:id', protect, hasPermission('subscriptions', 'delete'), validateId, deleteSubscriptionPlan);

// User subscription management
router.get('/user-subscriptions', protect, adminOnly, validatePagination, getUserSubscriptions);
router.post('/user-subscription/cancel', protect, hasPermission('subscriptions', 'update'), cancelUserSubscription);
router.post('/user-subscription/add-credits', protect, hasPermission('subscriptions', 'update'), addBonusCredits);
router.post('/user-subscription/suspend', protect, hasPermission('subscriptions', 'update'), suspendUserSubscription);

// Analytics and reporting
router.get('/reports/subscriptions', protect, adminOnly, getSubscriptionAnalytics);
router.get('/usage/:id', protect, adminOnly, validateId, getPlanUsageReport);

// Bulk operations
router.post('/bulk-update', protect, hasPermission('subscriptions', 'update'), bulkUpdatePlans);

export default router;