const { run } = require("./db");

async function adjustBankAccountBalance(id, amountDelta) {
  if (!id || !amountDelta) return;
  await run(
    `UPDATE bank_accounts
     SET current_balance = current_balance - ?,
         total_spent = total_spent + ?,
         available_balance = current_balance - ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [amountDelta, amountDelta, amountDelta, id]
  );
}

async function recalculateBankAccount(id) {
  if (!id) return;
  await run(
    `UPDATE bank_accounts
     SET available_balance = current_balance,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );
}

module.exports = {
  adjustBankAccountBalance,
  recalculateBankAccount
};
