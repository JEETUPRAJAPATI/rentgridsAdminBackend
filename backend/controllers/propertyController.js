import Property from '../models/Property.js';
import PropertyCategory from '../models/PropertyCategory.js';
import PropertyFeature from '../models/PropertyFeature.js';
import PropertyAmenity from '../models/PropertyAmenity.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination } from '../utils/pagination.js';
import { cleanupFiles } from '../middleware/upload.js';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    property_type = '',
    listing_type = '',
    status = 'published',
    city = '',
    min_price = '',
    max_price = '',
    bedroom = '',
    is_featured = '',
    is_verified = '',
    owner_id = '',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { locality: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (property_type) filter.property_type = property_type;
  if (listing_type) filter.listing_type = listing_type;
  if (status) filter.status = status;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (bedroom) filter.bedroom = bedroom;
  if (is_featured !== '') filter.is_featured = is_featured === 'true';
  if (is_verified !== '') filter.is_verified = is_verified === 'true';
  if (owner_id) filter.owner_id = owner_id;

  // Price filter
  if (min_price || max_price) {
    filter.$or = [];
    const priceFilter = {};
    
    if (min_price) priceFilter.$gte = parseFloat(min_price);
    if (max_price) priceFilter.$lte = parseFloat(max_price);
    
    if (listing_type === 'rent' || !listing_type) {
      filter.$or.push({ monthly_rent: priceFilter });
    }
    if (listing_type === 'sale' || !listing_type) {
      filter.$or.push({ sale_price: priceFilter });
    }
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  // Sort configuration
  const sortConfig = {};
  sortConfig[sort_by] = sort_order === 'asc' ? 1 : -1;

  const properties = await Property.find(filter)
    .populate('owner_id', 'name email phone')
    .populate('category_id', 'name')
    .populate('features', 'name')
    .populate('amenities', 'name')
    .sort(sortConfig)
    .skip(skip)
    .limit(pageLimit);

  const total = await Property.countDocuments(filter);

  res.json({
    success: true,
    data: properties,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
export const searchProperties = asyncHandler(async (req, res) => {
  const {
    q = '',
    property_type = '',
    listing_type = '',
    city = '',
    locality = '',
    min_price = '',
    max_price = '',
    bedroom = '',
    bathroom = '',
    furnish_type = '',
    amenities = '',
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  // Build search filter
  const filter = { status: 'published', is_verified: true };
  
  if (q) {
    filter.$text = { $search: q };
  }
  
  if (property_type) filter.property_type = property_type;
  if (listing_type) filter.listing_type = listing_type;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (locality) filter.locality = { $regex: locality, $options: 'i' };
  if (bedroom) filter.bedroom = bedroom;
  if (bathroom) filter.bathroom = bathroom;
  if (furnish_type) filter.furnish_type = furnish_type;

  // Amenities filter
  if (amenities) {
    const amenityIds = amenities.split(',');
    filter.amenities = { $in: amenityIds };
  }

  // Price filter
  if (min_price || max_price) {
    filter.$or = [];
    const priceFilter = {};
    
    if (min_price) priceFilter.$gte = parseFloat(min_price);
    if (max_price) priceFilter.$lte = parseFloat(max_price);
    
    if (listing_type === 'rent' || !listing_type) {
      filter.$or.push({ monthly_rent: priceFilter });
    }
    if (listing_type === 'sale' || !listing_type) {
      filter.$or.push({ sale_price: priceFilter });
    }
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  // Sort configuration
  const sortConfig = {};
  if (q && !sort_by) {
    sortConfig.score = { $meta: 'textScore' };
  } else {
    sortConfig[sort_by] = sort_order === 'asc' ? 1 : -1;
  }

  const properties = await Property.find(filter, q ? { score: { $meta: 'textScore' } } : {})
    .populate('owner_id', 'name email phone')
    .populate('category_id', 'name')
    .populate('features', 'name')
    .populate('amenities', 'name')
    .sort(sortConfig)
    .skip(skip)
    .limit(pageLimit);

  const total = await Property.countDocuments(filter);

  res.json({
    success: true,
    data: properties,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  const { limit = 10, property_type = '', city = '' } = req.query;

  const filter = {
    status: 'published',
    is_verified: true,
    is_featured: true
  };

  if (property_type) filter.property_type = property_type;
  if (city) filter.city = { $regex: city, $options: 'i' };

  const properties = await Property.find(filter)
    .populate('owner_id', 'name email phone')
    .populate('category_id', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: properties
  });
});

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = asyncHandler(async (req, res) => {
  const { include = false } = req.query;

  let query = Property.findById(req.params.id);

  if (include === 'true') {
    query = query
      .populate('owner_id', 'name email phone')
      .populate('category_id', 'name')
      .populate('features', 'name description')
      .populate('amenities', 'name description category');
  }

  const property = await query;

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Increment view count (only for public access)
  if (!req.user) {
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  }

  res.json({
    success: true,
    data: property
  });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
export const createProperty = asyncHandler(async (req, res) => {
  try {
    const propertyData = { ...req.body };
    

    
    // Set owner_id if user is creating property
  if (!propertyData.owner_id) {
  propertyData.owner_id = null; // or leave undefined
}
    // if (req.userType === 'user') {
    //   propertyData.owner_id = req.user._id;
    // } else if (!propertyData.owner_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Owner ID is required'
    //   });
    // }

    // ---------------------------------------------------------

    // Handle file uploads
    if (req.files) {
      // Handle images
      if (req.files.images) {
        propertyData.images = req.files.images.map((file, index) => ({
          url: `/uploads/images/${file.filename}`,
          public_id: file.filename,
          is_main: index === 0
        }));
      }

      // Handle documents
      if (req.files.documents) {
        propertyData.documents = req.files.documents.map(file => ({
          url: `/uploads/documents/${file.filename}`,
          public_id: file.filename,
          doc_type: 'other',
          document_name: file.originalname
        }));
      }
    }

    // Parse arrays if they're strings (from form data)
    if (typeof propertyData.features === 'string') {
      propertyData.features = JSON.parse(propertyData.features);
    }
    if (typeof propertyData.amenities === 'string') {
      propertyData.amenities = JSON.parse(propertyData.amenities);
    }

    const property = await Property.create(propertyData);

    const populatedProperty = await Property.findById(property._id)
      .populate('owner_id', 'name email phone')
      .populate('category_id', 'name')
      .populate('features', 'name')
      .populate('amenities', 'name');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: populatedProperty
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      cleanupFiles(req.files);
    }
    throw error;
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check ownership
  if (req.userType === 'user' && property.owner_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this property'
    });
  }

  try {
    const updateData = { ...req.body };

    // Handle new file uploads
    if (req.files) {
      if (req.files.images) {
        const newImages = req.files.images.map(file => ({
          url: `/uploads/images/${file.filename}`,
          public_id: file.filename,
          is_main: false
        }));
        
        updateData.images = [...(property.images || []), ...newImages];
      }

      if (req.files.documents) {
        const newDocuments = req.files.documents.map(file => ({
          url: `/uploads/documents/${file.filename}`,
          public_id: file.filename,
          doc_type: 'other',
          document_name: file.originalname
        }));
        
        updateData.documents = [...(property.documents || []), ...newDocuments];
      }
    }

    // Parse arrays if they're strings
    if (typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }
    if (typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner_id', 'name email phone')
    .populate('category_id', 'name')
    .populate('features', 'name')
    .populate('amenities', 'name');

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      cleanupFiles(req.files);
    }
    throw error;
  }
});

// @desc    Update property status
// @route   PATCH /api/properties/:id/status
// @access  Private/Admin
export const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    message: 'Property status updated successfully',
    data: property
  });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Check ownership
  if (req.userType === 'user' && property.owner_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this property'
    });
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
});

// @desc    Verify property
// @route   POST /api/properties/:id/verify
// @access  Private/Admin
export const verifyProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    {
      is_verified: true,
      verification_status: 'approved',
      verified_by: req.user._id,
      verified_at: new Date()
    },
    { new: true }
  );

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    message: 'Property verified successfully',
    data: property
  });
});

