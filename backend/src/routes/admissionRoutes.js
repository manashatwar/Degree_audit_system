/**
 * Admission Cell Routes
 * UC-009, UC-010, UC-017 (SRS §11.5, §13.6)
 */

const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

// GET /api/admission/stats - Overview statistics
router.get('/stats', authorize('AdmissionCell', 'Dean', 'RegistrarStaff'), admissionController.getStats);

// GET /api/admission/students - Get students list for selection
router.get('/students', authorize('AdmissionCell', 'Dean', 'RegistrarStaff'), admissionController.getStudents);

// GET /api/admission/dean-approvals - Get Dean-approved credit substitutions
router.get('/dean-approvals', authorize('AdmissionCell', 'Dean', 'RegistrarStaff'), admissionController.getDeanApprovals);

// GET /api/admission/credits - All transfer credits
router.get('/credits', authorize('AdmissionCell', 'Dean', 'RegistrarStaff'), admissionController.getAllTransferCredits);

// POST /api/admission/credits - Record transfer credit
router.post('/credits', authorize('AdmissionCell', 'RegistrarStaff'), admissionController.recordTransferCredit);

// PUT /api/admission/credits/:id/status - Approve/Reject/Update transfer credit
router.put('/credits/:id/status', authorize('AdmissionCell', 'Dean'), admissionController.updateTransferCreditStatus);

// DELETE /api/admission/credits/:id - Delete transfer credit
router.delete('/credits/:id', authorize('AdmissionCell'), admissionController.deleteTransferCredit);

module.exports = router;
