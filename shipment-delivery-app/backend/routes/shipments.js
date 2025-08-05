const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getShipments,
  getCompleteShipments,
  getCancelledShipments,
  createShipment,
  getShipmentById,
  getShipmentsByCustomer,
  updateShipment,
  deleteShipment
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules
const createShipmentValidation = [
  body('receiverFirstName').trim().isLength({ min: 2, max: 50 }).withMessage('Receiver first name must be between 2 and 50 characters'),
  body('receiverLastName').trim().isLength({ min: 2, max: 50 }).withMessage('Receiver last name must be between 2 and 50 characters'),
  body('receiverEmail').isEmail().normalizeEmail().withMessage('Please provide a valid receiver email'),
  body('receiverContactNumber').trim().isLength({ min: 10 }).withMessage('Receiver contact number must be at least 10 characters'),
  body('receiverStreet').trim().isLength({ min: 5 }).withMessage('Street address must be at least 5 characters'),
  body('receiverCity').trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('receiverZipCode').trim().isLength({ min: 3 }).withMessage('Zip code must be at least 3 characters'),
  body('receiverCountryId').isString().withMessage('Please provide a valid country ID'),
  body('boxId').isString().withMessage('Please provide a valid box type ID'),
  body('contents').trim().isLength({ min: 5, max: 1000 }).withMessage('Contents description must be between 5 and 1000 characters'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0'),
  body('priority').optional().isIn(['NORMAL', 'EXPRESS', 'URGENT']).withMessage('Priority must be NORMAL, EXPRESS, or URGENT'),
  body('isFragile').optional().isBoolean().withMessage('Fragile flag must be a boolean')
];

const updateShipmentValidation = [
  body('status').optional().isIn(['CREATED', 'RECIEVED', 'INTRANSIT', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

const shipmentIdValidation = [
  param('shipment_id').isString().withMessage('Invalid shipment ID')
];

const customerIdValidation = [
  param('customer_id').isString().withMessage('Invalid customer ID')
];

// API-03: Shipments endpoints

// GET /shipments - Retrieve shipments relevant to authenticated user
router.get('/', protect, getShipments);

// GET /shipments/complete - Retrieve completed shipments
router.get('/complete', protect, getCompleteShipments);

// GET /shipments/cancelled - Retrieve cancelled shipments
router.get('/cancelled', protect, getCancelledShipments);

// POST /shipments - Create new shipment
router.post('/', protect, createShipmentValidation, createShipment);

// GET /shipments/:shipment_id - Retrieve single shipment details
router.get('/:shipment_id', protect, shipmentIdValidation, getShipmentById);

// GET /shipments/customer/:customer_id - Retrieve all shipments for a customer
router.get('/customer/:customer_id', protect, authorize('ADMINISTRATOR'), customerIdValidation, getShipmentsByCustomer);

// PUT /shipments/:shipment_id - Update shipment (users can only cancel, admins can do anything)
router.put('/:shipment_id', protect, shipmentIdValidation, updateShipmentValidation, updateShipment);

// DELETE /shipments/:shipment_id - Delete shipment (Admin only, extreme situations)
router.delete('/:shipment_id', protect, authorize('ADMINISTRATOR'), shipmentIdValidation, deleteShipment);

module.exports = router;
