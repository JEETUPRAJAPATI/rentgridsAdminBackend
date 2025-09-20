import SubscriptionPlan from '../models/SubscriptionPlan.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination } from '../utils/pagination.js';

// Subscription Plan Management
export const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find({ status: 'active' })
    .sort({ sort_order: 1, price: 1 });

  res.json({
    success: true,
    data: plans
  });
});

export const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    duration_days,
    visit_credits,
    features,
    status,
    is_popular,
    sort_order
  } = req.body;

  // Check if plan already exists
  const existingPlan = await SubscriptionPlan.findOne({ name });
  if (existingPlan) {
    return res.status(400).json({
      success: false,
      message: 'Subscription plan with this name already exists'
    });
  }

  const plan = await SubscriptionPlan.create({
    name,
    price,
    duration_days,
    visit_credits,
    features,
    status,
    is_popular: is_popular || false,
    sort_order: sort_order || 0
  });

  res.status(201).json({
    success: true,
    message: 'Subscription plan created successfully',
    data: plan
  });
});

export const getSubscriptionPlanById = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  res.json({
    success: true,
    data: plan
  });
});

export const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const { plan_id, price, visit_credits, features, status } = req.body;

  const plan = await SubscriptionPlan.findByIdAndUpdate(
    plan_id,
    {
      price,
      visit_credits,
      features,
      status
    },
    { new: true, runValidators: true }
  );

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  res.json({
    success: true,
    message: 'Subscription plan updated successfully',
    data: plan
  });
});

export const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  // Check if any users have active subscriptions for this plan
  const activeSubscriptions = await UserSubscription.countDocuments({
    plan_id: req.params.id,
    status: 'active'
  });

  if (activeSubscriptions > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete plan. ${activeSubscriptions} active subscriptions exist.`
    });
  }

  await SubscriptionPlan.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Subscription plan deleted successfully'
  });
});

// User Subscription Management
export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const subscriptions = await UserSubscription.find()
    .populate('user_id', 'name email user_type')
    .populate('plan_id', 'name price duration_days')
    .populate('payment_id', 'payment_id amount status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await UserSubscription.countDocuments();

  res.json({
    success: true,
    data: subscriptions,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

export const cancelUserSubscription = asyncHandler(async (req, res) => {
  const { user_id, reason } = req.body;

  const subscription = await UserSubscription.findOne({
    user_id,
    status: 'active'
  }).populate('user_id', 'name email');

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: 'Active subscription not found for this user'
    });
  }

  subscription.status = 'cancelled';
  subscription.cancelled_at = new Date();
  subscription.cancelled_by = req.user._id;
  subscription.cancellation_reason = reason;

  await subscription.save();

  res.json({
    success: true,
    message: 'User subscription cancelled successfully',
    data: subscription
  });
});

export const addBonusCredits = asyncHandler(async (req, res) => {
  const { user_id, credits, reason } = req.body;

  const subscription = await UserSubscription.findOne({
    user_id,
    status: 'active'
  }).populate('user_id', 'name email');

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: 'Active subscription not found for this user'
    });
  }

  subscription.remaining_credits += parseInt(credits);
  subscription.total_credits += parseInt(credits);

  await subscription.save();

  res.json({
    success: true,
    message: `${credits} bonus credits added successfully`,
    data: {
      user: subscription.user_id,
      remaining_credits: subscription.remaining_credits,
      reason
    }
  });
});

export const suspendUserSubscription = asyncHandler(async (req, res) => {
  const { user_id, action } = req.body;

  const subscription = await UserSubscription.findOne({
    user_id,
    status: { $in: ['active', 'suspended'] }
  }).populate('user_id', 'name email');

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: 'Subscription not found for this user'
    });
  }

  if (action === 'suspend') {
    subscription.status = 'suspended';
  } else if (action === 'restore') {
    subscription.status = 'active';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "suspend" or "restore"'
    });
  }

  await subscription.save();

  const actionText = action === 'suspend' ? 'suspended' : 'restored';
  
  res.json({
    success: true,
    message: `User subscription ${actionText} successfully`,
    data: subscription
  });
});

// Analytics and Reporting
export const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  const totalSubscriptions = await UserSubscription.countDocuments();
  const activeSubscriptions = await UserSubscription.countDocuments({ status: 'active' });
  const expiredSubscriptions = await UserSubscription.countDocuments({ status: 'expired' });
  const cancelledSubscriptions = await UserSubscription.countDocuments({ status: 'cancelled' });

  // Revenue from completed payments
  const revenueData = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total_revenue: { $sum: '$amount' } } }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total_revenue : 0;

  // Monthly revenue
  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
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
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Plan breakdown
  const planBreakdown = await UserSubscription.aggregate([
    { $match: { status: 'active' } },
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
        count: { $sum: 1 },
        revenue: { $sum: '$plan.price' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        total_subscriptions: totalSubscriptions,
        active_subscriptions: activeSubscriptions,
        expired_subscriptions: expiredSubscriptions,
        cancelled_subscriptions: cancelledSubscriptions,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue,
        plan_breakdown: planBreakdown
      }
    }
  });
});

export const getPlanUsageReport = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Subscription plan not found'
    });
  }

  const totalUsers = await UserSubscription.countDocuments({ plan_id: req.params.id });
  const activeUsers = await UserSubscription.countDocuments({ 
    plan_id: req.params.id, 
    status: 'active' 
  });
  const expiredUsers = await UserSubscription.countDocuments({ 
    plan_id: req.params.id, 
    status: 'expired' 
  });

  const monthlyRevenue = activeUsers * plan.price;

  res.json({
    success: true,
    data: {
      plan_id: plan._id,
      name: plan.name,
      total_users: totalUsers,
      active_users: activeUsers,
      expired_users: expiredUsers,
      monthly_revenue: monthlyRevenue
    }
  });
});

export const bulkUpdatePlans = asyncHandler(async (req, res) => {
  const { plans } = req.body;

  if (!plans || !Array.isArray(plans)) {
    return res.status(400).json({
      success: false,
      message: 'Plans array is required'
    });
  }

  const updatePromises = plans.map(planUpdate => {
    const { plan_id, ...updateData } = planUpdate;
    return SubscriptionPlan.findByIdAndUpdate(
      plan_id,
      updateData,
      { new: true, runValidators: true }
    );
  });

  const updatedPlans = await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Subscription plans updated successfully',
    data: updatedPlans.filter(plan => plan !== null)
  });
});