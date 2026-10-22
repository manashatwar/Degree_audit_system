/**
 * Student Model
 * Represents a student enrolled at LNMIIT
 */

class Student {
  constructor(data) {
    this.studentId = data.studentId;
    this.userId = data.userId;
    this.name = data.name;
    this.email = data.email; // Store email for department detection
    
    // Auto-extract batch year from student ID or email
    this.batchYear = data.batchYear || Student.extractBatchYear(data.studentId, data.email);
    
    // Set catalog year (usually same as batch year or provided)
    this.catalogYear = data.catalogYear || String(this.batchYear);
    
    this.currentSemester = data.currentSemester;
    this.status = data.status || 'Active';
    
    // Auto-detect department and program if not explicitly provided
    if (!data.department || !data.program) {
      const detected = Student.detectDepartmentAndProgram(data.studentId, data.email);
      this.department = data.department || detected.department;
      this.program = data.program || detected.program; // Will be "B.Tech CSE", "B.Tech CCE", etc.
    } else {
      this.department = data.department;
      this.program = data.program;
    }
  }

  /**
   * Static method to extract batch year from student ID or email
   * Examples:
   * - 24ucc175 → 2024
   * - 23ucs048 → 2023
   * - 22uec091@lnmiit.ac.in → 2022
   */
  static extractBatchYear(studentId, email) {
    let yearCode = '';
    
    // Try to extract from studentId first
    if (studentId) {
      const match = studentId.toLowerCase().match(/^(\d{2})u/);
      if (match) {
        yearCode = match[1];
      }
    }
    
    // If not found, try email
    if (!yearCode && email) {
      const match = email.toLowerCase().match(/^(\d{2})u/);
      if (match) {
        yearCode = match[1];
      }
    }
    
    // Convert 2-digit year to 4-digit year (20XX or 19XX)
    if (yearCode) {
      const year = parseInt(yearCode);
      // Assuming years 00-50 are 2000-2050, and 51-99 are 1951-1999
      return year <= 50 ? 2000 + year : 1900 + year;
    }
    
    return new Date().getFullYear(); // Default to current year
  }

  /**
   * Static method to detect department from student ID or email
   * Examples:
   * - 24ucc175 → CCE (Computer and Communication Engineering)
   * - 24ucs123 → CSE (Computer Science Engineering)
   * - 23uec048@lnmiit.ac.in → ECE (Electronics and Communication Engineering)
   * - 24ume045 → ME (Mechanical Engineering)
   */
  static detectDepartmentAndProgram(studentId, email) {
    let deptCode = '';
    
    // Try to extract from studentId first
    if (studentId) {
      const match = studentId.toLowerCase().match(/\d{2}u([a-z]{2,3})\d+/);
      if (match) {
        deptCode = match[1];
      }
    }
    
    // If not found, try email
    if (!deptCode && email) {
      const match = email.toLowerCase().match(/\d{2}u([a-z]{2,3})\d+@/);
      if (match) {
        deptCode = match[1];
      }
    }
    
    // Map department codes to full names and programs
    const deptMap = {
      'cc': { department: 'CCE', program: 'B.Tech CCE', fullName: 'Computer and Communication Engineering' },
      'cs': { department: 'CSE', program: 'B.Tech CSE', fullName: 'Computer Science Engineering' },
      'ec': { department: 'ECE', program: 'B.Tech ECE', fullName: 'Electronics and Communication Engineering' },
      'me': { department: 'ME', program: 'B.Tech ME', fullName: 'Mechanical Engineering' },
      'ee': { department: 'EE', program: 'B.Tech EE', fullName: 'Electrical Engineering' }
    };
    
    const detected = deptMap[deptCode] || { 
      department: 'UNKNOWN', 
      program: 'B.Tech', 
      fullName: 'Unknown Department' 
    };
    
    return detected;
  }

  toJSON() {
    return {
      studentId: this.studentId,
      userId: this.userId,
      name: this.name,
      email: this.email,
      program: this.program,
      department: this.department,
      batchYear: this.batchYear,
      catalogYear: this.catalogYear,
      currentSemester: this.currentSemester,
      status: this.status
    };
  }
}

module.exports = Student;