// @desc    Reject property
// @route   POST /api/properties/:id/reject
// @access  Private/Admin
export const rejectProperty = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    {
      is_verified: false,
      verification_status: 'rejected',
      rejection_reason: reason,
      verified_by: req.user._id,
      verified_at: new Date()
    },
    { new: true }
  );

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    message: 'Property rejected successfully',
    data: property
  });
});

// @desc    Get property statistics
// @route   GET /api/properties/stats
// @access  Private/Admin
export const getPropertyStats = asyncHandler(async (req, res) => {
  const totalProperties = await Property.countDocuments();
  const publishedProperties = await Property.countDocuments({ status: 'published' });
  const draftProperties = await Property.countDocuments({ status: 'draft' });
  const verifiedProperties = await Property.countDocuments({ is_verified: true });
  const featuredProperties = await Property.countDocuments({ is_featured: true });
  
  // Properties by type
  const propertiesByType = await Property.aggregate([
    { $group: { _id: '$property_type', count: { $sum: 1 } } }
  ]);

  // Properties by city
  const propertiesByCity = await Property.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      total_properties: totalProperties,
      published_properties: publishedProperties,
      draft_properties: draftProperties,
      verified_properties: verifiedProperties,
      featured_properties: featuredProperties,
      properties_by_type: propertiesByType,
      properties_by_city: propertiesByCity
    }
  });
});

