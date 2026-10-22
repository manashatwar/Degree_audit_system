/**
 * LNMIIT Degree Audit System - Backend Server
 * Team T030
 * Main server entry point
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const advisorRoutes = require('./src/routes/advisorRoutes');
const registrarRoutes = require('./src/routes/registrarRoutes');
const catalogRoutes = require('./src/routes/catalogRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Import seed data
const { seedDatabase } = require('./src/data/seedData');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
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

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database with seed data
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n=== LNMIIT Degree Audit System API ===`);
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Started at: ${new Date().toLocaleString()}`);
      console.log(`\nAPI Endpoints:`);
      console.log(`  - POST http://localhost:${PORT}/api/auth/login`);
      console.log(`  - GET  http://localhost:${PORT}/api/students/:id/audit`);
      console.log(`  - GET  http://localhost:${PORT}/api/advisors/:id/at-risk`);
      console.log(`  - POST http://localhost:${PORT}/api/registrar/import/validate`);
      console.log(`\nTest Credentials:`);
      console.log(`  Student: 24ucs101@lnmiit.ac.in / password123`);
      console.log(`  Advisor: dr.sharma@lnmiit.ac.in / password123`);
      console.log(`  Registrar: registrar@lnmiit.ac.in / password123`);
      console.log(`\n======================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
