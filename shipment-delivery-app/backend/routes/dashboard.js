const express = require('express');
const {
  getUserDashboard,
  getAdminDashboard,
  getShipmentAnalytics
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// User dashboard
router.get('/user', protect, getUserDashboard);

// Admin dashboard
router.get('/admin', protect, authorize('ADMINISTRATOR'), getAdminDashboard);

// Analytics
router.get('/analytics', protect, authorize('ADMINISTRATOR'), getShipmentAnalytics);

module.exports = router;
