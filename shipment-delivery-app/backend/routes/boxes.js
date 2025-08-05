const express = require('express');
const { body } = require('express-validator');
const {
  getBoxes,
  getBox,
  createBox,
  updateBox,
  deleteBox,
  calculateShippingCost
} = require('../controllers/boxController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const boxValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Box name must be between 2 and 100 characters'),
  body('dimensions.length').isFloat({ min: 0.1 }).withMessage('Length must be greater than 0'),
  body('dimensions.width').isFloat({ min: 0.1 }).withMessage('Width must be greater than 0'),
  body('dimensions.height').isFloat({ min: 0.1 }).withMessage('Height must be greater than 0'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
  body('basePrice').isFloat({ min: 0.01 }).withMessage('Base price must be greater than 0'),
  body('color').trim().isLength({ min: 2, max: 50 }).withMessage('Color must be between 2 and 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

const calculateCostValidation = [
  body('boxId').isMongoId().withMessage('Please provide a valid box ID'),
  body('countryId').isMongoId().withMessage('Please provide a valid country ID')
];

// Public routes
router.get('/', getBoxes);
router.get('/:id', getBox);
router.post('/calculate-cost', calculateCostValidation, calculateShippingCost);

// Admin routes
router.post('/', protect, authorize('ADMINISTRATOR'), boxValidation, createBox);
router.put('/:id', protect, authorize('ADMINISTRATOR'), boxValidation, updateBox);
router.delete('/:id', protect, authorize('ADMINISTRATOR'), deleteBox);

module.exports = router;
