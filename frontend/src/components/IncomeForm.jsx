import { useEffect, useState } from "react";

const initialState = {
  amount: "",
  source: "",
  income_date: new Date().toISOString().slice(0, 10),
  notes: ""
};

export default function IncomeForm({ editing, onSubmit, onCancel }) {
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
        Source
        <input name="source" value={form.source} onChange={updateField} required />
      </label>
      <label>
        Date
        <input name="income_date" type="date" value={form.income_date} onChange={updateField} required />
      </label>
      <label className="wide">
        Notes
        <input name="notes" value={form.notes} onChange={updateField} />
      </label>
      <div className="form-actions wide">
        <button type="submit">{editing ? "Update Income" : "Add Income"}</button>
        {editing ? (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
