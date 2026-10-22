/**
 * AuditReport Model
 * Generated degree audit showing student progress
 */

class AuditReport {
  constructor(data) {
    this.auditId = data.auditId;
    this.studentId = data.studentId;
    this.studentName = data.studentName;
    this.program = data.program;
    this.department = data.department;
    this.batchYear = data.batchYear;
    this.currentSemester = data.currentSemester;
    this.generatedDate = data.generatedDate || new Date().toISOString();
    this.catalogYear = data.catalogYear;
    this.totalCreditsEarned = data.totalCreditsEarned || 0;
    this.totalCreditsRequired = data.totalCreditsRequired || 160;
    this.CGPA = data.CGPA || 0;
    this.graduationEligible = data.graduationEligible || false;
    this.status = data.status || 'Current'; // 'Current', 'Stale', 'Calculating'
    this.categoryProgress = data.categoryProgress || [];
    this.completedCourses = data.completedCourses || [];
    this.inProgressCourses = data.inProgressCourses || [];
    this.remainingRequirements = data.remainingRequirements || [];
  }

  toJSON() {
    return {
      auditId: this.auditId,
      studentId: this.studentId,
      studentName: this.studentName,
      program: this.program,
      department: this.department,
      batchYear: this.batchYear,
      currentSemester: this.currentSemester,
      generatedDate: this.generatedDate,
      catalogYear: this.catalogYear,
      totalCreditsEarned: this.totalCreditsEarned,
      totalCreditsRequired: this.totalCreditsRequired,
      CGPA: this.CGPA,
      graduationEligible: this.graduationEligible,
      status: this.status,
      categoryProgress: this.categoryProgress,
      completedCourses: this.completedCourses,
      inProgressCourses: this.inProgressCourses,
      remainingRequirements: this.remainingRequirements
    };
  }
}

module.exports = AuditReport;
