/**
 * Assignment Routes
 * Routes for managing advisor-student assignments
 */

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Get all students with advisor info
router.get('/students', assignmentController.getAllStudents);

// Get all advisors with advisee count
router.get('/advisors', assignmentController.getAllAdvisors);

// Get assignment statistics
router.get('/stats', assignmentController.getAssignmentStats);

// Assign student to advisor
router.post('/assign', assignmentController.assignStudentToAdvisor);

// Remove assignment
router.delete('/students/:studentId/assignment', assignmentController.removeAssignment);

module.exports = router;
