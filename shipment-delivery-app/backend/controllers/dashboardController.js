const Shipment = require('../models/Shipment');
const User = require('../models/User');
const Country = require('../models/Country');
const Box = require('../models/Box');

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get shipment counts by status
    const statusCounts = await Shipment.aggregate([
      { $match: { sender: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent shipments
    const recentShipments = await Shipment.find({ sender: userId })
      .populate([
        { path: 'boxType', select: 'name color' },
        { path: 'receiver.address.country', select: 'name' }
      ])
      .sort({ createdAt: -1 })
      .limit(5);

    // Get total spent
    const totalSpent = await Shipment.aggregate([
      { $match: { sender: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$shippingCost' } } }
    ]);

    // Get monthly shipment trend
    const monthlyTrend = await Shipment.aggregate([
      { 
        $match: { 
          sender: userId,
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$shippingCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format status counts
    const formattedStatusCounts = {
      pending: 0,
      confirmed: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };

    statusCounts.forEach(item => {
      formattedStatusCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        statusCounts: formattedStatusCounts,
        totalShipments: Object.values(formattedStatusCounts).reduce((a, b) => a + b, 0),
        totalSpent: totalSpent[0]?.total || 0,
        recentShipments,
        monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Get overall statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalShipments = await Shipment.countDocuments();
    const totalCountries = await Country.countDocuments({ isActive: true });
    const totalBoxTypes = await Box.countDocuments({ isActive: true });

    // Get shipment counts by status
    const statusCounts = await Shipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get revenue statistics
    const revenueStats = await Shipment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$shippingCost' },
          avgShippingCost: { $avg: '$shippingCost' }
        }
      }
    ]);

    // Get popular destinations
    const popularDestinations = await Shipment.aggregate([
      {
        $lookup: {
          from: 'countries',
          localField: 'receiver.address.country',
          foreignField: '_id',
          as: 'country'
        }
      },
      { $unwind: '$country' },
      {
        $group: {
          _id: '$country._id',
          countryName: { $first: '$country.name' },
          shipmentCount: { $sum: 1 }
        }
      },
      { $sort: { shipmentCount: -1 } },
      { $limit: 10 }
    ]);

    // Get popular box types
    const popularBoxTypes = await Shipment.aggregate([
      {
        $lookup: {
          from: 'boxes',
          localField: 'boxType',
          foreignField: '_id',
          as: 'box'
        }
      },
      { $unwind: '$box' },
      {
        $group: {
          _id: '$box._id',
          boxName: { $first: '$box.name' },
          shipmentCount: { $sum: 1 }
        }
      },
      { $sort: { shipmentCount: -1 } },
      { $limit: 5 }
    ]);

    // Get daily shipment trend for last 30 days
    const dailyTrend = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$shippingCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get recent users
    const recentUsers = await User.find({ isActive: true })
      .populate('country', 'name')
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format status counts
    const formattedStatusCounts = {
      pending: 0,
      confirmed: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };

    statusCounts.forEach(item => {
      formattedStatusCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalShipments,
          totalCountries,
          totalBoxTypes,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          avgShippingCost: revenueStats[0]?.avgShippingCost || 0
        },
        statusCounts: formattedStatusCounts,
        popularDestinations,
        popularBoxTypes,
        dailyTrend,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shipment analytics
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
exports.getShipmentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Shipments by priority
    const priorityStats = await Shipment.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Shipments by country
    const countryStats = await Shipment.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'countries',
          localField: 'receiver.address.country',
          foreignField: '_id',
          as: 'country'
        }
      },
      { $unwind: '$country' },
      {
        $group: {
          _id: '$country._id',
          countryName: { $first: '$country.name' },
          shipmentCount: { $sum: 1 },
          totalRevenue: { $sum: '$shippingCost' }
        }
      },
      { $sort: { shipmentCount: -1 } }
    ]);

    // Average delivery time
    const deliveryTimeStats = await Shipment.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'delivered',
          actualDeliveryDate: { $exists: true }
        }
      },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ['$actualDeliveryDate', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDeliveryTime: { $avg: '$deliveryTime' },
          minDeliveryTime: { $min: '$deliveryTime' },
          maxDeliveryTime: { $max: '$deliveryTime' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        priorityStats,
        countryStats,
        deliveryTimeStats: deliveryTimeStats[0] || {
          avgDeliveryTime: 0,
          minDeliveryTime: 0,
          maxDeliveryTime: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
