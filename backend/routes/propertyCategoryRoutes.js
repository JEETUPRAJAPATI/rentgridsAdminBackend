import express from 'express'
import PropertyCategory from '../models/PropertyCategory.js'

const router = express.Router()

// GET /api/property-categories
router.get('/', async (req, res) => {
  try {
    const categories = await PropertyCategory.find({}, 'name _id')
    res.json({ success: true, data: categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router