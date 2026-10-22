/**
 * Import Service
 * Handles transcript import workflow (UC-006)
 */

const storageService = require('./storageService');
const auditService = require('./auditService');
const { v4: uuidv4 } = require('uuid');
const Transcript = require('../models/Transcript');
const TranscriptImport = require('../models/TranscriptImport');

class ImportService {
  // Convert letter grade to grade point
  getGradePoint(grade) {
    // If already a number, return it
    if (typeof grade === 'number') return grade;
    
    // LNMIIT letter grade mapping
    const gradeMap = {
      'A': 10, 'AB': 9, 'B': 8, 'BC': 7,
      'C': 6, 'CD': 5, 'D': 4, 'F': 0
    };
    
    const upperGrade = String(grade).toUpperCase();
    return gradeMap[upperGrade] !== undefined ? gradeMap[upperGrade] : null;
  }

  // Check if grade is valid (letter or number)
  isValidGrade(grade) {
    if (typeof grade === 'number') {
      return grade >= 0 && grade <= 10;
    }
    
    const validGrades = ['A', 'AB', 'B', 'BC', 'C', 'CD', 'D', 'F'];
    return validGrades.includes(String(grade).toUpperCase());
  }

  validateRecord(record, index) {
    const errors = [];

    // Validate required fields
    if (!record.studentId) {
      errors.push(`Row ${index + 1}: Student ID is required`);
    }
    if (!record.courseCode) {
      errors.push(`Row ${index + 1}: Course code is required`);
    }
    if (!record.semester) {
      errors.push(`Row ${index + 1}: Semester is required`);
    }
    if (record.grade === undefined || record.grade === null || record.grade === '') {
      errors.push(`Row ${index + 1}: Grade is required`);
    }
    if (!record.credits) {
      errors.push(`Row ${index + 1}: Credits is required`);
    }

    // Validate student exists
    if (record.studentId) {
      const student = storageService.findById('students', 'studentId', record.studentId);
      if (!student) {
        errors.push(`Row ${index + 1}: Student ${record.studentId} not found in system`);
      }
    }

    // Validate course exists
    if (record.courseCode) {
      const course = storageService.findById('courses', 'courseCode', record.courseCode);
      if (!course) {
        errors.push(`Row ${index + 1}: Course ${record.courseCode} not found in catalog`);
      }
    }

    // Validate grade is valid letter grade or numeric (0-10)
    if (record.grade !== undefined && record.grade !== null && record.grade !== '') {
      if (!this.isValidGrade(record.grade)) {
        errors.push(`Row ${index + 1}: Grade must be a valid letter grade (A, AB, B, BC, C, CD, D, F) or numeric (0-10)`);
      }
    }

    // Validate credits are positive
    if (record.credits && record.credits <= 0) {
      errors.push(`Row ${index + 1}: Credits must be positive`);
    }

    return errors;
  }

  validateImportData(records) {
    const validationErrors = [];
    const validRecords = [];
    const invalidRecords = [];

    records.forEach((record, index) => {
      const errors = this.validateRecord(record, index);
      
      if (errors.length > 0) {
        invalidRecords.push({
          rowNumber: index + 1,
          record: record,
          errors: errors
        });
        validationErrors.push(...errors);
      } else {
        validRecords.push({
          rowNumber: index + 1,
          record: record
        });
      }
    });

    return {
      totalRecords: records.length,
      validCount: validRecords.length,
      invalidCount: invalidRecords.length,
      validRecords: validRecords,
      invalidRecords: invalidRecords,
      errors: validationErrors
    };
  }

  executeImport(validRecords) {
    const importedTranscripts = [];
    const affectedStudents = new Set();

    console.log('Executing import with records:', validRecords);

    validRecords.forEach((record, index) => {
      // Validate record has required fields
      if (!record || !record.studentId || !record.courseCode) {
        console.error(`Skipping invalid record at index ${index}:`, record);
        return;
      }

      // Get course details to determine actual credits
      const course = storageService.findById('courses', 'courseCode', record.courseCode);
      const actualCredits = course ? course.credits : record.credits;

      // Convert grade to grade point to determine if passing
      const gradePoint = this.getGradePoint(record.grade);
      
      // Determine credits earned based on grade point (passing grade is D = 4.0)
      const creditsEarned = gradePoint >= 4.0 ? actualCredits : 0;

      const transcript = new Transcript({
        transcriptId: uuidv4(),
        studentId: record.studentId,
        courseCode: record.courseCode,
        semester: record.semester,
        grade: record.grade, // Store as letter grade or number
        creditsEarned: creditsEarned,
        status: 'Imported',
        importDate: new Date().toISOString()
      });

      storageService.create('transcripts', transcript);
      importedTranscripts.push(transcript);
      affectedStudents.add(record.studentId);
      console.log(`✓ Imported transcript for ${record.studentId} - ${record.courseCode}`);
    });

    // Trigger audit recalculation for affected students
    affectedStudents.forEach(studentId => {
      try {
        auditService.generateAudit(studentId);
        console.log(`✓ Regenerated audit for student ${studentId}`);
      } catch (error) {
        console.error(`✗ Failed to recalculate audit for student ${studentId}:`, error.message);
      }
    });

    return {
      importedCount: importedTranscripts.length,
      affectedStudentsCount: affectedStudents.size,
      transcripts: importedTranscripts
    };
  }

  createImportRecord(fileName, fileFormat, validationResult) {
    const importRecord = new TranscriptImport({
      importId: uuidv4(),
      fileName: fileName,
      fileFormat: fileFormat,
      importDate: new Date().toISOString(),
      recordsImported: 0,
      errorCount: validationResult.invalidCount,
      status: validationResult.invalidCount > 0 ? 'Validated' : 'Draft',
      validationErrors: validationResult.errors
    });

    storageService.create('transcriptImports', importRecord);
    return importRecord;
  }

  completeImport(importId, importResult) {
    const importRecord = storageService.findById('transcriptImports', 'importId', importId);
    
    if (importRecord) {
      storageService.update('transcriptImports', 'importId', importId, {
        recordsImported: importResult.importedCount,
        status: 'Completed'
      });
    }

    return {
      importId: importId,
      status: 'Completed',
      recordsImported: importResult.importedCount,
      affectedStudents: importResult.affectedStudentsCount
    };
  }
}

module.exports = new ImportService();
