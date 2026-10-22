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

// Seed the database once at startup — store as a promise so all requests
// wait for it to finish before processing (critical for Vercel serverless).
const seedReady = seedDatabase()
  .then(() => {
    console.log('\n=== LNMIIT Degree Audit System API ===');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Started at: ${new Date().toLocaleString()}`);
    console.log('\nTest Credentials:');
    console.log('  Student: 24ucs101@lnmiit.ac.in / password123');
    console.log('  Advisor: dr.sharma@lnmiit.ac.in / password123');
    console.log('  Registrar: registrar@lnmiit.ac.in / password123');
    console.log('\n======================================\n');
  })
  .catch(err => {
    console.error('Failed to seed database:', err);
  });

// Middleware to wait for seed before processing any API request
app.use(async (req, res, next) => {
  await seedReady;
  next();
});

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

// Start server (for local dev / traditional hosting)
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Only listen when run directly (not when imported as a module by Vercel)
  const server = app.listen(PORT, () => {
    console.log(`\n=== LNMIIT Degree Audit System API ===`);
    console.log(`Server running on port ${PORT}`);
    console.log(`\n======================================\n`);
  });
}

module.exports = app;

