import { Router } from 'express';
import locationController from '../controllers/locationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body, query, param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/location/update
 * Update user's current location
 */
router.post(
  '/update',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('accuracy').optional().isFloat({ min: 0 }),
    body('altitude').optional().isFloat(),
    body('altitudeAccuracy').optional().isFloat({ min: 0 }),
    body('heading').optional().isFloat({ min: 0, max: 360 }),
    body('speed').optional().isFloat({ min: 0 }),
  ],
  validate,
  locationController.updateLocation
);

/**
 * GET /api/location/history
 * Get user's location history
 */
router.get(
  '/history',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  validate,
  locationController.getLocationHistory
);

/**
 * GET /api/location/nearby
 * Find nearby users
 */
router.get(
  '/nearby',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('radius').optional().isInt({ min: 100, max: 50000 }), // 100m to 50km
  ],
  validate,
  locationController.findNearbyUsers
);

/**
 * POST /api/location/tracking/start
 * Start location tracking
 */
router.post('/tracking/start', locationController.startTracking);

/**
 * POST /api/location/tracking/stop
 * Stop location tracking
 */
router.post('/tracking/stop', locationController.stopTracking);

/**
 * GET /api/location/current/:userId
 * Get current location of a specific user
 */
router.get(
  '/current/:userId',
  [param('userId').isString().notEmpty()],
  validate,
  locationController.getCurrentLocation
);

export default router;