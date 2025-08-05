const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// @desc    Create new shipment
// @route   POST /shipments
// @access  Private
exports.createShipment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      receiverFirstName,
      receiverLastName,
      receiverEmail,
      receiverContactNumber,
      receiverStreet,
      receiverCity,
      receiverState,
      receiverZipCode,
      receiverCountryId,
      boxId,
      contents,
      weight,
      priority = 'NORMAL',
      isFragile = false
    } = req.body;

    // Calculate shipping cost
    const box = await prisma.box.findUnique({ where: { id: boxId } });
    const country = await prisma.country.findUnique({ where: { id: receiverCountryId } });
    
    if (!box || !country) {
      return res.status(400).json({
        success: false,
        message: 'Invalid box type or destination country'
      });
    }

    const shippingCost = box.basePrice * country.multiplier;
    
    // Generate tracking number
    const trackingNumber = `BOX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Set estimated delivery date (5-10 business days from now)
    const estimatedDays = Math.floor(Math.random() * 6) + 5;
    const estimatedDeliveryDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        senderId: req.user.id,
        receiverFirstName,
        receiverLastName,
        receiverEmail,
        receiverContactNumber,
        receiverStreet,
        receiverCity,
        receiverState,
        receiverZipCode,
        receiverCountryId,
        boxId,
        contents,
        weight,
        shippingCost,
        priority,
        estimatedDeliveryDate,
        status: 'CREATED',
        isFragile
      },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        box: true,
        receiverCountry: true
      }
    });

    // Add initial tracking history
    await prisma.trackingHistory.create({
      data: {
        shipmentId: shipment.id,
        status: 'CREATED',
        location: 'Origin Facility',
        description: 'Shipment created and awaiting confirmation'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shipments for authenticated user
// @route   GET /shipments
// @access  Private
exports.getShipments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    let where = {};
    
    // For regular users, only show their shipments
    // For admins, show all current (non-cancelled/non-completed) shipments
    if (req.user.role === 'ADMINISTRATOR') {
      where = {
        status: {
          notIn: ['CANCELLED', 'COMPLETED']
        }
      };
    } else {
      where.senderId = req.user.id;
    }
    
    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.priority) {
      where.priority = req.query.priority;
    }

    // Search by tracking number or receiver email
    if (req.query.search) {
      where.OR = [
        { trackingNumber: { contains: req.query.search, mode: 'insensitive' } },
        { receiverEmail: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    const total = await prisma.shipment.count({ where });
    
    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        box: { select: { name: true, basePrice: true, color: true } },
        receiverCountry: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    // Pagination result
    const pagination = {};
    if (skip + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (skip > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      pagination,
      data: shipments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get completed shipments
// @route   GET /shipments/complete
// @access  Private
exports.getCompleteShipments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let where = { status: 'COMPLETED' };
    
    if (req.user.role !== 'ADMINISTRATOR') {
      where.senderId = req.user.id;
    }

    const total = await prisma.shipment.count({ where });
    
    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        box: { select: { name: true, color: true } },
        receiverCountry: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      data: shipments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cancelled shipments
// @route   GET /shipments/cancelled
// @access  Private
exports.getCancelledShipments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let where = { status: 'CANCELLED' };
    
    if (req.user.role !== 'ADMINISTRATOR') {
      where.senderId = req.user.id;
    }

    const total = await prisma.shipment.count({ where });
    
    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        box: { select: { name: true, color: true } },
        receiverCountry: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      data: shipments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shipment details
// @route   GET /shipments/:shipment_id
// @access  Private
exports.getShipmentById = async (req, res, next) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.shipment_id },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true, contactNumber: true } },
        box: true,
        receiverCountry: true,
        trackingHistory: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check if user owns this shipment or is admin
    if (shipment.senderId !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this shipment'
      });
    }

    res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shipments for a specific customer
// @route   GET /shipments/customer/:customer_id
// @access  Private/Admin
exports.getShipmentsByCustomer = async (req, res, next) => {
  try {
    const { customer_id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = { senderId: customer_id };

    const total = await prisma.shipment.count({ where });
    
    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        box: { select: { name: true, color: true } },
        receiverCountry: { select: { name: true, code: true } },
        trackingHistory: { orderBy: { timestamp: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      data: shipments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shipment
// @route   PUT /shipments/:shipment_id
// @access  Private
exports.updateShipment = async (req, res, next) => {
  try {
    const { shipment_id } = req.params;
    const { status, location, description } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipment_id }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Non-admin users can only cancel their own shipments
    if (req.user.role !== 'ADMINISTRATOR') {
      if (shipment.senderId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this shipment'
        });
      }
      
      // Regular users can only cancel
      if (status && status !== 'CANCELLED') {
        return res.status(403).json({
          success: false,
          message: 'Users can only cancel shipments'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (status) {
      updateData.status = status;
      
      // If delivered, set actual delivery date
      if (status === 'COMPLETED') {
        updateData.actualDeliveryDate = new Date();
      }
    }

    // Update the shipment
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment_id },
      data: updateData,
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        box: true,
        receiverCountry: true
      }
    });

    // Add tracking history if status is being updated
    if (status) {
      await prisma.trackingHistory.create({
        data: {
          shipmentId: shipment_id,
          status,
          location: location || 'System Update',
          description: description || `Status updated to ${status}`
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipment (Admin only, extreme situations)
// @route   DELETE /shipments/:shipment_id
// @access  Private/Admin
exports.deleteShipment = async (req, res, next) => {
  try {
    const { shipment_id } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipment_id }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Delete tracking history first (due to foreign key constraints)
    await prisma.trackingHistory.deleteMany({
      where: { shipmentId: shipment_id }
    });

    // Delete the shipment
    await prisma.shipment.delete({
      where: { id: shipment_id }
    });

    res.status(200).json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
