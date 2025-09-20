import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  user_type: {
    type: String,
    enum: ['tenant', 'landlord'],
    required: [true, 'User type is required']
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: [true, 'Plan is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  payment_method: {
    type: String,
    enum: ['razorpay', 'stripe', 'bank_transfer', 'wallet'],
    required: [true, 'Payment method is required']
  },
  transaction_id: {
    type: String,
    required: [true, 'Transaction ID is required']
  },
  gateway_response: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  invoice_url: String,
  refund_amount: {
    type: Number,
    default: 0
  },
  refund_reason: String,
  refunded_at: Date,
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user_id: 1, status: 1 });
paymentSchema.index({ payment_id: 1 });
paymentSchema.index({ transaction_id: 1 });

// Generate unique payment ID
paymentSchema.pre('save', function(next) {
  if (!this.payment_id) {
    this.payment_id = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Payment', paymentSchema);