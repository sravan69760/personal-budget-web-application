import { useEffect, useState } from "react";
import { paymentMethods } from "../constants.js";

const initialState = {
  amount: "",
  category: "Other",
  description: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: paymentMethods[2]
};

export default function ExpenseForm({ categories, editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    setForm(editing || initialState);
  }, [editing]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount) });
    setForm(initialState);
  }

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
