/**
 * Catalog Model
 * Defines degree requirements for a specific catalog year
 */

class Catalog {
  constructor(data) {
    this.catalogId = data.catalogId;
    this.catalogYear = data.catalogYear;
    this.program = data.program;
    this.department = data.department;
    this.effectiveDate = data.effectiveDate;
    this.totalCreditsRequired = data.totalCreditsRequired || 160;
  }

  toJSON() {
    return {
      catalogId: this.catalogId,
      catalogYear: this.catalogYear,
      program: this.program,
      department: this.department,
      effectiveDate: this.effectiveDate,
      totalCreditsRequired: this.totalCreditsRequired
    };
  }
}

module.exports = Catalog;
