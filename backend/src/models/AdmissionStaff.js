/**
 * AdmissionStaff Model
 * Represents an officer in the Admission Cell
 */

class AdmissionStaff {
  constructor(data) {
    this.admissionOfficerId = data.admissionOfficerId;
    this.userId = data.userId;
    this.name = data.name;
    this.email = data.email;
    this.department = data.department || 'Admission Cell';
    this.designation = data.designation || 'Admission Officer';
  }

  toJSON() {
    return {
      admissionOfficerId: this.admissionOfficerId,
      userId: this.userId,
      name: this.name,
      email: this.email,
      department: this.department,
      designation: this.designation
    };
  }
}

module.exports = AdmissionStaff;
