/**
 * Transcript Model
 * Stores student course completion records
 */

class Transcript {
  constructor(data) {
    this.transcriptId = data.transcriptId;
    this.studentId = data.studentId;
    this.courseCode = data.courseCode;
    this.semester = data.semester;
    this.grade = data.grade;
    this.creditsEarned = data.creditsEarned;
    this.status = data.status || 'Imported';
    this.importDate = data.importDate || new Date().toISOString();
  }

  toJSON() {
    return {
      transcriptId: this.transcriptId,
      studentId: this.studentId,
      courseCode: this.courseCode,
      semester: this.semester,
      grade: this.grade,
      creditsEarned: this.creditsEarned,
      status: this.status,
      importDate: this.importDate
    };
  }
}

module.exports = Transcript;
