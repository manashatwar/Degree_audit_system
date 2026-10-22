/**
 * Student Routes
 * UC-002: View Degree Audit
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/students/:id/audit - Get degree audit
router.get('/:id/audit', studentController.getAudit);

// GET /api/students/:id/transcript - Get transcript
router.get('/:id/transcript', studentController.getTranscript);

// GET /api/students/:id/progress - Get progress summary
router.get('/:id/progress', studentController.getProgress);

module.exports = router;
