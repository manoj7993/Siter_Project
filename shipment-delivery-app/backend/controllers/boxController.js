const Box = require('../models/Box');

// @desc    Get all boxes
// @route   GET /api/boxes
// @access  Public
exports.getBoxes = async (req, res, next) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    
    const boxes = await Box.find(filter).sort({ basePrice: 1 });

    res.status(200).json({
      success: true,
      count: boxes.length,
      data: boxes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single box
// @route   GET /api/boxes/:id
// @access  Public
exports.getBox = async (req, res, next) => {
  try {
    const box = await Box.findById(req.params.id);

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    res.status(200).json({
      success: true,
      data: box
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create box
// @route   POST /api/boxes
// @access  Private/Admin
exports.createBox = async (req, res, next) => {
  try {
    const box = await Box.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Box created successfully',
      data: box
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update box
// @route   PUT /api/boxes/:id
// @access  Private/Admin
exports.updateBox = async (req, res, next) => {
  try {
    const box = await Box.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Box updated successfully',
      data: box
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete box
// @route   DELETE /api/boxes/:id
// @access  Private/Admin
exports.deleteBox = async (req, res, next) => {
  try {
    const box = await Box.findById(req.params.id);

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    await box.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Box deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate shipping cost
// @route   POST /api/boxes/calculate-cost
// @access  Public
exports.calculateShippingCost = async (req, res, next) => {
  try {
    const { boxId, countryId } = req.body;

    const box = await Box.findById(boxId);
    const Country = require('../models/Country');
    const country = await Country.findById(countryId);

    if (!box || !country) {
      return res.status(400).json({
        success: false,
        message: 'Invalid box or country ID'
      });
    }

    const totalCost = box.basePrice * country.multiplier;

    res.status(200).json({
      success: true,
      data: {
        boxName: box.name,
        basePrice: box.basePrice,
        countryName: country.name,
        multiplier: country.multiplier,
        totalCost: totalCost,
        currency: country.currency
      }
    });
  } catch (error) {
    next(error);
  }
};
