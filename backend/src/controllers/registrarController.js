/**
 * Registrar Controller
 * Handles registrar-related HTTP requests (UC-006: Import Student Transcripts)
 */

const importService = require('../services/importService');
const storageService = require('../services/storageService');

class RegistrarController {
  async validateImport(req, res, next) {
    try {
      const { fileName, fileFormat, records } = req.body;

      if (!records || !Array.isArray(records)) {
        return res.status(400).json({
          success: false,
          message: 'Records array is required'
        });
      }

      // Validate the import data
      const validationResult = importService.validateImportData(records);

      // Create import record
      const importRecord = importService.createImportRecord(fileName, fileFormat, validationResult);

      res.json({
        success: true,
        message: 'Validation completed',
        data: {
          importId: importRecord.importId,
          validation: validationResult
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async previewImport(req, res, next) {
    try {
      const { records } = req.body;

      if (!records || !Array.isArray(records)) {
        return res.status(400).json({
          success: false,
          message: 'Records array is required'
        });
      }

      const validationResult = importService.validateImportData(records);

      res.json({
        success: true,
        data: validationResult
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmImport(req, res, next) {
    try {
      const { importId, validRecords } = req.body;

      if (!validRecords || !Array.isArray(validRecords)) {
        return res.status(400).json({
          success: false,
          message: 'Valid records array is required'
        });
      }

      // Execute import
      const importResult = importService.executeImport(validRecords);

      // Update import record
      const summary = importService.completeImport(importId, importResult);

      res.json({
        success: true,
        message: 'Import completed successfully',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getImportStatus(req, res, next) {
    try {
      const { id } = req.params;

      const importRecord = storageService.findById('transcriptImports', 'importId', id);

      if (!importRecord) {
        return res.status(404).json({
          success: false,
          message: 'Import record not found'
        });
      }

      res.json({
        success: true,
        data: importRecord
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RegistrarController();
