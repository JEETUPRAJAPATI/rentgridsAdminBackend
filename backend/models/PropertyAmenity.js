import mongoose from 'mongoose';

const propertyAmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Amenity name is required'],
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
  category: {
    type: String,
    enum: ['safety', 'lifestyle', 'connectivity', 'other'],
    default: 'other'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('PropertyAmenity', propertyAmenitySchema);