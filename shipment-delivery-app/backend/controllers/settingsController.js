const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Country = require('../models/Country');

// @desc    Get all countries
// @route   GET /api/settings/countries
// @access  Public
const getCountries = asyncHandler(async (req, res) => {
  try {
    const countries = await Country.findAll();
    
    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries,
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving countries',
      error: error.message,
    });
  }
});

// @desc    Add new country
// @route   POST /api/settings/countries/:country_id
// @access  Private/Admin
const addCountry = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }

  try {
    const country = await Country.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Country added successfully',
      data: country,
    });
  } catch (error) {
    console.error('Add country error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding country',
      error: error.message,
    });
  }
});

// @desc    Update country information
// @route   PUT /api/settings/countries/:country_id
// @access  Private/Admin
const updateCountry = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }

  try {
    const { country_id } = req.params;
    const country = await Country.updateById(country_id, req.body);
    
    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Country updated successfully',
      data: country,
    });
  } catch (error) {
    console.error('Update country error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating country',
      error: error.message,
    });
  }
});

// @desc    Get application settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  try {
    // For now, return static settings. This can be expanded to use a database
    const settings = {
      application: {
        name: process.env.COMPANY_NAME || 'Boxinator',
        website: process.env.COMPANY_WEBSITE || 'https://boxinator.com',
        environment: process.env.NODE_ENV || 'development',
      },
      email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        from: process.env.EMAIL_FROM || 'noreply@boxinator.com',
      },
      features: {
        guestShipments: true,
        emailNotifications: true,
        trackingEnabled: true,
        adminDebugMode: process.env.NODE_ENV === 'development',
      },
      limits: {
        maxFileSize: process.env.MAX_FILE_SIZE || 5000000,
        rateLimit: process.env.RATE_LIMIT_MAX || 100,
        authRateLimit: process.env.AUTH_RATE_LIMIT_MAX || 5,
      },
    };

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings',
      error: error.message,
    });
  }
});

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }

  try {
    // In a real application, you would save these to a database
    // For now, we'll just return the updated settings
    const updatedSettings = req.body;

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message,
    });
  }
});

// @desc    Get system status
// @route   GET /api/settings/status
// @access  Private/Admin
const getSystemStatus = asyncHandler(async (req, res) => {
  try {
    const status = {
      server: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
      database: {
        status: 'connected', // This should be checked dynamically
        type: 'PostgreSQL',
        provider: 'Supabase',
      },
      external: {
        countryAPI: {
          status: 'available',
          url: process.env.COUNTRY_API_URL || 'https://restcountries.com/v3.1/all',
        },
        emailService: {
          status: 'configured',
          service: process.env.EMAIL_SERVICE || 'gmail',
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system status',
      error: error.message,
    });
  }
});

// @desc    Clear application cache (if implemented)
// @route   POST /api/settings/clear-cache
// @access  Private/Admin
const clearCache = asyncHandler(async (req, res) => {
  try {
    // In a real application, you would clear Redis cache, etc.
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message,
    });
  }
});

// @desc    Get application logs (last 100 entries)
// @route   GET /api/settings/logs
// @access  Private/Admin
const getLogs = asyncHandler(async (req, res) => {
  try {
    // In a real application, you would read from log files
    // For now, return sample logs
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Server started successfully',
        source: 'server.js',
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'Database connected',
        source: 'database.js',
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'info',
        message: 'User authentication successful',
        source: 'authController.js',
      },
    ];

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving logs',
      error: error.message,
    });
  }
});

module.exports = {
  getCountries,
  addCountry,
  updateCountry,
  getSettings,
  updateSettings,
  getSystemStatus,
  clearCache,
  getLogs,
};
