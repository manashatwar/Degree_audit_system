/**
 * Dean Controller
 * Handles Dean of Academic Affairs operations:
 *  - Institution-wide analytics
 *  - Exception request review and approval
 *  - Policy compliance overview
 */

const storageService = require('../services/storageService');
const auditService = require('../services/auditService');
const riskAssessmentService = require('../services/riskAssessmentService');
const { v4: uuidv4 } = require('uuid');
const ExceptionRequest = require('../models/ExceptionRequest');

class DeanController {

  // ─── Analytics ───────────────────────────────────────────────────────────────

  /**
   * GET /api/dean/analytics
   * Institution-wide summary: students, CGPA distribution, at-risk counts, dept breakdown
   */
  getAnalytics(req, res) {
    try {
      const students = storageService.findAll('students');
      const transcripts = storageService.findAll('transcripts');
      const advisors = storageService.findAll('facultyAdvisors');

      // Build per-student audit summary
      const studentSummaries = students.map(student => {
        try {
          const audit = auditService.getLatestAudit(student.studentId);
          return {
            studentId: student.studentId,
            name: student.name,
            department: student.department,
            program: student.program,
            batchYear: student.batchYear,
            currentSemester: student.currentSemester,
            cgpa: audit.CGPA,
            totalCreditsEarned: audit.totalCreditsEarned,
            totalCreditsRequired: audit.totalCreditsRequired,
            graduationEligible: audit.graduationEligible,
            completionPct: audit.totalCreditsRequired > 0
              ? Math.round((audit.totalCreditsEarned / audit.totalCreditsRequired) * 100)
              : 0
          };
        } catch {
          return {
            studentId: student.studentId,
            name: student.name,
            department: student.department,
            program: student.program,
            batchYear: student.batchYear,
            currentSemester: student.currentSemester,
            cgpa: 0,
            totalCreditsEarned: 0,
            totalCreditsRequired: 160,
            graduationEligible: false,
            completionPct: 0
          };
        }
      });

      // Department breakdown
      const deptMap = {};
      studentSummaries.forEach(s => {
        if (!deptMap[s.department]) {
          deptMap[s.department] = { department: s.department, count: 0, totalCGPA: 0, atRisk: 0, eligible: 0 };
        }
        deptMap[s.department].count++;
        deptMap[s.department].totalCGPA += s.cgpa;
        if (s.cgpa < 6.0) deptMap[s.department].atRisk++;
        if (s.graduationEligible) deptMap[s.department].eligible++;
      });
      const departmentBreakdown = Object.values(deptMap).map(d => ({
        ...d,
        avgCGPA: d.count > 0 ? +(d.totalCGPA / d.count).toFixed(2) : 0
      }));

      // CGPA distribution buckets
      const cgpaBuckets = { 'Below 5': 0, '5–6': 0, '6–7': 0, '7–8': 0, '8–9': 0, '9–10': 0 };
      studentSummaries.forEach(s => {
        if (s.cgpa < 5) cgpaBuckets['Below 5']++;
        else if (s.cgpa < 6) cgpaBuckets['5–6']++;
        else if (s.cgpa < 7) cgpaBuckets['6–7']++;
        else if (s.cgpa < 8) cgpaBuckets['7–8']++;
        else if (s.cgpa < 9) cgpaBuckets['8–9']++;
        else cgpaBuckets['9–10']++;
      });

      // Batch-year trend
      const batchMap = {};
      studentSummaries.forEach(s => {
        const y = s.batchYear || 'Unknown';
        if (!batchMap[y]) batchMap[y] = { batchYear: y, count: 0, totalCGPA: 0 };
        batchMap[y].count++;
        batchMap[y].totalCGPA += s.cgpa;
      });
      const batchTrend = Object.values(batchMap)
        .map(b => ({ ...b, avgCGPA: b.count > 0 ? +(b.totalCGPA / b.count).toFixed(2) : 0 }))
        .sort((a, b) => a.batchYear - b.batchYear);

      const totalStudents = studentSummaries.length;
      const atRiskCount = studentSummaries.filter(s => s.cgpa > 0 && s.cgpa < 6.0).length;
      const eligibleCount = studentSummaries.filter(s => s.graduationEligible).length;
      const avgCGPA = totalStudents > 0
        ? +(studentSummaries.reduce((sum, s) => sum + s.cgpa, 0) / totalStudents).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          summary: { totalStudents, atRiskCount, eligibleCount, avgCGPA, totalAdvisors: advisors.length },
          departmentBreakdown,
          cgpaDistribution: Object.entries(cgpaBuckets).map(([range, count]) => ({ range, count })),
          batchTrend,
          students: studentSummaries
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Exception Requests ───────────────────────────────────────────────────────

  /**
   * GET /api/dean/exceptions
   * List all exception requests (all statuses)
   */
  getExceptions(req, res) {
    try {
      const requests = storageService.findAll('exceptionRequests');
      const students = storageService.findAll('students');

      const enriched = requests.map(r => {
        const student = students.find(s => s.studentId === r.studentId);
        return { ...r, student: student || null };
      });

      // Sort: Pending first, then by date desc
      enriched.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.submittedDate) - new Date(a.submittedDate);
      });

      res.json({ success: true, data: enriched });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/dean/exceptions/:id/approve
   * Approve an exception request
   */
  approveException(req, res) {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const deanUserId = req.user.userId;

      const request = storageService.findById('exceptionRequests', 'requestId', id);
      if (!request) return res.status(404).json({ success: false, message: 'Exception request not found' });
      if (request.status !== 'Pending') {
        return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
      }

      const updated = storageService.update('exceptionRequests', 'requestId', id, {
        status: 'Approved',
        reviewedBy: deanUserId,
        reviewDate: new Date().toISOString(),
        reviewNotes: reviewNotes || 'Approved by Dean'
      });

      // Invalidate cached audit reports for this student so recalculation runs fresh
      const audits = storageService.findAll('auditReports').filter(a => a.studentId === request.studentId);
      audits.forEach(a => storageService.delete('auditReports', 'auditId', a.auditId));

      res.json({ success: true, message: 'Exception request approved', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/dean/exceptions/:id/reject
   * Reject an exception request
   */
  rejectException(req, res) {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const deanUserId = req.user.userId;

      if (!reviewNotes || !reviewNotes.trim()) {
        return res.status(400).json({ success: false, message: 'Review notes are required when rejecting a request' });
      }

      const request = storageService.findById('exceptionRequests', 'requestId', id);
      if (!request) return res.status(404).json({ success: false, message: 'Exception request not found' });
      if (request.status !== 'Pending') {
        return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
      }

      const updated = storageService.update('exceptionRequests', 'requestId', id, {
        status: 'Rejected',
        reviewedBy: deanUserId,
        reviewDate: new Date().toISOString(),
        reviewNotes: reviewNotes.trim()
      });

      // Invalidate cached audit reports for this student
      const audits = storageService.findAll('auditReports').filter(a => a.studentId === request.studentId);
      audits.forEach(a => storageService.delete('auditReports', 'auditId', a.auditId));

      res.json({ success: true, message: 'Exception request rejected', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/dean/exceptions
   * Submit a new exception request (can be submitted by any authenticated user on behalf of a student)
   */
  submitException(req, res) {
    try {
      const { studentId, requestType, description } = req.body;
      if (!studentId || !requestType || !description) {
        return res.status(400).json({ success: false, message: 'studentId, requestType, and description are required' });
      }

      const student = storageService.findById('students', 'studentId', studentId);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      const request = new ExceptionRequest({
        requestId: uuidv4(),
        studentId,
        requestType,
        description,
        requestedBy: req.user.userId,
        submittedDate: new Date().toISOString(),
        status: 'Pending'
      });

      storageService.create('exceptionRequests', request);
      res.status(201).json({ success: true, message: 'Exception request submitted', data: request });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new DeanController();