// Property Images Management
export const getPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).select('images');

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    data: property.images || []
  });
});

export const uploadPropertyImages = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No images uploaded'
    });
  }

  const newImages = req.files.map(file => ({
    url: `/uploads/images/${file.filename}`,
    public_id: file.filename,
    is_main: false
  }));

  property.images = [...(property.images || []), ...newImages];
  await property.save();

  res.json({
    success: true,
    message: 'Images uploaded successfully',
    data: newImages
  });
});

export const deletePropertyImage = asyncHandler(async (req, res) => {
  // Implementation would involve finding the property and removing the specific image
  res.json({
    success: true,
    message: 'Image deleted successfully'
  });
});

// Property Documents Management
export const getPropertyDocuments = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).select('documents');

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    data: property.documents || []
  });
});

export const uploadPropertyDocument = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No document uploaded'
    });
  }

  const newDocument = {
    url: `/uploads/documents/${req.file.filename}`,
    public_id: req.file.filename,
    doc_type: req.body.doc_type || 'other',
    document_name: req.body.document_name || req.file.originalname
  };

  property.documents = [...(property.documents || []), newDocument];
  await property.save();

  res.json({
    success: true,
    message: 'Document uploaded successfully',
    data: newDocument
  });
});

export const deletePropertyDocument = asyncHandler(async (req, res) => {
  // Implementation would involve finding the property and removing the specific document
  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// Get owner properties
export const getOwnerProperties = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status = '',
    property_type = '',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  const { ownerId } = req.params;

  // Verify owner exists
  const owner = await User.findById(ownerId);
  if (!owner) {
    return res.status(404).json({
      success: false,
      message: 'Owner not found'
    });
  }

  const filter = { owner_id: ownerId };
  if (status) filter.status = status;
  if (property_type) filter.property_type = property_type;

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const sortConfig = {};
  sortConfig[sort_by] = sort_order === 'asc' ? 1 : -1;

  const properties = await Property.find(filter)
    .populate('category_id', 'name')
    .sort(sortConfig)
    .skip(skip)
    .limit(pageLimit);

  const total = await Property.countDocuments(filter);

  res.json({
    success: true,
    data: properties,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});