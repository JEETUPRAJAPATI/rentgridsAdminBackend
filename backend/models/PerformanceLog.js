import mongoose from 'mongoose';

const performanceLogSchema = new mongoose.Schema({
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: [true, 'Staff member is required']
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  score: {
    type: Number,
    required: [true, 'Performance score is required'],
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot be more than 100']
  },
  performance_date: {
    type: Date,
    required: [true, 'Performance date is required']
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot be more than 500 characters']
  },
  logged_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
performanceLogSchema.index({ staff_id: 1, performance_date: -1 });

export default mongoose.model('PerformanceLog', performanceLogSchema);