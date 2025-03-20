const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/budget.db');
const db = new Database(dbPath, { verbose: console.log });

// Create Envelopes Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS envelopes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    budget REAL NOT NULL
  )
`).run();

// Create Transactions Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    envelope_id INTEGER,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(envelope_id) REFERENCES envelopes(id)
  )
`).run();

// Optional: Create Users Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`).run();

module.exports = db;