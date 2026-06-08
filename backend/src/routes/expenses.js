const express = require("express");
const { all, get, run } = require("../db");
const { adjustCreditCardBalance } = require("../creditCardMath");
const { adjustBankAccountBalance } = require("../bankMath");

const router = express.Router();

function shouldUseCreditCard(category, paymentMethod, creditCardId) {
  return Boolean(
    creditCardId ||
      String(category || "").toLowerCase() === "credit card" ||
      String(paymentMethod || "").toLowerCase() === "credit card"
  );
}

function shouldUseBankAccount(paymentMethod, bankAccountId) {
  return Boolean(bankAccountId || String(paymentMethod || "").toLowerCase() === "debit card");
}

router.get("/", async (req, res, next) => {
  try {
    const filters = [];
    const params = [];

    if (req.query.month) {
      filters.push("substr(e.expense_date, 1, 7) = ?");
      params.push(req.query.month);
    }
    if (req.query.category) {
      filters.push("e.category = ?");
      params.push(req.query.category);
    }
    if (req.query.payment_method) {
      filters.push("e.payment_method = ?");
      params.push(req.query.payment_method);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const expenses = await all(
      `SELECT
        e.*,
        c.card_name AS credit_card_name,
        c.bank_name AS credit_card_bank,
        b.account_name AS bank_account_name,
        b.bank_name AS bank_account_bank,
        b.debit_card_name AS debit_card_name
       FROM expenses e
       LEFT JOIN credit_cards c ON c.id = e.credit_card_id
       LEFT JOIN bank_accounts b ON b.id = e.bank_account_id
       ${where}
       ORDER BY e.expense_date DESC, e.id DESC`,
      params
    );
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { amount, category, description, expense_date, payment_method, credit_card_id, bank_account_id } = req.body;
    const cardId = shouldUseCreditCard(category, payment_method, credit_card_id) ? credit_card_id || null : null;
    const bankId = shouldUseBankAccount(payment_method, bank_account_id) ? bank_account_id || null : null;
    const result = await run(
      `INSERT INTO expenses (amount, category, description, expense_date, payment_method, credit_card_id, bank_account_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [amount, category, description || "", expense_date, payment_method, cardId, bankId]
    );
    await adjustCreditCardBalance(cardId, Number(amount || 0));
    await adjustBankAccountBalance(bankId, Number(amount || 0));
    const created = await get("SELECT * FROM expenses WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const oldExpense = await get("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
    const { amount, category, description, expense_date, payment_method, credit_card_id, bank_account_id } = req.body;
    const cardId = shouldUseCreditCard(category, payment_method, credit_card_id) ? credit_card_id || null : null;
    const bankId = shouldUseBankAccount(payment_method, bank_account_id) ? bank_account_id || null : null;

    if (oldExpense && oldExpense.credit_card_id) {
      await adjustCreditCardBalance(oldExpense.credit_card_id, -Number(oldExpense.amount || 0));
    }
    if (oldExpense && oldExpense.bank_account_id) {
      await adjustBankAccountBalance(oldExpense.bank_account_id, -Number(oldExpense.amount || 0));
    }

    await run(
      `UPDATE expenses
       SET amount = ?, category = ?, description = ?, expense_date = ?, payment_method = ?, credit_card_id = ?, bank_account_id = ?
       WHERE id = ?`,
      [amount, category, description || "", expense_date, payment_method, cardId, bankId, req.params.id]
    );
    await adjustCreditCardBalance(cardId, Number(amount || 0));
    await adjustBankAccountBalance(bankId, Number(amount || 0));
    const updated = await get("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const oldExpense = await get("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
    if (oldExpense && oldExpense.credit_card_id) {
      await adjustCreditCardBalance(oldExpense.credit_card_id, -Number(oldExpense.amount || 0));
    }
    if (oldExpense && oldExpense.bank_account_id) {
      await adjustBankAccountBalance(oldExpense.bank_account_id, -Number(oldExpense.amount || 0));
    }
    await run("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
