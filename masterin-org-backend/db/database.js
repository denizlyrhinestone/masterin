require('dotenv').config(); // Load environment variables from .env file

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test query (optional, can be removed in production)
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Error executing query', err.stack);
//   } else {
//     console.log('Query executed successfully:', res.rows[0]);
//   }
// });

// Function to execute the schema.sql file
const executeSchema = async () => {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('Database schema executed successfully.');
  } catch (error) {
    console.error('Error executing database schema:', error.stack);
    // Decide if you want to throw the error or handle it, e.g., exit process
    // For now, just log it. In a real init script, you might want to throw.
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if needed for transactions etc.
  executeSchema, // Export the function
};
