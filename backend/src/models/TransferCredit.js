/**
 * TransferCredit Model
 * Represents transfer credits from other institutions (SRS §16, FR-031 to FR-035)
 */

class TransferCredit {
  constructor(data) {
    this.transferCreditId = data.transferCreditId;
    this.studentId = data.studentId;
    this.institutionName = data.institutionName;
    this.externalCourseName = data.externalCourseName;
    this.externalGrade = data.externalGrade || 'A';
    this.credits = Number(data.credits) || 4.0;
    this.mappedCourseCode = data.mappedCourseCode || '';
    this.mappedCategory = data.mappedCategory || 'Electives';
    this.status = data.status || 'Pending'; // 'Pending', 'Approved', 'Rejected'
    this.approvedBy = data.approvedBy || null;
    this.approvalDate = data.approvalDate || null;
    this.remarks = data.remarks || '';
    this.exceptionRequestId = data.exceptionRequestId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      transferCreditId: this.transferCreditId,
      studentId: this.studentId,
      institutionName: this.institutionName,
      externalCourseName: this.externalCourseName,
      externalGrade: this.externalGrade,
      credits: this.credits,
      mappedCourseCode: this.mappedCourseCode,
      mappedCategory: this.mappedCategory,
      status: this.status,
      approvedBy: this.approvedBy,
      approvalDate: this.approvalDate,
      remarks: this.remarks,
      exceptionRequestId: this.exceptionRequestId,
      createdAt: this.createdAt
    };
  }
}

module.exports = TransferCredit;
