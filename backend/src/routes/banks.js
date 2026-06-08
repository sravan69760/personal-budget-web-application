const express = require("express");
const { all, get, run } = require("../db");
const { recalculateBankAccount } = require("../bankMath");

const router = express.Router();

const accountTypes = ["Checking", "Savings", "Debit Card", "Other"];

router.get("/", async (req, res, next) => {
  try {
    const accounts = await all("SELECT * FROM bank_accounts ORDER BY bank_name ASC, account_name ASC");
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.get("/types", (req, res) => {
  res.json(accountTypes);
});

router.post("/", async (req, res, next) => {
  try {
    const { account_name, bank_name, account_type, debit_card_name, current_balance, total_spent, notes } = req.body;
    const balance = Number(current_balance || 0);
    const result = await run(
      `INSERT INTO bank_accounts
        (account_name, bank_name, account_type, debit_card_name, current_balance, total_spent, available_balance, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account_name,
        bank_name,
        account_type || "Checking",
        debit_card_name || "",
        balance,
        Number(total_spent || 0),
        balance,
        notes || ""
      ]
    );
    const created = await get("SELECT * FROM bank_accounts WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { account_name, bank_name, account_type, debit_card_name, current_balance, total_spent, notes } = req.body;
    const balance = Number(current_balance || 0);
    await run(
      `UPDATE bank_accounts
       SET account_name = ?, bank_name = ?, account_type = ?, debit_card_name = ?,
        current_balance = ?, total_spent = ?, available_balance = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        account_name,
        bank_name,
        account_type || "Checking",
        debit_card_name || "",
        balance,
        Number(total_spent || 0),
        balance,
        notes || "",
        req.params.id
      ]
    );
    await recalculateBankAccount(req.params.id);
    const updated = await get("SELECT * FROM bank_accounts WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await run("UPDATE expenses SET bank_account_id = NULL WHERE bank_account_id = ?", [req.params.id]);
    await run("DELETE FROM bank_accounts WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
