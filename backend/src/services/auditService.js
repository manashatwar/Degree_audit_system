/**
 * Audit Service
 * Handles degree audit calculation logic
 */

const storageService = require('./storageService');
const { v4: uuidv4 } = require('uuid');
const AuditReport = require('../models/AuditReport');

class AuditService {
  // Convert letter grade to grade point
  getGradePoint(grade) {
    // If already a number, return it
    if (typeof grade === 'number') return grade;
    
    // LNMIIT letter grade mapping
    const gradeMap = {
      'A': 10, 'AB': 9, 'B': 8, 'BC': 7,
      'C': 6, 'CD': 5, 'D': 4, 'F': 0
    };
    
    const upperGrade = String(grade).toUpperCase();
    return gradeMap[upperGrade] !== undefined ? gradeMap[upperGrade] : 0;
  }

  // Check if grade is passing (D or higher)
  isPassing(grade) {
    return this.getGradePoint(grade) >= 4;
  }

  calculateCGPA(transcripts) {
    if (!transcripts || transcripts.length === 0) return 0;

    // Only include passing grades (D or higher) with earned credits
    const validGrades = transcripts.filter(t => 
      this.isPassing(t.grade) && t.creditsEarned > 0
    );
    
    if (validGrades.length === 0) return 0;

    const totalPoints = validGrades.reduce((sum, t) => {
      const gradePoint = this.getGradePoint(t.grade);
      return sum + (gradePoint * t.creditsEarned);
    }, 0);
    
    const totalCredits = validGrades.reduce((sum, t) => sum + t.creditsEarned, 0);

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  }

  generateAudit(studentId) {
    // Get student data
    const student = storageService.findById('students', 'studentId', studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Debug: Log student data to verify auto-detection
    console.log('Student data for audit:', {
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      batchYear: student.batchYear,
      department: student.department,
      program: student.program
    });

    // Get catalog
    const catalog = storageService.findCatalogByYear(student.catalogYear);
    if (!catalog) {
      throw new Error('Catalog not found for year ' + student.catalogYear);
    }

    // Get requirements
    const requirements = storageService.findRequirementsByCatalogId(catalog.catalogId);

    // Get transcripts
    const transcripts = storageService.findTranscriptsByStudentId(studentId);

    // Calculate CGPA
    const CGPA = parseFloat(this.calculateCGPA(transcripts));

    // Calculate total credits earned (only passing grades D or higher)
    const totalCreditsEarned = transcripts
      .filter(t => this.isPassing(t.grade))
      .reduce((sum, t) => sum + t.creditsEarned, 0);

    // Analyze each requirement category
    const categoryProgress = requirements.map(req => {
      const relevantTranscripts = transcripts.filter(t => 
        req.courseList.includes(t.courseCode) && this.isPassing(t.grade)
      );

      const creditsEarned = relevantTranscripts.reduce((sum, t) => sum + t.creditsEarned, 0);
      const percentComplete = req.minimumCredits > 0 
        ? Math.min(100, Math.round((creditsEarned / req.minimumCredits) * 100))
        : 0;

      return {
        requirementId: req.requirementId,
        category: req.category,
        description: req.description,
        creditsRequired: req.minimumCredits,
        creditsEarned: creditsEarned,
        percentComplete: percentComplete,
        status: creditsEarned >= req.minimumCredits ? 'Satisfied' : 'In Progress'
      };
    });

    // Get completed courses (include all courses, not just passing)
    const completedCourses = transcripts.map(t => {
      const course = storageService.findById('courses', 'courseCode', t.courseCode);
      return {
        courseCode: t.courseCode,
        courseName: course ? course.courseName : 'Unknown',
        courseType: course ? course.courseType : 'Core',
        credits: course ? course.credits : t.creditsEarned,
        grade: t.grade,
        semester: t.semester
      };
    });

    // Get in-progress courses (current semester - mock data)
    const inProgressCourses = [];

    // Calculate remaining requirements
    const remainingRequirements = categoryProgress
      .filter(cat => cat.status !== 'Satisfied')
      .map(cat => ({
        category: cat.category,
        creditsNeeded: cat.creditsRequired - cat.creditsEarned,
        description: cat.description
      }));

    // Determine graduation eligibility
    const graduationEligible = totalCreditsEarned >= catalog.totalCreditsRequired && CGPA >= 6.0;

    // Create audit report
    const auditReport = new AuditReport({
      auditId: uuidv4(),
      studentId: studentId,
      studentName: student.name,
      program: student.program || `B.Tech ${student.department}`,
      department: student.department,
      batchYear: student.batchYear,
      catalogYear: catalog.catalogYear,
      currentSemester: student.currentSemester || 1,
      generatedDate: new Date().toISOString(),
      totalCreditsEarned: totalCreditsEarned,
      totalCreditsRequired: catalog.totalCreditsRequired,
      CGPA: CGPA,
      graduationEligible: graduationEligible,
      status: 'Current',
      categoryProgress: categoryProgress,
      completedCourses: completedCourses,
      inProgressCourses: inProgressCourses,
      remainingRequirements: remainingRequirements
    });

    // Save audit report
    storageService.create('auditReports', auditReport);

    return auditReport;
  }

  getLatestAudit(studentId) {
    const audit = storageService.findLatestAuditByStudentId(studentId);
    
    if (!audit) {
      // Generate new audit if none exists
      return this.generateAudit(studentId);
    }

    // Check if audit is stale (older than 1 day for demo purposes)
    const auditAge = Date.now() - new Date(audit.generatedDate).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (auditAge > oneDayMs || audit.status === 'Stale') {
      // Regenerate audit
      return this.generateAudit(studentId);
    }

    return audit;
  }
}

module.exports = new AuditService();
