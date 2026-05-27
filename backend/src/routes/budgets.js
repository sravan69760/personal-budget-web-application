const express = require("express");
const { all, get, run } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const month = req.query.month;
    const params = [];
    let where = "";
    if (month) {
      where = "WHERE b.month = ?";
      params.push(month);
    }

    const budgets = await all(
      `SELECT
        b.*,
        COALESCE(SUM(e.amount), 0) AS spent,
        CASE WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(e.amount), 0) / b.amount) * 100, 1) ELSE 0 END AS used_percent
       FROM budgets b
       LEFT JOIN expenses e
        ON e.category = b.category
        AND substr(e.expense_date, 1, 7) = b.month
       ${where}
       GROUP BY b.id
       ORDER BY b.month DESC, b.category`,
      params
    );
    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { category, month, amount } = req.body;
    const result = await run(
      `INSERT INTO budgets (category, month, amount)
       VALUES (?, ?, ?)
       ON CONFLICT(category, month) DO UPDATE SET amount = excluded.amount`,
      [category, month, amount]
    );
    const created = await get(
      "SELECT * FROM budgets WHERE id = ? OR (category = ? AND month = ?) ORDER BY id DESC LIMIT 1",
      [result.id, category, month]
    );
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { category, month, amount } = req.body;
    await run("UPDATE budgets SET category = ?, month = ?, amount = ? WHERE id = ?", [
      category,
      month,
      amount,
      req.params.id
    ]);
    const updated = await get("SELECT * FROM budgets WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await run("DELETE FROM budgets WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
