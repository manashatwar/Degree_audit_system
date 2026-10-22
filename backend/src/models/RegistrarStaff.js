/**
 * RegistrarStaff Model
 * Represents registrar office staff members
 */

class RegistrarStaff {
  constructor(data) {
    this.registrarId = data.registrarId;
    this.userId = data.userId;
    this.name = data.name;
    this.department = data.department || 'Academic Section';
    this.email = data.email;
  }

  toJSON() {
    return {
      registrarId: this.registrarId,
      userId: this.userId,
      name: this.name,
      department: this.department,
      email: this.email
    };
  }
}

module.exports = RegistrarStaff;
