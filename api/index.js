/**
 * Vercel Serverless Function Entry Point
 * Wraps the Express app for Vercel deployment
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('../backend/src/routes/authRoutes');
const studentRoutes = require('../backend/src/routes/studentRoutes');
const advisorRoutes = require('../backend/src/routes/advisorRoutes');
const registrarRoutes = require('../backend/src/routes/registrarRoutes');
const catalogRoutes = require('../backend/src/routes/catalogRoutes');
const assignmentRoutes = require('../backend/src/routes/assignmentRoutes');

// Import middleware
const errorHandler = require('../backend/src/middleware/errorHandler');

// Import seed data
const { seedDatabase } = require('../backend/src/data/seedData');

// Initialize express app
const app = express();

// CORS - allow all origins for Vercel deployment
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LNMIIT Degree Audit System API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/registrar', registrarRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/assignments', assignmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize seed data once (in-memory, serverless-compatible)
let seeded = false;
const originalApp = app;

module.exports = async (req, res) => {
  if (!seeded) {
    try {
      await seedDatabase();
      seeded = true;
    } catch (err) {
      console.error('Seed error:', err);
    }
  }
  return originalApp(req, res);
};
