/**
 * User Model
 * Base model for all system users
 */

class User {
  constructor(data) {
    this.userId = data.userId;
    this.email = data.email;
    this.password = data.password; // Should be hashed
    this.role = data.role; // 'Student', 'FacultyAdvisor', 'RegistrarStaff', 'Dean', 'HOD', 'AdmissionCell', 'SystemAdmin'
    this.name = data.name || null;
    this.department = data.department || null;
    this.accountStatus = data.accountStatus || 'Active'; // 'Active', 'Suspended', 'Inactive'
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      role: this.role,
      name: this.name,
      department: this.department,
      accountStatus: this.accountStatus,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
