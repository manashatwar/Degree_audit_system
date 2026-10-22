/**
 * Assignment Controller
 * Handles advisor-student assignment management
 */

const storageService = require('../services/storageService');
const AdvisorAssignment = require('../models/AdvisorAssignment');
const { v4: uuidv4 } = require('uuid');

class AssignmentController {
  // Get all students (for assignment UI)
  async getAllStudents(req, res, next) {
    try {
      const students = storageService.findAll('students');
      
      // Enrich with current advisor info
      const enrichedStudents = students.map(student => {
        const assignment = storageService.findBy('advisorAssignments', {
          studentId: student.studentId,
          status: 'Active'
        })[0];
        
        let advisor = null;
        if (assignment) {
          advisor = storageService.findById('facultyAdvisors', 'advisorId', assignment.advisorId);
        }
        
        return {
          ...student,
          currentAdvisor: advisor ? {
            advisorId: advisor.advisorId,
            name: advisor.name,
            department: advisor.department
          } : null
        };
      });

      res.json({
        success: true,
        data: enrichedStudents
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all advisors
  async getAllAdvisors(req, res, next) {
    try {
      const advisors = storageService.findAll('facultyAdvisors');
      
      // Count advisees for each advisor
      const enrichedAdvisors = advisors.map(advisor => {
        const assignments = storageService.findBy('advisorAssignments', {
          advisorId: advisor.advisorId,
          status: 'Active'
        });
        
        return {
          ...advisor,
          adviseeCount: assignments.length
        };
      });

      res.json({
        success: true,
        data: enrichedAdvisors
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign student to advisor
  async assignStudentToAdvisor(req, res, next) {
    try {
      const { studentId, advisorId } = req.body;

      if (!studentId || !advisorId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Advisor ID are required'
        });
      }

      // Verify student exists
      const student = storageService.findById('students', 'studentId', studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Verify advisor exists
      const advisor = storageService.findById('facultyAdvisors', 'advisorId', advisorId);
      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      // Check if student already has an active assignment
      const existingAssignment = storageService.findBy('advisorAssignments', {
        studentId: studentId,
        status: 'Active'
      })[0];

      if (existingAssignment) {
        // Deactivate old assignment
        existingAssignment.status = 'Inactive';
        storageService.update('advisorAssignments', 'assignmentId', existingAssignment.assignmentId, existingAssignment);
      }

      // Create new assignment
      const newAssignment = new AdvisorAssignment({
        assignmentId: uuidv4(),
        advisorId: advisorId,
        studentId: studentId,
        assignmentDate: new Date().toISOString(),
        status: 'Active'
      });

      storageService.create('advisorAssignments', newAssignment);

      res.json({
        success: true,
        message: `Student ${studentId} assigned to ${advisor.name}`,
        data: newAssignment
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove advisor assignment
  async removeAssignment(req, res, next) {
    try {
      const { studentId } = req.params;

      // Find active assignment
      const assignment = storageService.findBy('advisorAssignments', {
        studentId: studentId,
        status: 'Active'
      })[0];

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'No active assignment found for this student'
        });
      }

      // Deactivate assignment
      assignment.status = 'Inactive';
      storageService.update('advisorAssignments', 'assignmentId', assignment.assignmentId, assignment);

      res.json({
        success: true,
        message: 'Advisor assignment removed',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  // Get assignment statistics
  async getAssignmentStats(req, res, next) {
    try {
      const students = storageService.findAll('students');
      const advisors = storageService.findAll('facultyAdvisors');
      const activeAssignments = storageService.findBy('advisorAssignments', { status: 'Active' });

      const unassignedStudents = students.filter(student => {
        return !activeAssignments.find(a => a.studentId === student.studentId);
      });

      res.json({
        success: true,
        data: {
          totalStudents: students.length,
          totalAdvisors: advisors.length,
          assignedStudents: activeAssignments.length,
          unassignedStudents: unassignedStudents.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();
