const { run } = require("./db");

function paymentStatus(balance, totalPaid) {
  if (Number(balance) <= 0) return "paid";
  if (Number(totalPaid) > 0) return "partial";
  return "unpaid";
}

async function recalculateCreditCard(id) {
  await run(
    `UPDATE credit_cards
     SET
      current_balance = MAX(current_balance, 0),
      available_credit = MAX(credit_limit - MAX(current_balance, 0), 0),
      payment_status = CASE
        WHEN MAX(current_balance, 0) <= 0 THEN 'paid'
        WHEN total_paid > 0 THEN 'partial'
        ELSE 'unpaid'
      END,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );
}

async function adjustCreditCardBalance(id, amountDelta) {
  if (!id || !amountDelta) return;
  await run(
    `UPDATE credit_cards
     SET current_balance = current_balance + ?,
         available_credit = MAX(credit_limit - (current_balance + ?), 0),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [amountDelta, amountDelta, id]
  );
  await recalculateCreditCard(id);
}

async function applyCreditCardPayment(id, paymentAmount) {
  const amount = Number(paymentAmount || 0);
  if (!id || amount <= 0) return;
  await run(
    `UPDATE credit_cards
     SET current_balance = MAX(current_balance - ?, 0),
         total_paid = total_paid + ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [amount, amount, id]
  );
  await recalculateCreditCard(id);
}

module.exports = {
  adjustCreditCardBalance,
  applyCreditCardPayment,
  paymentStatus,
  recalculateCreditCard
};
