/**
 * Catalog Routes
 * Reference data endpoints for catalogs and courses
 */

const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/catalogs - Get all catalogs
router.get('/', catalogController.getAllCatalogs);

// GET /api/catalogs/:year - Get catalog by year
router.get('/:year', catalogController.getCatalogByYear);

// GET /api/catalogs/:year/requirements - Get requirements for catalog
router.get('/:year/requirements', catalogController.getRequirementsByCatalog);

// GET /api/catalogs/courses - Get all courses
router.get('/courses/all', catalogController.getAllCourses);

// GET /api/catalogs/courses/:code - Get course by code
router.get('/courses/:code', catalogController.getCourseByCode);

module.exports = router;
