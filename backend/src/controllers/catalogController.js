/**
 * Catalog Controller
 * Handles catalog and course reference data requests
 */

const storageService = require('../services/storageService');

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
