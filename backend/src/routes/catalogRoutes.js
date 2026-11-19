/**
 * Catalog Routes
 * Reference data endpoints for catalogs and courses
 */

const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/catalogs - Get all catalogs
router.get('/', catalogController.getAllCatalogs);

// POST /api/catalogs - Create a new catalog
router.post('/', authorize('RegistrarStaff'), catalogController.createCatalog);

// GET /api/catalogs/courses/all - Get all courses (must be before /:year)
router.get('/courses/all', catalogController.getAllCourses);

// GET /api/catalogs/courses/:code - Get course by code
router.get('/courses/:code', catalogController.getCourseByCode);

// GET /api/catalogs/:catalogId/requirements - Get requirements by catalogId
router.get('/:catalogId/requirements', catalogController.getRequirementsByCatalogId);

// PUT /api/catalogs/:catalogId/requirements/:requirementId - Update a requirement
router.put('/:catalogId/requirements/:requirementId', authorize('RegistrarStaff'), catalogController.updateRequirement);

// POST /api/catalogs/:catalogId/requirements - Add a new requirement
router.post('/:catalogId/requirements', authorize('RegistrarStaff'), catalogController.addRequirement);

// GET /api/catalogs/:year - Get catalog by year (kept for backward compat)
router.get('/:year', catalogController.getCatalogByYear);

module.exports = router;
