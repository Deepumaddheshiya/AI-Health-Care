/**
 * Rural Healthcare AI Screening Platform - Backend Server
 * Main entry point for the Express application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const csvLoader = require('./services/csvLoader');

// Import routes
const symptomsRouter = require('./routes/symptoms');
const hospitalsRouter = require('./routes/hospitals');
const imagesRouter = require('./routes/images');

const app = express();

// ================================
// MIDDLEWARE CONFIGURATION
// ================================

// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ================================
// API ROUTES
// ================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Rural Healthcare AI Backend is running',
    timestamp: new Date().toISOString(),
    hospitalsLoaded: csvLoader.getHospitalCount()
  });
});

// API routes
app.use('/api', symptomsRouter);
app.use('/api', hospitalsRouter);
app.use('/api', imagesRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Rural Healthcare AI Screening Platform API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      analyzeSymptoms: 'POST /api/analyze-symptoms',
      nearestHospitals: 'POST /api/nearest-hospitals',
      analyzeImage: 'POST /api/analyze-image'
    }
  });
});

// ================================
// ERROR HANDLING
// ================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ================================
// SERVER INITIALIZATION
// ================================

const startServer = async () => {
  try {
    console.log('=================================');
    console.log('Starting Rural Healthcare AI Backend...');
    console.log('=================================\n');

    // Start Express server
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
      console.log(`🏥 Hospital data: Ready`);
      console.log(`🤖 Gemini API: ${config.GEMINI_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
      console.log('=================================\n');
      console.log(`Access the API at: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health\n`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Background load data
csvLoader.loadHospitals().catch(err => console.error('Initial data load failed:', err));

// Start the server if not running in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
