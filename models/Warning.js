const Database = require('better-sqlite3');
const path = require('path');

// Create database file in your project folder
const db = new Database(path.join(__dirname, '..', 'warnings.db'));

// Create the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    moderatorId TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_user_guild ON warnings(userId, guildId)
`);

// Helper functions
function addWarning(userId, guildId, moderatorId, reason) {
  const stmt = db.prepare(`
    INSERT INTO warnings (userId, guildId, moderatorId, reason) 
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(userId, guildId, moderatorId, reason);
}

function getWarningCount(userId, guildId) {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM warnings 
    WHERE userId = ? AND guildId = ?
  `);
  const result = stmt.get(userId, guildId);
  return result.count;
}

function getWarnings(userId, guildId) {
  const stmt = db.prepare(`
    SELECT * FROM warnings 
    WHERE userId = ? AND guildId = ? 
    ORDER BY timestamp DESC
  `);
  return stmt.all(userId, guildId);
}

function clearWarnings(userId, guildId) {
  const stmt = db.prepare(`
    DELETE FROM warnings 
    WHERE userId = ? AND guildId = ?
  `);
  return stmt.run(userId, guildId);
}

module.exports = {
  addWarning,
  getWarningCount,
  getWarnings,
  clearWarnings,
  db
};