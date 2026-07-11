const db = require("./db");

// CREATE USERS TABLE (safe if already exists)
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  email TEXT,
  password_hash TEXT
)
`).run();

// CREATE RESULTS TABLE (THIS WAS MISSING ❌)
db.prepare(`
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT,
  points INTEGER,
  name TEXT,
  emoji TEXT,
  weight TEXT,
  date TEXT,
  created_at TEXT
)
`).run();

// demo user
db.prepare(`
  INSERT OR IGNORE INTO users (id, username, email, password_hash)
  VALUES (1, 'demo', 'demo@example.com', 'hashed_pw')
`).run();

console.log("✅ DB seeded successfully (users + results ready)");