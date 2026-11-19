/**
 * Dean Routes
 */
const express = require('express');
const router = express.Router();
const deanController = require('../controllers/deanController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('Dean'));

// Analytics
router.get('/analytics', deanController.getAnalytics.bind(deanController));

// Exception Requests
router.get('/exceptions', deanController.getExceptions.bind(deanController));
router.post('/exceptions', deanController.submitException.bind(deanController));
router.post('/exceptions/:id/approve', deanController.approveException.bind(deanController));
router.post('/exceptions/:id/reject', deanController.rejectException.bind(deanController));

module.exports = router;
