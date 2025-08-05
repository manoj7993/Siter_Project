const express = require('express');
const { body, param } = require('express-validator');
const {
  getAccount,
  updateAccount,
  createAccount,
  deleteAccount
} = require('../controllers/accountController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const accountValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('contactNumber').optional().trim().isLength({ min: 10 }).withMessage('Contact number must be at least 10 characters'),
  body('zipCode').optional().trim().isLength({ min: 3 }).withMessage('Zip code must be at least 3 characters'),
  body('countryId').optional().isString().withMessage('Please provide a valid country ID')
];

const createAccountValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('contactNumber').trim().isLength({ min: 10 }).withMessage('Contact number must be at least 10 characters'),
  body('zipCode').trim().isLength({ min: 3 }).withMessage('Zip code must be at least 3 characters'),
  body('countryId').isString().withMessage('Please provide a valid country ID')
];

const accountIdValidation = [
  param('account_id').isString().withMessage('Invalid account ID')
];

// API-04: Account endpoints

// GET /account/:account_id - Retrieve account information
router.get('/:account_id', protect, accountIdValidation, getAccount);

// PUT /account/:account_id - Update account information
router.put('/:account_id', protect, accountIdValidation, accountValidation, updateAccount);

// POST /account - Create new account
router.post('/', createAccountValidation, createAccount);

// DELETE /account - Delete account (Admin only, extreme situations)
router.delete('/:account_id', protect, authorize('ADMINISTRATOR'), accountIdValidation, deleteAccount);

module.exports = router;
