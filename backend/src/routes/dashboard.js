const express = require("express");
const { all, get } = require("../db");
const { monthRange } = require("../utils");

const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const { month } = monthRange(req.query.month);

    const income = await get(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM income WHERE substr(income_date, 1, 7) = ?",
      [month]
    );
    const expenses = await get(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE substr(expense_date, 1, 7) = ?",
      [month]
    );
    const budgets = await get("SELECT COALESCE(SUM(amount), 0) AS total FROM budgets WHERE month = ?", [
      month
    ]);

    const upcomingBills = await all(
      `SELECT * FROM documents
       WHERE document_type IN ('bill', 'invoice')
        AND status != 'paid'
        AND due_date >= date('now')
       ORDER BY due_date ASC
       LIMIT 5`
    );

    const recentExpenses = await all(
      "SELECT * FROM expenses ORDER BY expense_date DESC, id DESC LIMIT 5"
    );

    const spendingByPaymentMethod = await all(
      `SELECT payment_method, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE substr(expense_date, 1, 7) = ?
       GROUP BY payment_method
       ORDER BY total DESC`,
      [month]
    );

    const spendingByCategory = await all(
      `SELECT category, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE substr(expense_date, 1, 7) = ?
       GROUP BY category
       ORDER BY total DESC`,
      [month]
    );

    const totalIncome = Number(income.total || 0);
    const totalExpenses = Number(expenses.total || 0);
    const totalBudget = Number(budgets.total || 0);

    res.json({
      month,
      totalIncome,
      totalExpenses,
      remainingBalance: totalIncome - totalExpenses,
      totalBudget,
      budgetUsedPercent: totalBudget > 0 ? Number(((totalExpenses / totalBudget) * 100).toFixed(1)) : 0,
      upcomingBills,
      recentExpenses,
      spendingByPaymentMethod,
      spendingByCategory
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
