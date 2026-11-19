/**
 * Student Controller
 * Handles student-related HTTP requests (UC-002: View Degree Audit)
 */

const storageService = require('../services/storageService');
const auditService = require('../services/auditService');
const { v4: uuidv4 } = require('uuid');
const ExceptionRequest = require('../models/ExceptionRequest');

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

  // GET /api/students/:id/exceptions - Get all exception requests for student
  async getExceptions(req, res, next) {
    try {
      const { id } = req.params;

      const student = storageService.findById('students', 'studentId', id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const allRequests = storageService.findAll('exceptionRequests') || [];
      const studentRequests = allRequests.filter(r => r.studentId === id);
      const transferCredits = storageService.findAll('transferCredits') || [];

      const enriched = studentRequests.map(r => {
        const tc = transferCredits.find(t => 
          t.studentId === id && 
          (t.exceptionRequestId === r.requestId || (t.mappedCourseCode && r.courseCode && t.mappedCourseCode === r.courseCode))
        );
        return {
          ...r,
          transferCredit: tc || null,
          transferCreditCreated: tc ? true : !!r.transferCreditCreated
        };
      });

      // Sort newest first
      enriched.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/students/:id/exceptions - Submit new exception request
  async submitException(req, res, next) {
    try {
      const { id } = req.params;
      const { requestType, courseCode, description } = req.body;

      if (!requestType || !description) {
        return res.status(400).json({
          success: false,
          message: 'requestType and description are required'
        });
      }

      const student = storageService.findById('students', 'studentId', id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const formattedDescription = courseCode 
        ? (description.includes(courseCode) ? description : `[${courseCode.toUpperCase()}] ${description}`)
        : description;

      const newRequest = new ExceptionRequest({
        requestId: uuidv4(),
        studentId: id,
        requestType,
        courseCode: courseCode ? courseCode.toUpperCase() : null,
        description: formattedDescription,
        requestedBy: req.user.userId,
        submittedDate: new Date().toISOString(),
        status: 'Pending'
      });

      storageService.create('exceptionRequests', newRequest);

      res.status(201).json({
        success: true,
        message: 'Exception request submitted successfully to Dean for approval',
        data: newRequest
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
