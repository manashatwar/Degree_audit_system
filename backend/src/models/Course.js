/**
 * Course Model
 * Represents academic courses in the catalog
 */

class Course {
  constructor(data) {
    this.courseCode = data.courseCode;
    this.courseName = data.courseName;
    this.department = data.department;
    this.credits = data.credits;
    this.courseType = data.courseType; // 'Core', 'Elective', 'Open Elective', 'Lab', 'Project'
    this.prerequisites = data.prerequisites || [];
    this.suggestedSemester = data.suggestedSemester || null; // Recommended semester to take this course
  }

  toJSON() {
    return {
      courseCode: this.courseCode,
      courseName: this.courseName,
      department: this.department,
      credits: this.credits,
      courseType: this.courseType,
      prerequisites: this.prerequisites,
      suggestedSemester: this.suggestedSemester
    };
  }
}

module.exports = Course;
