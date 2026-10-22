/**
 * Student Controller
 * Handles student-related HTTP requests (UC-002: View Degree Audit)
 */

const storageService = require('../services/storageService');
const auditService = require('../services/auditService');

class StudentController {
  async getAudit(req, res, next) {
    try {
      const { id } = req.params;

      // Verify student exists
      const student = storageService.findById('students', 'studentId', id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Generate or retrieve audit
      const audit = auditService.getLatestAudit(id);

      res.json({
        success: true,
        data: audit
      });
    } catch (error) {
      next(error);
    }
  }

  async getTranscript(req, res, next) {
    try {
      const { id } = req.params;

      const student = storageService.findById('students', 'studentId', id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const transcripts = storageService.findTranscriptsByStudentId(id);

      // Enrich with course details
      const enrichedTranscripts = transcripts.map(t => {
        const course = storageService.findById('courses', 'courseCode', t.courseCode);
        return {
          ...t,
          courseName: course ? course.courseName : 'Unknown',
          department: course ? course.department : 'Unknown'
        };
      });

      res.json({
        success: true,
        data: enrichedTranscripts
      });
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req, res, next) {
    try {
      const { id } = req.params;

      const student = storageService.findById('students', 'studentId', id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const audit = auditService.getLatestAudit(id);

      // Extract progress summary
      const progressSummary = {
        studentId: student.studentId,
        name: student.name,
        program: student.program,
        currentSemester: student.currentSemester,
        catalogYear: student.catalogYear,
        totalCreditsEarned: audit.totalCreditsEarned,
        totalCreditsRequired: audit.totalCreditsRequired,
        progressPercentage: Math.round((audit.totalCreditsEarned / audit.totalCreditsRequired) * 100),
        CGPA: audit.CGPA,
        graduationEligible: audit.graduationEligible,
        categoryProgress: audit.categoryProgress
      };

      res.json({
        success: true,
        data: progressSummary
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
