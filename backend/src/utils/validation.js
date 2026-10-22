/**
 * Validation Utilities
 * Common validation functions
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateGrade = (grade) => {
  return typeof grade === 'number' && grade >= 0 && grade <= 10;
};

const validateCredits = (credits) => {
  return typeof credits === 'number' && credits > 0;
};

const validateStudentId = (studentId) => {
  return studentId && studentId.toString().length > 0;
};

const validateCourseCode = (courseCode) => {
  return courseCode && courseCode.toString().length > 0;
};

const validateSemester = (semester) => {
  const semesterRegex = /(Fall|Spring|Summer)\s\d{4}/;
  return semesterRegex.test(semester);
};

module.exports = {
  validateEmail,
  validateGrade,
  validateCredits,
  validateStudentId,
  validateCourseCode,
  validateSemester
};
