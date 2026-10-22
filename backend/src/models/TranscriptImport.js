/**
 * TranscriptImport Model
 * Manages transcript file import workflow
 */

class TranscriptImport {
  constructor(data) {
    this.importId = data.importId;
    this.fileName = data.fileName;
    this.fileFormat = data.fileFormat; // 'CSV', 'Excel'
    this.importDate = data.importDate || new Date().toISOString();
    this.recordsImported = data.recordsImported || 0;
    this.errorCount = data.errorCount || 0;
    this.status = data.status || 'Draft'; // 'Draft', 'Validated', 'Completed', 'Rejected'
    this.validationErrors = data.validationErrors || [];
  }

  toJSON() {
    return {
      importId: this.importId,
      fileName: this.fileName,
      fileFormat: this.fileFormat,
      importDate: this.importDate,
      recordsImported: this.recordsImported,
      errorCount: this.errorCount,
      status: this.status,
      validationErrors: this.validationErrors
    };
  }
}

module.exports = TranscriptImport;
