import express from 'express';
import {
  getProperties,
  searchProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
  verifyProperty,
  rejectProperty,
  getPropertyStats,
  getPropertyImages,
  uploadPropertyImages,
  deletePropertyImage,
  getPropertyDocuments,
  uploadPropertyDocument,
  deletePropertyDocument,
  getOwnerProperties
} from '../controllers/propertyController.js';
import { protect, adminOnly, hasPermission, optionalAuth } from '../middleware/auth.js';
import {
  validateCreateProperty,
  validatePagination,
  validateId
} from '../middleware/validation.js';
import {
  uploadProperty,
  uploadMultiple,
  uploadSingle,
  handleUploadError
} from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validatePagination, getProperties);
router.get('/search', optionalAuth, validatePagination, searchProperties);
router.get('/featured', optionalAuth, getFeaturedProperties);
router.get('/stats', protect, adminOnly, getPropertyStats);
router.get('/:id', optionalAuth, validateId, getPropertyById);

// Protected routes
router.post('/', uploadProperty, handleUploadError, validateCreateProperty, createProperty);  // removed 'protect' to allow property creation without authentication for temp purpose
router.put('/:id', protect, uploadProperty, handleUploadError, validateId, updateProperty);
router.patch('/:id/status', protect, hasPermission('properties', 'update'), validateId, updatePropertyStatus);
router.delete('/:id', protect, hasPermission('properties', 'delete'), validateId, deleteProperty);

// Admin only routes
router.post('/:id/verify', protect, adminOnly, validateId, verifyProperty);
router.post('/:id/reject', protect, adminOnly, validateId, rejectProperty);

// Property images
router.get('/:id/images', validateId, getPropertyImages);
router.post('/:id/images', protect, uploadMultiple('images', 15), handleUploadError, validateId, uploadPropertyImages);
router.delete('/images/:imageId', protect, deletePropertyImage);

// Property documents
router.get('/:id/documents', protect, validateId, getPropertyDocuments);
router.post('/:id/documents', protect, uploadSingle('document'), handleUploadError, validateId, uploadPropertyDocument);
router.delete('/documents/:docId', protect, deletePropertyDocument);

// Owner properties
router.get('/owners/:ownerId/properties', protect, validateId, getOwnerProperties);

export default router;