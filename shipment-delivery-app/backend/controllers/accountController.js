const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Country = require('../models/Country');

// @desc    Get user account
// @route   GET /api/account
// @access  Private
const getAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user account
// @route   PUT /api/account
// @access  Private
const updateAccount = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  try {
    const user = await User.updateById(req.user.id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating account',
      error: error.message
    });
  }
});

// @desc    Create user account (Admin only)
// @route   POST /api/account
// @access  Private/Admin
const createAccount = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    contactNumber,
    zipCode,
    countryId,
    role
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify country exists
    const country = await Country.findById(countryId);
    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Invalid country ID'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth: new Date(dateOfBirth),
      contactNumber,
      zipCode,
      countryId,
      role: role || 'REGISTERED_USER',
      emailVerified: true // Admin created accounts are pre-verified
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
});

// @desc    Delete user account (Admin only)
// @route   DELETE /api/account/:id
// @access  Private/Admin
const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting their own account
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.deleteById(id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
});

// @desc    Get user profile (alternative to getAccount)
// @route   GET /api/account/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/account/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  try {
    // Remove sensitive fields that shouldn't be updated via profile
    const { password, role, isActive, emailVerified, ...updateData } = req.body;

    const user = await User.updateById(req.user.id, updateData);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = {
  getAccount,
  updateAccount,
  createAccount,
  deleteAccount,
  getProfile,
  updateProfile
};
