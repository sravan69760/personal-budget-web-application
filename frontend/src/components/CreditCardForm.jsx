import { useEffect, useState } from "react";

const cardTypes = ["Visa", "Mastercard", "American Express", "Discover", "Store Card", "Other"];

const initialState = {
  card_name: "",
  bank_name: "",
  card_type: "Visa",
  credit_limit: "",
  current_balance: "0",
  total_paid: "0",
  due_date: "",
  payment_status: "unpaid",
  notes: ""
};

export default function CreditCardForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    setForm(editing || initialState);
  }, [editing]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      credit_limit: Number(form.credit_limit || 0),
      current_balance: Number(form.current_balance || 0),
      total_paid: Number(form.total_paid || 0)
    });
    setForm(initialState);
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Card Name
        <input name="card_name" value={form.card_name} onChange={updateField} required />
      </label>
      <label>
        Bank Name
        <input name="bank_name" value={form.bank_name} onChange={updateField} required />
      </label>
      <label>
        Card Type
        <select name="card_type" value={form.card_type} onChange={updateField}>
          {cardTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Credit Limit
        <input name="credit_limit" type="number" step="0.01" value={form.credit_limit} onChange={updateField} required />
      </label>
      <label>
        Current Balance
        <input name="current_balance" type="number" step="0.01" value={form.current_balance} onChange={updateField} />
      </label>
      <label>
        Total Paid
        <input name="total_paid" type="number" step="0.01" value={form.total_paid} onChange={updateField} />
      </label>
      <label>
        Due Date
        <input name="due_date" type="date" value={form.due_date || ""} onChange={updateField} />
      </label>
      <label>
        Status
        <select name="payment_status" value={form.payment_status} onChange={updateField}>
          <option value="unpaid">unpaid</option>
          <option value="partial">partial</option>
          <option value="paid">paid</option>
        </select>
      </label>
      <label className="wide">
        Notes
        <input name="notes" value={form.notes || ""} onChange={updateField} />
      </label>
      <div className="form-actions wide">
        <button type="submit">{editing ? "Update Card" : "Add Card"}</button>
        {editing ? (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
