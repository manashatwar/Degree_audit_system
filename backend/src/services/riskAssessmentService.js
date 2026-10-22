/**
 * Risk Assessment Service
 * Handles at-risk student evaluation logic (UC-005)
 */

const storageService = require('./storageService');
const auditService = require('./auditService');
const { v4: uuidv4 } = require('uuid');
const AtRiskAssessment = require('../models/AtRiskAssessment');

class RiskAssessmentService {
  evaluateStudent(studentId) {
    const student = storageService.findById('students', 'studentId', studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Get audit for the student
    const audit = auditService.getLatestAudit(studentId);
    
    // Get transcripts
    const transcripts = storageService.findTranscriptsByStudentId(studentId);

    const riskIndicators = [];
    let riskScore = 0;

    // Criterion 1: CGPA below 6.0
    if (audit.CGPA < 6.0) {
      riskIndicators.push('Low CGPA (below 6.0)');
      riskScore += 3;
    }

    // Criterion 2: Credit deficiency > 6 credits
    const expectedCredits = student.currentSemester * 20; // Assuming 20 credits per semester
    const creditDeficiency = expectedCredits - audit.totalCreditsEarned;
    if (creditDeficiency > 6) {
      riskIndicators.push(`Credit Deficiency (${creditDeficiency} credits behind)`);
      riskScore += 2;
    }

    // Criterion 3: Missing required courses for current semester level
    const missingCoreCount = audit.categoryProgress
      .filter(cat => cat.category === 'Core Courses' && cat.status !== 'Satisfied')
      .length;
    if (missingCoreCount > 0) {
      riskIndicators.push('Missing required core courses');
      riskScore += 2;
    }

    // Criterion 4: No courses completed in previous semester
    // Check for recent activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentTranscripts = transcripts.filter(t => 
      new Date(t.importDate) > sixMonthsAgo
    );
    
    if (recentTranscripts.length === 0 && transcripts.length > 0) {
      riskIndicators.push('No recent academic activity');
      riskScore += 3;
    }

    // Determine risk level
    let riskLevel = 'Low';
    if (riskScore >= 5) {
      riskLevel = 'High';
    } else if (riskScore >= 3) {
      riskLevel = 'Medium';
    }

    const assessment = new AtRiskAssessment({
      assessmentId: uuidv4(),
      studentId: studentId,
      assessmentDate: new Date().toISOString(),
      riskIndicators: riskIndicators,
      riskLevel: riskLevel,
      deficiencyDetails: `Total Risk Score: ${riskScore}. ${riskIndicators.join('; ')}`
    });

    return {
      ...assessment,
      student: student,
      audit: {
        CGPA: audit.CGPA,
        totalCreditsEarned: audit.totalCreditsEarned,
        graduationEligible: audit.graduationEligible
      },
      isAtRisk: riskIndicators.length > 0
    };
  }

  identifyAtRiskStudents(advisorId) {
    // Get all advisees
    const advisees = storageService.findAdviseesByAdvisorId(advisorId);

    if (!advisees || advisees.length === 0) {
      return [];
    }

    // Evaluate each student
    const assessments = advisees
      .map(student => this.evaluateStudent(student.studentId))
      .filter(assessment => assessment.isAtRisk);

    // Sort by risk severity (High > Medium > Low) and then by risk score
    const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    assessments.sort((a, b) => {
      const levelDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      if (levelDiff !== 0) return levelDiff;
      return b.riskIndicators.length - a.riskIndicators.length;
    });

    return assessments;
  }
}

module.exports = new RiskAssessmentService();
