import { useState } from "react";

const initialState = {
  payment_amount: "",
  payment_date: new Date().toISOString().slice(0, 10),
  notes: ""
};

export default function CreditCardPaymentForm({ cards, selectedCardId, onCardChange, onSubmit }) {
  const [form, setForm] = useState(initialState);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    if (!selectedCardId) return;
    onSubmit({
      ...form,
      payment_amount: Number(form.payment_amount || 0)
    });
    setForm(initialState);
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Credit Card
        <select value={selectedCardId || ""} onChange={(event) => onCardChange(event.target.value)} required>
          <option value="">Select card</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.card_name} - {card.bank_name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Payment Amount
        <input name="payment_amount" type="number" step="0.01" value={form.payment_amount} onChange={updateField} required />
      </label>
      <label>
        Payment Date
        <input name="payment_date" type="date" value={form.payment_date} onChange={updateField} required />
      </label>
      <label className="wide">
        Notes
        <input name="notes" value={form.notes} onChange={updateField} />
      </label>
      <div className="form-actions wide">
        <button type="submit">Record Payment</button>
      </div>
    </form>
  );
}
