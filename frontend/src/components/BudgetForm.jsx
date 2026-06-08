import { useEffect, useState } from "react";
import { savedMonth } from "../helpers.js";

const initialState = {
  category: "Other",
  month: savedMonth(),
  amount: ""
};

export default function BudgetForm({ categories, editing, onSubmit, onCancel }) {
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
        Month
        <input name="month" type="month" value={form.month} onChange={updateField} required />
      </label>
      <label>
        Amount
        <input name="amount" type="number" step="0.01" value={form.amount} onChange={updateField} required />
      </label>
      <div className="form-actions">
        <button type="submit">{editing ? "Update Budget" : "Set Budget"}</button>
        {editing ? (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
