/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// POST /api/auth/login - User login
router.post('/login', authController.login);

// GET /api/auth/me - Get current user
router.get('/me', auth, authController.getCurrentUser);

// POST /api/auth/logout - User logout
router.post('/logout', auth, authController.logout);

module.exports = router;
