import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  property_code: {
    type: String,
    unique: true,
    sparse: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [false],
    // required: [false, 'Owner is required']  // changing required to false for temp purpose later we can change it to true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyCategory',
    required: true
  },
  property_type: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'office'],
    required: [true, 'Property type is required']
  },
  listing_type: {
    type: String,
    enum: ['rent', 'sale', 'both'],
    required: [true, 'Listing type is required']
  },

  // Pricing
  monthly_rent: {
    type: Number,
    min: [0, 'Monthly rent cannot be negative']
  },
  sale_price: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  security_deposit: {
    type: Number,
    min: [0, 'Security deposit cannot be negative']
  },
  maintenance_charge: {
    type: Number,
    min: [0, 'Maintenance charge cannot be negative'],
    default: 0
  },

  // Property Details
  area: {
    type: Number,
    required: [true, 'Property area is required'],
    min: [1, 'Area must be at least 1']
  },
  area_unit: {
    type: String,
    enum: ['sqft', 'sqm', 'acre'],
    default: 'sqft'
  },
  bedroom: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    default: 0
  },
  bathroom: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    default: 0
  },
  balcony: {
    type: Number,
    min: [0, 'Balconies cannot be negative'],
    default: 0
  },
  bhk: {
    type: Number,
    min: [0, 'BHK cannot be negative']
  },
  floor_no: {
    type: Number,
    min: [0, 'Floor number cannot be negative']
  },
  total_floors: {
    type: Number,
    min: [1, 'Total floors must be at least 1']
  },
  furnish_type: {
    type: String,
    enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
    default: 'unfurnished'
  },

  // Availability
  available_from: {
    type: Date,
    default: Date.now
  },
  available_for: {
    type: String,
    enum: ['Family', 'Bachelor', 'Both'],
    default: 'Both'
  },

  // Location
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  locality: {
    type: String,
    required: [true, 'Locality is required'],
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  zipcode: {
    type: String,
    required: [true, 'Zipcode is required'],
    match: [/^\d{6}$/, 'Please enter a valid 6-digit zipcode']
  },
  full_address: {
    type: String,
    required: [true, 'Full address is required'],
    maxlength: [300, 'Address cannot be more than 300 characters']
  },
  latitude: {
    type: Number,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },

  // Features and Amenities
  features: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyFeature'
  }],
  amenities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyAmenity'
  }],

  // Images and Documents
  images: [{
    url: String,
    public_id: String,
    is_main: { type: Boolean, default: false }
  }],
  documents: [{
    url: String,
    public_id: String,
    doc_type: {
      type: String,
      enum: ['ownership_deed', 'tax_receipt', 'noc', 'other']
    },
    document_name: String
  }],

  // Status and Flags
  status: {
    type: String,
    enum: ['draft', 'published', 'inactive', 'sold', 'rented'],
    default: 'draft'
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejection_reason: String,

  // Engagement Metrics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },

  // Admin fields
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verified_at: Date
}, {
  timestamps: true
});

// Indexes for search and filtering
propertySchema.index({ city: 1, locality: 1 });
propertySchema.index({ property_type: 1, listing_type: 1 });
propertySchema.index({ monthly_rent: 1, sale_price: 1 });
propertySchema.index({ status: 1, is_verified: 1 });
propertySchema.index({
  title: 'text',
  description: 'text',
  city: 'text',
  locality: 'text'
});

// Generate property code before saving
propertySchema.pre('save', async function (next) {
  if (!this.property_code) {
    const prefix = 'PROP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.property_code = `${prefix}${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('Property', propertySchema);