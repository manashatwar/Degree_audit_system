/**
 * System Administrator Routes
 * Implements SRS §11.7, §13.9, FR-048, FR-004, FR-049, FR-050, FR-051, UC-014
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('SystemAdmin', 'Admin'));

// System stats
router.get('/stats', adminController.getStats);

// User Management (FR-048, FR-004)
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.post('/users/:id/reset-password', adminController.resetPassword);
router.delete('/users/:id', adminController.deleteUser);

// System Configuration (FR-050)
router.get('/config', adminController.getConfig);
router.put('/config', adminController.updateConfig);

// System Logs & Audit Trail (FR-051, UC-014)
router.get('/logs', adminController.getLogs);

// Bulk Import (FR-049)
router.post('/bulk-import', adminController.bulkImport);

module.exports = router;
