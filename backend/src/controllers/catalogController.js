/**
 * Catalog Controller
 * Handles catalog and course reference data requests
 */

const storageService = require('../services/storageService');
const Catalog = require('../models/Catalog');
const Requirement = require('../models/Requirement');

class CatalogController {
  async getAllCatalogs(req, res, next) {
    try {
      const catalogs = storageService.findAll('catalogs');

      res.json({
        success: true,
        data: catalogs
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/catalogs - Create a new catalog
  async createCatalog(req, res, next) {
    try {
      const { catalogId, catalogYear, program, department, effectiveDate, totalCreditsRequired } = req.body;

      if (!catalogYear || !department || !program) {
        return res.status(400).json({
          success: false,
          message: 'catalogYear, department, and program are required'
        });
      }

      const cleanYear = String(catalogYear).trim();
      const cleanDept = String(department).trim().toUpperCase();
      const cleanProgram = String(program).trim();
      const finalId = catalogId && catalogId.trim()
        ? catalogId.trim()
        : `CAT-${cleanYear}-${cleanDept}`;

      const existing = storageService.findCatalogById(finalId);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Catalog with ID '${finalId}' already exists`
        });
      }

      const catalog = new Catalog({
        catalogId: finalId,
        catalogYear: cleanYear,
        program: cleanProgram,
        department: cleanDept,
        effectiveDate: effectiveDate || `${cleanYear}-08-01`,
        totalCreditsRequired: Number(totalCreditsRequired) || 160
      });

      storageService.create('catalogs', catalog.toJSON());

      res.status(201).json({
        success: true,
        message: 'Catalog created successfully',
        data: catalog.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async getCatalogByYear(req, res, next) {
    try {
      const { year } = req.params;

      const catalog = storageService.findCatalogByYear(year);

      if (!catalog) {
        return res.status(404).json({
          success: false,
          message: 'Catalog not found for year ' + year
        });
      }

      res.json({
        success: true,
        data: catalog
      });
    } catch (error) {
      next(error);
    }
  }

  async getRequirementsByCatalog(req, res, next) {
    try {
      const { year } = req.params;

      const catalog = storageService.findCatalogByYear(year);

      if (!catalog) {
        return res.status(404).json({
          success: false,
          message: 'Catalog not found for year ' + year
        });
      }

      const requirements = storageService.findRequirementsByCatalogId(catalog.catalogId);

      res.json({
        success: true,
        data: requirements
      });
    } catch (error) {
      next(error);
    }
  }

  // NEW: GET /api/catalogs/:catalogId/requirements
  async getRequirementsByCatalogId(req, res, next) {
    try {
      const { catalogId } = req.params;

      const catalog = storageService.findCatalogById(catalogId);

      if (!catalog) {
        return res.status(404).json({
          success: false,
          message: 'Catalog not found: ' + catalogId
        });
      }

      const requirements = storageService.findRequirementsByCatalogId(catalogId);

      res.json({
        success: true,
        data: requirements
      });
    } catch (error) {
      next(error);
    }
  }

  // NEW: PUT /api/catalogs/:catalogId/requirements/:requirementId
  async updateRequirement(req, res, next) {
    try {
      const { catalogId, requirementId } = req.params;
      const { minimumCredits, description, courseList } = req.body;

      const catalog = storageService.findCatalogById(catalogId);
      if (!catalog) {
        return res.status(404).json({
          success: false,
          message: 'Catalog not found: ' + catalogId
        });
      }

      const existing = storageService.findById('requirements', 'requirementId', requirementId);
      if (!existing || existing.catalogId !== catalogId) {
        return res.status(404).json({
          success: false,
          message: 'Requirement not found'
        });
      }

      const updateData = {};
      if (minimumCredits !== undefined) updateData.minimumCredits = Number(minimumCredits);
      if (description !== undefined) updateData.description = description;
      if (courseList !== undefined) updateData.courseList = courseList;

      const updated = storageService.update('requirements', 'requirementId', requirementId, updateData);

      res.json({
        success: true,
        message: 'Requirement updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // NEW: POST /api/catalogs/:catalogId/requirements
  async addRequirement(req, res, next) {
    try {
      const { catalogId } = req.params;
      const { category, description, minimumCredits, minimumGPA, courseList, rules } = req.body;

      const catalog = storageService.findCatalogById(catalogId);
      if (!catalog) {
        return res.status(404).json({
          success: false,
          message: 'Catalog not found: ' + catalogId
        });
      }

      if (!category || minimumCredits === undefined) {
        return res.status(400).json({
          success: false,
          message: 'category and minimumCredits are required'
        });
      }

      const requirementId = 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

      const requirement = new Requirement({
        requirementId,
        catalogId,
        category,
        description: description || '',
        minimumCredits: Number(minimumCredits),
        minimumGPA: minimumGPA || 6.0,
        courseList: courseList || [],
        rules: rules || ''
      });

      storageService.create('requirements', requirement.toJSON());

      res.status(201).json({
        success: true,
        message: 'Requirement added successfully',
        data: requirement.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req, res, next) {
    try {
      const courses = storageService.findAll('courses');

      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourseByCode(req, res, next) {
    try {
      const { code } = req.params;

      const course = storageService.findById('courses', 'courseCode', code);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CatalogController();
