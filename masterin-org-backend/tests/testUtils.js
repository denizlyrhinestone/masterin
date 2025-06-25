// tests/testUtils.js
const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');

// Read the schema SQL file. Adjust path if your directory structure is different.
// Assuming this file is in <project_root>/tests/ and schema.sql is in <project_root>/sql/
const schemaSqlPath = path.join(__dirname, '..', 'sql', 'schema.sql');
const schemaSql = fs.readFileSync(schemaSqlPath).toString();

function createTestDb() {
  const db = newDb(); // Create a new in-memory database instance

  // Suppress pg-mem's own console output during schema loading if it's noisy
  // This can be done by temporarily overriding console.log/error or using pg-mem's logging options if available.
  // For simplicity, we'll allow its default logging for now. If it becomes an issue, we can add suppression.
  // Example of suppression:
  // const originalLog = console.log;
  // console.log = jest.fn(); // Or any other mock function

  try {
    db.public.none(schemaSql); // Load the entire schema
  } catch (e) {
    console.error("Error loading schema into pg-mem in createTestDb:", e);
    // If schema loading fails, tests will likely fail, this helps debug.
    throw e; // Re-throw to make it clear that setup failed
  }

  // console.log = originalLog; // Restore if suppressed

  // Create a mock pool that provides pg-mem's client adapter
  const mockPool = {
    connect: async () => {
      // Each 'connect' call should ideally give a fresh connection adapter
      // that operates within its own transaction context if needed by tests.
      // pg-mem's default client from createPg() usually works fine for individual queries.
      // For transaction tests (BEGIN/COMMIT/ROLLBACK), ensure the client supports it.
      const client = db.adapters.createPg().connect();
      // client.on('error', err => console.error('pg-mem client error:', err)); // Optional: Log client errors
      return client;
    },
    // If some parts of your code use pool.query directly:
    query: (sql, params) => {
        // This basic query might not handle transactions automatically like a real pool client.
        // Prefer using client.query from a connect() call for test consistency.
        return db.public.query(sql, params);
    }
  };

  return {
    db,       // The main pg-mem instance (for direct manipulation or inspection if needed)
    mockPool  // The mock pool to be used by services that expect a pool.connect()
  };
}

module.exports = { createTestDb };
