const express = require('express');
const { body } = require('express-validator');
const {
  getCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
  getCountriesByContinent,
  getShippingMultiplier
} = require('../controllers/countryController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const countryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Country name must be between 2 and 100 characters'),
  body('code').trim().isLength({ min: 2, max: 2 }).withMessage('Country code must be exactly 2 characters'),
  body('currency').trim().isLength({ min: 3, max: 3 }).withMessage('Currency code must be exactly 3 characters'),
  body('multiplier').isFloat({ min: 0 }).withMessage('Multiplier must be a positive number'),
  body('continent').isIn(['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']).withMessage('Invalid continent'),
  body('shippingZone').optional().isIn(['domestic', 'zone1', 'zone2', 'zone3']).withMessage('Invalid shipping zone')
];

// Public routes
router.get('/', getCountries);
router.get('/continent/:continent', getCountriesByContinent);
router.get('/:id', getCountry);
router.get('/:id/multiplier', getShippingMultiplier);

// Admin routes
router.post('/', protect, authorize('ADMINISTRATOR'), countryValidation, createCountry);
router.put('/:id', protect, authorize('ADMINISTRATOR'), countryValidation, updateCountry);
router.delete('/:id', protect, authorize('ADMINISTRATOR'), deleteCountry);

module.exports = router;
