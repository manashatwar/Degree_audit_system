/**
 * AtRiskAssessment Model
 * Evaluates student academic risk
 */

class AtRiskAssessment {
  constructor(data) {
    this.assessmentId = data.assessmentId;
    this.studentId = data.studentId;
    this.assessmentDate = data.assessmentDate || new Date().toISOString();
    this.riskIndicators = data.riskIndicators || [];
    this.riskLevel = data.riskLevel || 'Low'; // 'Low', 'Medium', 'High'
    this.deficiencyDetails = data.deficiencyDetails || '';
  }

  toJSON() {
    return {
      assessmentId: this.assessmentId,
      studentId: this.studentId,
      assessmentDate: this.assessmentDate,
      riskIndicators: this.riskIndicators,
      riskLevel: this.riskLevel,
      deficiencyDetails: this.deficiencyDetails
    };
  }
}

module.exports = AtRiskAssessment;
