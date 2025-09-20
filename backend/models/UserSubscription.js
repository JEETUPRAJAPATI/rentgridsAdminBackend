import mongoose from 'mongoose';

const userSubscriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: [true, 'Subscription plan is required']
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active'
  },
  remaining_credits: {
    type: Number,
    min: [0, 'Remaining credits cannot be negative'],
    default: 0
  },
  total_credits: {
    type: Number,
    min: [0, 'Total credits cannot be negative'],
    default: 0
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  auto_renewal: {
    type: Boolean,
    default: false
  },
  cancelled_at: Date,
  cancelled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  cancellation_reason: String
}, {
  timestamps: true
});

// Indexes
userSubscriptionSchema.index({ user_id: 1, status: 1 });
userSubscriptionSchema.index({ end_date: 1 });

export default mongoose.model('UserSubscription', userSubscriptionSchema);