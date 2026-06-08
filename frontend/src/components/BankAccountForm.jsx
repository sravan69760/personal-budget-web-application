import { useEffect, useState } from "react";

const accountTypes = ["Checking", "Savings", "Debit Card", "Other"];

const initialState = {
  account_name: "",
  bank_name: "",
  account_type: "Checking",
  debit_card_name: "",
  current_balance: "",
  total_spent: "0",
  notes: ""
};

export default function BankAccountForm({ editing, onSubmit, onCancel }) {
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
      current_balance: Number(form.current_balance || 0),
      total_spent: Number(form.total_spent || 0)
    });
    setForm(initialState);
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Account Name
        <input name="account_name" value={form.account_name} onChange={updateField} required />
      </label>
      <label>
        Bank Name
        <input name="bank_name" value={form.bank_name} onChange={updateField} required />
      </label>
      <label>
        Account Type
        <select name="account_type" value={form.account_type} onChange={updateField}>
          {accountTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Debit Card Name
        <input name="debit_card_name" value={form.debit_card_name || ""} onChange={updateField} />
      </label>
      <label>
        Current Balance
        <input name="current_balance" type="number" step="0.01" value={form.current_balance} onChange={updateField} required />
      </label>
      <label>
        Total Spent
        <input name="total_spent" type="number" step="0.01" value={form.total_spent} onChange={updateField} />
      </label>
      <label className="wide">
        Notes
        <input name="notes" value={form.notes || ""} onChange={updateField} />
      </label>
      <div className="form-actions wide">
        <button type="submit">{editing ? "Update Bank" : "Add Bank"}</button>
        {editing ? (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
