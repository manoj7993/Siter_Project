const Country = require('../models/Country');

// @desc    Get all countries
// @route   GET /api/countries
// @access  Public
exports.getCountries = async (req, res, next) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    
    const countries = await Country.find(filter)
      .select('name code currency multiplier continent shippingZone isActive')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single country
// @route   GET /api/countries/:id
// @access  Public
exports.getCountry = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    res.status(200).json({
      success: true,
      data: country
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create country
// @route   POST /api/countries
// @access  Private/Admin
exports.createCountry = async (req, res, next) => {
  try {
    const country = await Country.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Country created successfully',
      data: country
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update country
// @route   PUT /api/countries/:id
// @access  Private/Admin
exports.updateCountry = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Country updated successfully',
      data: country
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete country
// @route   DELETE /api/countries/:id
// @access  Private/Admin
exports.deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    await country.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Country deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get countries by continent
// @route   GET /api/countries/continent/:continent
// @access  Public
exports.getCountriesByContinent = async (req, res, next) => {
  try {
    const countries = await Country.find({
      continent: req.params.continent,
      isActive: true
    })
    .select('name code currency multiplier shippingZone')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shipping cost multiplier for country
// @route   GET /api/countries/:id/multiplier
// @access  Public
exports.getShippingMultiplier = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id).select('name multiplier currency');

    if (!country) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        countryName: country.name,
        multiplier: country.multiplier,
        currency: country.currency
      }
    });
  } catch (error) {
    next(error);
  }
};
