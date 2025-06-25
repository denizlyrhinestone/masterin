// tests/integration/dbMockSetup.js
const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');

// Read schema - adjust path if your test file structure is different
const schemaSqlPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
const schemaSql = fs.readFileSync(schemaSqlPath).toString();

function setupMockDb() {
  const db = newDb(); // Creates a new, isolated pg-mem instance

  // Suppress console output from schema loading if it's noisy
  // const originalLog = console.log;
  // const originalError = console.error;
  // console.log = jest.fn();
  // console.error = jest.fn();

  db.public.none(schemaSql); // Load your schema into the public schema

  // console.log = originalLog;
  // console.error = originalError;

  // Return the pg-mem instance. Test files will use this to mock the actual db pool.
  return db;
}

module.exports = { setupMockDb };
