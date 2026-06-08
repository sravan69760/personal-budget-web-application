import { useEffect, useState } from "react";
import { paymentMethods } from "../constants.js";

const initialState = {
  amount: "",
  category: "Other",
  description: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: paymentMethods[2],
  credit_card_id: "",
  bank_account_id: ""
};

export default function ExpenseForm({ categories, creditCards, bankAccounts, editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    setForm(editing || initialState);
  }, [editing]);

  function updateField(event) {
    const next = { ...form, [event.target.name]: event.target.value };
    if (
      event.target.name === "payment_method" &&
      event.target.value !== "Credit Card" &&
      next.category !== "Credit Card"
    ) {
      next.credit_card_id = "";
    }
    if (event.target.name === "payment_method" && event.target.value !== "Debit Card") {
      next.bank_account_id = "";
    }
    if (
      event.target.name === "category" &&
      event.target.value !== "Credit Card" &&
      next.payment_method !== "Credit Card"
    ) {
      next.credit_card_id = "";
    }
    setForm(next);
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      amount: Number(form.amount),
      credit_card_id: form.credit_card_id ? Number(form.credit_card_id) : null,
      bank_account_id: form.bank_account_id ? Number(form.bank_account_id) : null
    });
    setForm(initialState);
  }

  const needsCreditCard = form.category === "Credit Card" || form.payment_method === "Credit Card";
  const needsBankAccount = form.payment_method === "Debit Card";

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Amount
        <input name="amount" type="number" step="0.01" value={form.amount} onChange={updateField} required />
      </label>
      <label>
        Category
        <select name="category" value={form.category} onChange={updateField}>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date
        <input name="expense_date" type="date" value={form.expense_date} onChange={updateField} required />
      </label>
      <label>
        Payment Method
        <select name="payment_method" value={form.payment_method} onChange={updateField} required>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>
      {needsCreditCard ? (
        <label>
          Credit Card
          <select name="credit_card_id" value={form.credit_card_id || ""} onChange={updateField} required>
            <option value="">Select card</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.card_name} - {card.bank_name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {needsBankAccount ? (
        <label>
          Bank Debit Card
          <select name="bank_account_id" value={form.bank_account_id || ""} onChange={updateField} required>
            <option value="">Select bank</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.debit_card_name || account.account_name} - {account.bank_name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="wide">
        Description
        <input name="description" value={form.description} onChange={updateField} />
      </label>
      <div className="form-actions wide">
        <button type="submit">{editing ? "Update Expense" : "Add Expense"}</button>
        {editing ? (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
