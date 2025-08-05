const express = require('express');
const { body, param } = require('express-validator');
const {
  getCountries,
  addCountry,
  updateCountry
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const countryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Country name must be between 2 and 100 characters'),
  body('code').trim().isLength({ min: 2, max: 2 }).withMessage('Country code must be exactly 2 characters'),
  body('currency').trim().isLength({ min: 3, max: 3 }).withMessage('Currency code must be exactly 3 characters'),
  body('multiplier').isFloat({ min: 0 }).withMessage('Multiplier must be a positive number'),
  body('continent').isIn(['AFRICA', 'ANTARCTICA', 'ASIA', 'EUROPE', 'NORTH_AMERICA', 'OCEANIA', 'SOUTH_AMERICA']).withMessage('Invalid continent'),
  body('shippingZone').optional().isIn(['DOMESTIC', 'ZONE1', 'ZONE2', 'ZONE3']).withMessage('Invalid shipping zone')
];

const countryIdValidation = [
  param('country_id').isString().withMessage('Invalid country ID')
];

// API-05: Settings endpoints

// GET /settings/countries - Retrieve country multiplier information
router.get('/countries', getCountries);

// POST /settings/countries/:country_id - Add new country (Admin only)
router.post('/countries/:country_id', protect, authorize('ADMINISTRATOR'), countryIdValidation, countryValidation, addCountry);

// PUT /settings/countries/:country_id - Update country information (Admin only)
router.put('/countries/:country_id', protect, authorize('ADMINISTRATOR'), countryIdValidation, countryValidation, updateCountry);

module.exports = router;
