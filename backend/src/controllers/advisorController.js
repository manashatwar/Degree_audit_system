/**
 * Advisor Controller
 * Handles faculty advisor-related HTTP requests (UC-005: Identify At-Risk Students)
 */

const storageService = require('../services/storageService');
const riskAssessmentService = require('../services/riskAssessmentService');
const auditService = require('../services/auditService');

class AdvisorController {
  async getAdvisees(req, res, next) {
    try {
      const { id } = req.params;

      const advisor = storageService.findById('facultyAdvisors', 'advisorId', id);
      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      const advisees = storageService.findAdviseesByAdvisorId(id);

      res.json({
        success: true,
        data: advisees
      });
    } catch (error) {
      next(error);
    }
  }

  async getAtRiskStudents(req, res, next) {
    try {
      const { id } = req.params;

      const advisor = storageService.findById('facultyAdvisors', 'advisorId', id);
      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      const atRiskStudents = riskAssessmentService.identifyAtRiskStudents(id);

      res.json({
        success: true,
        data: {
          totalAdvisees: storageService.findAdviseesByAdvisorId(id).length,
          atRiskCount: atRiskStudents.length,
          students: atRiskStudents
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentAudit(req, res, next) {
    try {
      const { id, studentId } = req.params;

      const advisor = storageService.findById('facultyAdvisors', 'advisorId', id);
      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      // Verify student is assigned to this advisor
      const assignments = storageService.findBy('advisorAssignments', {
        advisorId: id,
        studentId: studentId,
        status: 'Active'
      });

      if (assignments.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'This student is not assigned to you'
        });
      }

      const student = storageService.findById('students', 'studentId', studentId);
      const audit = auditService.getLatestAudit(studentId);

      res.json({
        success: true,
        data: {
          student: student,
          audit: audit
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdvisorController();
