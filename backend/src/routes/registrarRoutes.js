/**
 * Registrar Routes
 * UC-006: Import Student Transcripts
 */

const express = require('express');
const router = express.Router();
const registrarController = require('../controllers/registrarController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication and RegistrarStaff role
router.use(auth);
router.use(authorize('RegistrarStaff'));

// POST /api/registrar/import/validate - Validate transcript file
router.post('/import/validate', registrarController.validateImport);

// POST /api/registrar/import/preview - Preview import data
router.post('/import/preview', registrarController.previewImport);

// POST /api/registrar/import/confirm - Confirm and execute import
router.post('/import/confirm', registrarController.confirmImport);

// GET /api/registrar/import/:id/status - Get import status
router.get('/import/:id/status', registrarController.getImportStatus);

module.exports = router;
