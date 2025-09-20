import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration_days: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  visit_credits: {
    type: Number,
    required: [true, 'Visit credits is required'],
    min: [0, 'Visit credits cannot be negative']
  },
  features: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  is_popular: {
    type: Boolean,
    default: false
  },
  sort_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);