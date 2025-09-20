import mongoose from 'mongoose';

const propertyFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Feature name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  icon: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('PropertyFeature', propertyFeatureSchema);