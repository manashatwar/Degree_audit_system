/**
 * AdvisorAssignment Model
 * Links students to their faculty advisors
 */

class AdvisorAssignment {
  constructor(data) {
    this.assignmentId = data.assignmentId;
    this.advisorId = data.advisorId;
    this.studentId = data.studentId;
    this.assignmentDate = data.assignmentDate || new Date().toISOString();
    this.status = data.status || 'Active';
  }

  toJSON() {
    return {
      assignmentId: this.assignmentId,
      advisorId: this.advisorId,
      studentId: this.studentId,
      assignmentDate: this.assignmentDate,
      status: this.status
    };
  }
}

module.exports = AdvisorAssignment;
