import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Staff member is required']
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  task_type: {
    type: String,
    enum: ['visit', 'maintenance', 'onboarding', 'verification'],
    required: [true, 'Task type is required']
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completed_at: Date,
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ staff_id: 1, status: 1 });
taskSchema.index({ due_date: 1, priority: 1 });

export default mongoose.model('Task', taskSchema);