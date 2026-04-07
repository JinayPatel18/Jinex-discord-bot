const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'settings.db'));

// Create settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guildId TEXT PRIMARY KEY,
    welcomeChannel TEXT,
    verifyChannel TEXT,
    logsChannel TEXT,
    rulesChannel TEXT,
    memberRole TEXT,
    unverifiedRole TEXT,
    modRole TEXT,
    adminRole TEXT
  )
`);

function saveSetting(guildId, key, value) {
    const stmt = db.prepare(`
        INSERT INTO guild_settings (guildId, ${key}) 
        VALUES (?, ?)
        ON CONFLICT(guildId) DO UPDATE SET ${key} = excluded.${key}
    `);
    return stmt.run(guildId, value);
}

function getSettings(guildId) {
    const stmt = db.prepare('SELECT * FROM guild_settings WHERE guildId = ?');
    return stmt.get(guildId);
}

module.exports = { saveSetting, getSettings };