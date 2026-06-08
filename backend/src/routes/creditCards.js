const express = require("express");
const { all, get, run } = require("../db");
const { applyCreditCardPayment, recalculateCreditCard } = require("../creditCardMath");

const router = express.Router();

const cardTypes = ["Visa", "Mastercard", "American Express", "Discover", "Store Card", "Other"];

router.get("/", async (req, res, next) => {
  try {
    const cards = await all("SELECT * FROM credit_cards ORDER BY due_date ASC, card_name ASC");
    res.json(cards);
  } catch (error) {
    next(error);
  }
});

router.get("/types", (req, res) => {
  res.json(cardTypes);
});

router.post("/", async (req, res, next) => {
  try {
    const {
      card_name,
      bank_name,
      card_type,
      credit_limit,
      current_balance,
      total_paid,
      due_date,
      payment_status,
      notes
    } = req.body;
    const balance = Number(current_balance || 0);
    const limit = Number(credit_limit || 0);
    const paid = Number(total_paid || 0);
    const result = await run(
      `INSERT INTO credit_cards
        (card_name, bank_name, card_type, credit_limit, current_balance, total_paid, available_credit, due_date, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card_name,
        bank_name,
        card_type || "Other",
        limit,
        balance,
        paid,
        Math.max(limit - balance, 0),
        due_date || "",
        payment_status || "unpaid",
        notes || ""
      ]
    );
    await recalculateCreditCard(result.id);
    const created = await get("SELECT * FROM credit_cards WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const {
      card_name,
      bank_name,
      card_type,
      credit_limit,
      current_balance,
      total_paid,
      due_date,
      payment_status,
      notes
    } = req.body;
    const balance = Number(current_balance || 0);
    const limit = Number(credit_limit || 0);
    await run(
      `UPDATE credit_cards
       SET card_name = ?, bank_name = ?, card_type = ?, credit_limit = ?, current_balance = ?,
        total_paid = ?, available_credit = ?, due_date = ?, payment_status = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        card_name,
        bank_name,
        card_type || "Other",
        limit,
        balance,
        Number(total_paid || 0),
        Math.max(limit - balance, 0),
        due_date || "",
        payment_status || "unpaid",
        notes || "",
        req.params.id
      ]
    );
    await recalculateCreditCard(req.params.id);
    const updated = await get("SELECT * FROM credit_cards WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await run("UPDATE expenses SET credit_card_id = NULL WHERE credit_card_id = ?", [req.params.id]);
    await run("DELETE FROM credit_cards WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:id/payments", async (req, res, next) => {
  try {
    const { payment_amount, payment_date, notes } = req.body;
    const amount = Number(payment_amount || 0);
    if (amount <= 0) {
      res.status(400).json({ message: "Payment amount must be greater than zero." });
      return;
    }
    const result = await run(
      `INSERT INTO credit_card_payments (credit_card_id, payment_amount, payment_date, notes)
       VALUES (?, ?, ?, ?)`,
      [req.params.id, amount, payment_date || new Date().toISOString().slice(0, 10), notes || ""]
    );
    await applyCreditCardPayment(req.params.id, amount);
    const payment = await get("SELECT * FROM credit_card_payments WHERE id = ?", [result.id]);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/payments", async (req, res, next) => {
  try {
    const payments = await all(
      "SELECT * FROM credit_card_payments WHERE credit_card_id = ? ORDER BY payment_date DESC, id DESC",
      [req.params.id]
    );
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
