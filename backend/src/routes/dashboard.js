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

    const creditCards = await get(
      `SELECT
        COALESCE(SUM(current_balance), 0) AS totalOwed,
        COALESCE(SUM(credit_limit), 0) AS totalLimit,
        COALESCE(SUM(available_credit), 0) AS availableCredit,
        COALESCE(SUM(total_paid), 0) AS totalPaid
       FROM credit_cards`
    );

    const upcomingCreditCardPayments = await all(
      `SELECT id, card_name, bank_name, current_balance, due_date, payment_status
       FROM credit_cards
       WHERE payment_status != 'paid'
        AND due_date >= date('now')
       ORDER BY due_date ASC
       LIMIT 5`
    );

    const banks = await get(
      `SELECT
        COALESCE(SUM(current_balance), 0) AS totalBalance,
        COALESCE(SUM(total_spent), 0) AS totalSpent,
        COALESCE(SUM(available_balance), 0) AS availableBalance
       FROM bank_accounts`
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
      spendingByCategory,
      creditCards: {
        totalOwed: Number(creditCards.totalOwed || 0),
        totalLimit: Number(creditCards.totalLimit || 0),
        availableCredit: Number(creditCards.availableCredit || 0),
        totalPaid: Number(creditCards.totalPaid || 0),
        upcomingPayments: upcomingCreditCardPayments
      },
      banks: {
        totalBalance: Number(banks.totalBalance || 0),
        totalSpent: Number(banks.totalSpent || 0),
        availableBalance: Number(banks.availableBalance || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
