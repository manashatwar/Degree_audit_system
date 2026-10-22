/**
 * Requirement Model
 * Defines specific degree requirements
 */

class Requirement {
  constructor(data) {
    this.requirementId = data.requirementId;
    this.catalogId = data.catalogId;
    this.category = data.category; // 'Core Courses', 'Electives', etc.
    this.description = data.description;
    this.minimumCredits = data.minimumCredits;
    this.minimumGPA = data.minimumGPA || 6.0;
    this.courseList = data.courseList || [];
    this.rules = data.rules || '';
  }

  toJSON() {
    return {
      requirementId: this.requirementId,
      catalogId: this.catalogId,
      category: this.category,
      description: this.description,
      minimumCredits: this.minimumCredits,
      minimumGPA: this.minimumGPA,
      courseList: this.courseList,
      rules: this.rules
    };
  }
}

module.exports = Requirement;
