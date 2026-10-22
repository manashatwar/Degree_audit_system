/**
 * User Model
 * Base model for all system users
 */

class User {
  constructor(data) {
    this.userId = data.userId;
    this.email = data.email;
    this.password = data.password; // Should be hashed
    this.role = data.role; // 'Student', 'FacultyAdvisor', 'RegistrarStaff'
    this.accountStatus = data.accountStatus || 'Active';
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      role: this.role,
      accountStatus: this.accountStatus,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
