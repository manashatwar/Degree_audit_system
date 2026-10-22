/**
 * Advisor Routes
 * UC-005: Identify At-Risk Students
 */

const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication and FacultyAdvisor role
router.use(auth);
router.use(authorize('FacultyAdvisor'));

// GET /api/advisors/:id/advisees - Get assigned students
router.get('/:id/advisees', advisorController.getAdvisees);

// GET /api/advisors/:id/at-risk - Get at-risk students
router.get('/:id/at-risk', advisorController.getAtRiskStudents);

// GET /api/advisors/:id/students/:studentId/audit - Get advisee audit
router.get('/:id/students/:studentId/audit', advisorController.getStudentAudit);

module.exports = router;
