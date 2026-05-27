const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "budget.sqlite");
const db = new sqlite3.Database(dbPath);

const defaultCategories = [
  "Rent",
  "Groceries",
  "Utilities",
  "Car",
  "Insurance",
  "Credit Card",
  "Subscriptions",
  "Shopping",
  "Travel",
  "Healthcare",
  "Other"
];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      expense_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      income_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      vendor TEXT,
      amount REAL,
      category TEXT DEFAULT 'Other',
      due_date TEXT,
      status TEXT NOT NULL CHECK(status IN ('unpaid', 'paid', 'pending')),
      file_path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      document_type TEXT NOT NULL CHECK(document_type IN ('bill', 'invoice', 'receipt')),
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, month)
    )
  `);

  for (const category of defaultCategories) {
    await run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [category]);
  }

  // Lightweight migration for existing local databases created before document categories existed.
  const columns = await all("PRAGMA table_info(documents)");
  if (columns.length && !columns.some((column) => column.name === "category")) {
    await run("ALTER TABLE documents ADD COLUMN category TEXT DEFAULT 'Other'");
  }
}

module.exports = {
  db,
  initializeDatabase,
  run,
  get,
  all
};
