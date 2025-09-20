import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true
  },
  module: {
    type: String,
    required: [true, 'Module is required'],
    enum: ['users', 'properties', 'dashboard', 'staff', 'payments', 'subscriptions', 'settings', 'blog']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'read', 'update', 'delete', 'manage']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model('Permission', permissionSchema);