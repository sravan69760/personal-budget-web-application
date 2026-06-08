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
      credit_card_id INTEGER,
      bank_account_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS credit_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      card_type TEXT NOT NULL,
      credit_limit REAL NOT NULL DEFAULT 0,
      current_balance REAL NOT NULL DEFAULT 0,
      total_paid REAL NOT NULL DEFAULT 0,
      available_credit REAL NOT NULL DEFAULT 0,
      due_date TEXT,
      payment_status TEXT NOT NULL CHECK(payment_status IN ('unpaid', 'partial', 'paid')) DEFAULT 'unpaid',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS credit_card_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credit_card_id INTEGER NOT NULL,
      payment_amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      debit_card_name TEXT,
      current_balance REAL NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      available_balance REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  const expenseColumns = await all("PRAGMA table_info(expenses)");
  if (expenseColumns.length && !expenseColumns.some((column) => column.name === "credit_card_id")) {
    await run("ALTER TABLE expenses ADD COLUMN credit_card_id INTEGER");
  }
  if (expenseColumns.length && !expenseColumns.some((column) => column.name === "bank_account_id")) {
    await run("ALTER TABLE expenses ADD COLUMN bank_account_id INTEGER");
  }
}

module.exports = {
  db,
  initializeDatabase,
  run,
  get,
  all
};
