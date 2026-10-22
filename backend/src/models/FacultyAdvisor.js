/**
 * FacultyAdvisor Model
 * Represents a faculty member who advises students
 */

class FacultyAdvisor {
  constructor(data) {
    this.advisorId = data.advisorId;
    this.userId = data.userId;
    this.name = data.name;
    this.department = data.department;
    this.email = data.email;
  }

  toJSON() {
    return {
      advisorId: this.advisorId,
      userId: this.userId,
      name: this.name,
      department: this.department,
      email: this.email
    };
  }
}

module.exports = FacultyAdvisor;
