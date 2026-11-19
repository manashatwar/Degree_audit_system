/**
 * ExceptionRequest Model
 * Represents a student's request for an exception to standard degree requirements
 * Per SRS BR-014: Only Dean can approve exceptions
 */
class ExceptionRequest {
  constructor(data) {
    this.requestId = data.requestId;
    this.studentId = data.studentId;
    this.requestType = data.requestType; // 'CourseWaiver' | 'CreditSubstitution' | 'GradeException' | 'Other'
    this.courseCode = data.courseCode || null;
    this.description = data.description;
    this.requestedBy = data.requestedBy; // userId
    this.submittedDate = data.submittedDate || new Date().toISOString();
    this.status = data.status || 'Pending'; // 'Pending' | 'Approved' | 'Rejected'
    this.reviewedBy = data.reviewedBy || null;  // deanId
    this.reviewDate = data.reviewDate || null;
    this.reviewNotes = data.reviewNotes || '';
  }
}

module.exports = ExceptionRequest;
