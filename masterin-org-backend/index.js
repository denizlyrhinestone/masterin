require('dotenv').config(); // Load environment variables from .env file at the very top

const express = require('express');
const db = require('./db/database'); // Imports database setup (pool)
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizRoutes');
const careerPathRoutes = require('./routes/careerPathRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const taxonomyRoutes = require('./routes/taxonomyRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Basic root route
app.get('/', (req, res) => {
  res.send('MasterIn.org Backend API is running!');
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/quizzes', quizRoutes); // Prefixed with /api
app.use('/api/career-paths', careerPathRoutes); // Prefixed with /api
app.use('/api/learning-paths', learningPathRoutes); // Prefixed with /api
app.use('/api/marketplace', marketplaceRoutes); // Prefixed with /api
app.use('/api/taxonomy', taxonomyRoutes); // Prefixed with /api

// Global error handler (very basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Attempt to connect to DB and start server
db.pool.connect()
  .then(() => {
    console.log('Successfully connected to the PostgreSQL database via pool.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database. Server not started.', err.stack);
    // Optionally, you might want to exit the process if DB connection is critical
    // process.exit(1);
    // For this exercise, we'll allow the server to start even if DB fails,
    // but log the error. In a real app, behavior might differ.
    // Fallback: Start server even if DB connection fails, but log the error.
    // This is often not recommended for production if DB is essential for most routes.
    console.warn('Attempting to start server without a successful database connection...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (DB connection FAILED)`);
    });
  });
