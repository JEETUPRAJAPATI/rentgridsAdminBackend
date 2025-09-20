import express from 'express';
import {
  getAllPayments,
  getPaymentById,
  getPendingPayments,
  refundPayment,
  updatePaymentStatus,
  generateInvoice,
  getRevenueAnalytics,
  getFailedPayments,
  getPaymentGatewaySettings,
  updatePaymentGatewaySettings
} from '../controllers/paymentController.js';
import { protect, adminOnly, hasPermission } from '../middleware/auth.js';
import { validatePagination, validateId } from '../middleware/validation.js';

const router = express.Router();

// Payment management
router.get('/', protect, adminOnly, validatePagination, getAllPayments);
router.get('/pending', protect, adminOnly, getPendingPayments);
router.get('/failed', protect, adminOnly, getFailedPayments);
router.get('/analytics', protect, adminOnly, getRevenueAnalytics);
router.get('/:id', protect, adminOnly, validateId, getPaymentById);

// Payment operations
router.post('/refund', protect, hasPermission('payments', 'update'), refundPayment);
router.post('/update-status', protect, hasPermission('payments', 'update'), updatePaymentStatus);
router.post('/generate-invoice', protect, adminOnly, generateInvoice);

// Payment gateway settings
router.get('/settings', protect, adminOnly, getPaymentGatewaySettings);
router.post('/settings/update', protect, hasPermission('settings', 'update'), updatePaymentGatewaySettings);

export default router;