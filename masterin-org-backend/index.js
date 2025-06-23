require('dotenv').config(); // Load environment variables from .env file at the very top

const express = require('express');
const db = require('./db/database'); // Imports database setup (pool)
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizRoutes');
const careerPathRoutes = require('./routes/careerPathRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const taxonomyRoutes = require('./routes/taxonomyRoutes');
const courseRoutes = require('./routes/courseRoutes'); // Student-facing course routes
const courseEditRoutes = require('./routes/courseEditRoutes'); // Educator/Admin course routes
const aiToolsRoutes = require('./routes/aiToolsRoutes'); // AI Tool routes
const userProfileRoutes = require('./routes/userProfileRoutes'); // User profile routes
const adminRoutes = require('./routes/adminRoutes'); // Admin-specific routes

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
// Order might matter if there are overlapping specific paths, but GET / and POST / at root of /api/courses are distinct.
app.use('/api/courses', courseRoutes); // Mount student-facing course routes
app.use('/api/courses', courseEditRoutes); // Mount course editing/authoring routes
app.use('/api/ai', aiToolsRoutes); // Mount AI tool routes
app.use('/api/users', userProfileRoutes); // Mount user profile routes (e.g., for /my-badges)
app.use('/api/admin', adminRoutes); // Mount admin routes

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

// --- SECURITY NOTES ---
// HTTPS:
// In production environments, HTTPS should be strictly enforced to encrypt all data in transit.
// This is typically handled by a reverse proxy (e.g., Nginx, Apache) or by
// cloud provider load balancers and CDN services (e.g., AWS ELB/ALB, Cloudflare).
// Ensure HSTS (HTTP Strict Transport Security) headers are also implemented.

// GDPR/FERPA Compliance (and other relevant data privacy regulations):
// Further review and implementation will be required for full compliance. Key considerations include:
// 1. Data Minimization: Collect only necessary personal data.
// 2. User Consent: Obtain explicit consent for data processing activities, especially for sensitive data.
// 3. Right to Access, Rectification, and Erasure: Implement mechanisms for users to exercise their data rights.
// 4. Data Security: Employ robust security measures to protect sensitive student and user data (at rest and in transit).
//    This includes encryption, access controls, regular security audits.
// 5. Data Processing Agreements: If using third-party services that process user data, ensure DPAs are in place.
// 6. Age Verification & Parental Consent: For users under a certain age (e.g., 13 for COPPA, 16 for GDPR in some cases),
//    parental consent mechanisms may be required.
// 7. Data Retention Policies: Define and implement policies for how long data is stored and when it's deleted.
// 8. Privacy Policy: Maintain a clear and accessible privacy policy.
// This is a non-exhaustive list and requires detailed legal and technical analysis.
