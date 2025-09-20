import Payment from '../models/Payment.js';
import User from '../models/User.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination } from '../utils/pagination.js';

// Get all payments
export const getAllPayments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status = '',
    start_date = '',
    end_date = '',
    user_type = ''
  } = req.query;

  const filter = {};
  
  if (status) filter.status = status;
  if (user_type) filter.user_type = user_type;
  
  if (start_date || end_date) {
    filter.createdAt = {};
    if (start_date) filter.createdAt.$gte = new Date(start_date);
    if (end_date) filter.createdAt.$lte = new Date(end_date);
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const payments = await Payment.find(filter)
    .populate('user_id', 'name email user_type')
    .populate('plan_id', 'name price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Payment.countDocuments(filter);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

// Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ payment_id: req.params.id })
    .populate('user_id', 'name email phone user_type')
    .populate('plan_id', 'name price duration_days features')
    .populate('processed_by', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  res.json({
    success: true,
    data: payment
  });
});

// Get pending payments
export const getPendingPayments = asyncHandler(async (req, res) => {
  const pendingPayments = await Payment.find({ status: 'pending' })
    .populate('user_id', 'name email user_type')
    .populate('plan_id', 'name price')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: pendingPayments
  });
});

// Refund payment
export const refundPayment = asyncHandler(async (req, res) => {
  const { payment_id, reason } = req.body;

  const payment = await Payment.findOne({ payment_id });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  if (payment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Only completed payments can be refunded'
    });
  }

  // In a real application, you would integrate with payment gateway APIs
  // For now, we'll just update the status
  payment.status = 'refunded';
  payment.refund_amount = payment.amount;
  payment.refund_reason = reason;
  payment.refunded_at = new Date();
  payment.processed_by = req.user._id;

  await payment.save();

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      payment_id: payment.payment_id,
      status: payment.status,
      refund_amount: payment.refund_amount
    }
  });
});

// Update payment status manually
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { payment_id, status } = req.body;

  const payment = await Payment.findOne({ payment_id });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  payment.status = status;
  payment.processed_by = req.user._id;

  await payment.save();

  res.json({
    success: true,
    message: 'Payment status updated successfully',
    data: {
      payment_id: payment.payment_id,
      status: payment.status
    }
  });
});

// Generate invoice
export const generateInvoice = asyncHandler(async (req, res) => {
  const { payment_id } = req.body;

  const payment = await Payment.findOne({ payment_id })
    .populate('user_id', 'name email phone address')
    .populate('plan_id', 'name price duration_days features');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // In a real application, you would generate a PDF invoice
  // For now, we'll create a simple invoice URL
  const invoiceUrl = `${req.protocol}://${req.get('host')}/invoices/${payment_id}.pdf`;
  
  // Update payment with invoice URL
  payment.invoice_url = invoiceUrl;
  await payment.save();

  res.json({
    success: true,
    message: 'Invoice generated successfully',
    data: {
      invoice_url: invoiceUrl
    }
  });
});

// Get revenue analytics
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const monthlyRevenue = await Payment.aggregate([
    { 
      $match: { 
        status: 'completed',
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const dailyRevenue = await Payment.aggregate([
    { 
      $match: { 
        status: 'completed',
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  const planBreakdown = await Payment.aggregate([
    { $match: { status: 'completed' } },
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'plan_id',
        foreignField: '_id',
        as: 'plan'
      }
    },
    { $unwind: '$plan' },
    {
      $group: {
        _id: '$plan.name',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        total_revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthly_revenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
        daily_revenue: dailyRevenue.map(item => ({
          date: item._id.date,
          amount: item.amount
        })),
        plan_breakdown: planBreakdown.reduce((acc, item) => {
          acc[item._id] = item.revenue;
          return acc;
        }, {})
      }
    }
  });
});

// Get failed payments
export const getFailedPayments = asyncHandler(async (req, res) => {
  const failedPayments = await Payment.find({ status: 'failed' })
    .populate('user_id', 'name email user_type')
    .populate('plan_id', 'name price')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: failedPayments
  });
});

// Get payment gateway settings
export const getPaymentGatewaySettings = asyncHandler(async (req, res) => {
  // In a real application, you would fetch these from a settings model
  // For now, return mock data
  const settings = {
    razorpay: {
      status: 'enabled',
      api_key: 'rzp_test_***'
    },
    stripe: {
      status: 'enabled',
      api_key: 'pk_test_***'
    }
  };

  res.json({
    success: true,
    data: { gateways: settings }
  });
});

// Update payment gateway settings
export const updatePaymentGatewaySettings = asyncHandler(async (req, res) => {
  const { gateway, api_key, api_secret } = req.body;

  // In a real application, you would save these to a settings model
  // For now, just return success

  res.json({
    success: true,
    message: 'Payment gateway settings updated successfully'
  });
});