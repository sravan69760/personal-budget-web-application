const express = require("express");
const { all, get, run } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filters = [];
    const params = [];

    if (req.query.month) {
      filters.push("substr(expense_date, 1, 7) = ?");
      params.push(req.query.month);
    }
    if (req.query.category) {
      filters.push("category = ?");
      params.push(req.query.category);
    }
    if (req.query.payment_method) {
      filters.push("payment_method = ?");
      params.push(req.query.payment_method);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const expenses = await all(
      `SELECT * FROM expenses ${where} ORDER BY expense_date DESC, id DESC`,
      params
    );
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { amount, category, description, expense_date, payment_method } = req.body;
    const result = await run(
      `INSERT INTO expenses (amount, category, description, expense_date, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [amount, category, description || "", expense_date, payment_method]
    );
    const created = await get("SELECT * FROM expenses WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amount, category, description, expense_date, payment_method } = req.body;
    await run(
      `UPDATE expenses
       SET amount = ?, category = ?, description = ?, expense_date = ?, payment_method = ?
       WHERE id = ?`,
      [amount, category, description || "", expense_date, payment_method, req.params.id]
    );
    const updated = await get("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await run("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
