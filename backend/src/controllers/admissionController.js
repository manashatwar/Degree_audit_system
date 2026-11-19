/**
 * Admission Cell Controller
 * Handles transfer credits, course mappings, and lateral entries (SRS §11.5, FR-031 to FR-035)
 */

const storageService = require('../services/storageService');
const TransferCredit = require('../models/TransferCredit');
const { v4: uuidv4 } = require('uuid');

class AdmissionController {
  // GET /api/admission/students
  async getStudents(req, res, next) {
    try {
      const students = storageService.findAll('students') || [];
      const list = students.map(s => ({
        studentId: s.studentId,
        name: s.name,
        department: s.department,
        batchYear: s.batchYear,
        program: s.program
      }));

      res.json({
        success: true,
        data: list
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admission/dean-approvals
  // Returns Dean-approved credit substitutions and waivers awaiting Admission Cell evaluation
  async getDeanApprovals(req, res, next) {
    try {
      const allExceptions = storageService.findAll('exceptionRequests') || [];
      const students = storageService.findAll('students') || [];
      const existingCredits = storageService.findAll('transferCredits') || [];

      // Filter Dean-approved substitutions
      const deanApproved = allExceptions.filter(e => 
        e.status === 'Approved' && 
        (e.requestType === 'CreditSubstitution' || e.requestType === 'CourseWaiver')
      );

      const enriched = deanApproved.map(e => {
        const student = students.find(s => s.studentId === e.studentId);
        const hasTransferCredit = existingCredits.some(tc => 
          tc.studentId === e.studentId && 
          (tc.exceptionRequestId === e.requestId || (tc.mappedCourseCode && e.courseCode && tc.mappedCourseCode === e.courseCode))
        );

        return {
          ...e,
          studentName: student ? student.name : 'Unknown',
          department: student ? student.department : '',
          batchYear: student ? student.batchYear : '',
          isProcessed: hasTransferCredit || !!e.transferCreditCreated
        };
      });

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admission/stats
  async getStats(req, res, next) {
    try {
      const credits = storageService.findAll('transferCredits') || [];

      const totalApplications = credits.length;
      const pendingCount = credits.filter(c => c.status === 'Pending').length;
      const approvedCount = credits.filter(c => c.status === 'Approved').length;
      const rejectedCount = credits.filter(c => c.status === 'Rejected').length;
      const totalCreditsAwarded = credits
        .filter(c => c.status === 'Approved')
        .reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

      const uniqueInstitutions = new Set(credits.map(c => c.institutionName).filter(Boolean));

      res.json({
        success: true,
        data: {
          totalApplications,
          pendingCount,
          approvedCount,
          rejectedCount,
          totalCreditsAwarded,
          institutionsCount: uniqueInstitutions.size
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admission/credits
  async getAllTransferCredits(req, res, next) {
    try {
      const credits = storageService.findAll('transferCredits') || [];
      const students = storageService.findAll('students') || [];

      const enriched = credits.map(c => {
        const student = students.find(s => s.studentId === c.studentId);
        return {
          ...c,
          studentName: student ? student.name : 'Unknown',
          department: student ? student.department : '',
          batchYear: student ? student.batchYear : '',
          program: student ? student.program : ''
        };
      });

      // Sort: Pending first, then newest
      enriched.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admission/credits
  async recordTransferCredit(req, res, next) {
    try {
      const {
        studentId,
        institutionName,
        externalCourseName,
        externalGrade,
        credits,
        mappedCourseCode,
        mappedCategory,
        remarks,
        status,
        exceptionRequestId
      } = req.body;

      if (!studentId || !institutionName || !externalCourseName || !credits) {
        return res.status(400).json({
          success: false,
          message: 'studentId, institutionName, externalCourseName, and credits are required'
        });
      }

      const student = storageService.findById('students', 'studentId', studentId.trim());
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with ID '${studentId}' not found`
        });
      }

      const initialStatus = status === 'Approved' ? 'Approved' : 'Pending';
      const userEmail = req.user?.email || 'admission@lnmiit.ac.in';

      const transferCreditId = `TC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      const newCredit = new TransferCredit({
        transferCreditId,
        studentId: studentId.trim(),
        institutionName: institutionName.trim(),
        externalCourseName: externalCourseName.trim(),
        externalGrade: externalGrade ? externalGrade.trim() : 'A',
        credits: Number(credits) || 4.0,
        mappedCourseCode: mappedCourseCode ? mappedCourseCode.trim().toUpperCase() : '',
        mappedCategory: mappedCategory || 'Electives',
        status: initialStatus,
        approvedBy: initialStatus === 'Approved' ? userEmail : null,
        approvalDate: initialStatus === 'Approved' ? new Date().toISOString() : null,
        remarks: remarks ? remarks.trim() : '',
        exceptionRequestId: exceptionRequestId || null,
        createdAt: new Date().toISOString()
      });

      storageService.create('transferCredits', newCredit.toJSON());

      // If linked to an Exception Request, mark it as processed
      if (exceptionRequestId) {
        storageService.update('exceptionRequests', 'requestId', exceptionRequestId, {
          transferCreditCreated: true,
          transferCreditId
        });
      }

      // If created as Approved, invalidate student's cached audits so it reflects immediately
      if (initialStatus === 'Approved') {
        const audits = storageService.findAll('auditReports').filter(a => a.studentId === studentId.trim());
        audits.forEach(a => storageService.delete('auditReports', 'auditId', a.auditId));
      }

      res.status(201).json({
        success: true,
        message: 'Transfer credit record created successfully',
        data: newCredit.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admission/credits/:id/status
  async updateTransferCreditStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, mappedCourseCode, mappedCategory, remarks } = req.body;

      const record = storageService.findById('transferCredits', 'transferCreditId', id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Transfer credit record not found'
        });
      }

      const updateData = {};
      if (status) {
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        updateData.status = status;
        if (status === 'Approved') {
          updateData.approvedBy = req.user?.email || 'admission@lnmiit.ac.in';
          updateData.approvalDate = new Date().toISOString();
        } else if (status === 'Rejected') {
          updateData.approvedBy = req.user?.email || 'admission@lnmiit.ac.in';
          updateData.approvalDate = new Date().toISOString();
        } else {
          updateData.approvedBy = null;
          updateData.approvalDate = null;
        }
      }

      if (mappedCourseCode !== undefined) updateData.mappedCourseCode = mappedCourseCode.trim().toUpperCase();
      if (mappedCategory !== undefined) updateData.mappedCategory = mappedCategory;
      if (remarks !== undefined) updateData.remarks = remarks;

      const updated = storageService.update('transferCredits', 'transferCreditId', id, updateData);

      // Invalidate student's cached audit reports so degree audit recomputes
      const audits = storageService.findAll('auditReports').filter(a => a.studentId === record.studentId);
      audits.forEach(a => storageService.delete('auditReports', 'auditId', a.auditId));

      res.json({
        success: true,
        message: `Transfer credit status updated to ${status || record.status}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admission/credits/:id
  async deleteTransferCredit(req, res, next) {
    try {
      const { id } = req.params;
      const record = storageService.findById('transferCredits', 'transferCreditId', id);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      storageService.delete('transferCredits', 'transferCreditId', id);

      // Invalidate cached audits
      const audits = storageService.findAll('auditReports').filter(a => a.studentId === record.studentId);
      audits.forEach(a => storageService.delete('auditReports', 'auditId', a.auditId));

      res.json({
        success: true,
        message: 'Transfer credit record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdmissionController();
