const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database file path
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '..', '..', 'glico_survey.db');

// Initialize database
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

console.log('✅ Connected to SQLite database:', dbPath);

// Helper function to run queries
const query = (text, params = []) => {
  try {
    const stmt = db.prepare(text);
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      return { rows: stmt.all(params) };
    } else {
      const result = stmt.run(params);
      return { rows: [{ ...result }] };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client (for compatibility with existing code)
const getClient = () => {
  return {
    query: (text, params = []) => Promise.resolve(query(text, params)),
    release: () => Promise.resolve()
  };
};

// Helper function to run transactions
const transaction = (callback) => {
  return db.transaction(callback)();
};

module.exports = {
  query,
  getClient,
  transaction,
  db
}; 