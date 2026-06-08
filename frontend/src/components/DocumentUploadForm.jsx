import { useState } from "react";
import { paymentMethods } from "../constants.js";

const initialState = {
  title: "",
  vendor: "",
  amount: "",
  category: "Other",
  due_date: "",
  status: "pending",
  document_type: "receipt",
  auto_create_expense: true,
  payment_method: "Debit Card",
  credit_card_id: "",
  bank_account_id: "",
  file: null
};

function titleFromFileName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DocumentUploadForm({ categories, creditCards, bankAccounts, onSubmit }) {
  const [form, setForm] = useState(initialState);

  function updateField(event) {
    const { name, value, files, checked, type } = event.target;
    if (files) {
      const file = files[0];
      setForm({
        ...form,
        file,
        title: form.title || titleFromFileName(file.name)
      });
      return;
    }
    const next = { ...form, [name]: type === "checkbox" ? checked : value };
    if (name === "payment_method" && value !== "Credit Card" && next.category !== "Credit Card") {
      next.credit_card_id = "";
    }
    if (name === "category" && value !== "Credit Card" && next.payment_method !== "Credit Card") {
      next.credit_card_id = "";
    }
    if (name === "payment_method" && value !== "Debit Card") {
      next.bank_account_id = "";
    }
    setForm(next);
  }

  function submit(event) {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) {
        data.append(key, value);
      }
    });
    onSubmit(data);
    event.target.reset();
    setForm(initialState);
  }

  const needsCreditCard = form.payment_method === "Credit Card" || form.category === "Credit Card";
  const needsBankAccount = form.payment_method === "Debit Card";

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Title
        <input name="title" value={form.title} onChange={updateField} required />
      </label>
      <label>
        Vendor
        <input name="vendor" value={form.vendor} onChange={updateField} />
      </label>
      <label>
        Amount
        <input
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={updateField}
          required
        />
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
        <input name="due_date" type="date" value={form.due_date} onChange={updateField} />
      </label>
      <label>
        Status
        <select name="status" value={form.status} onChange={updateField}>
          <option value="pending">pending</option>
          <option value="unpaid">unpaid</option>
          <option value="paid">paid</option>
        </select>
      </label>
      <label>
        Document Type
        <select name="document_type" value={form.document_type} onChange={updateField}>
          <option value="receipt">receipt</option>
          <option value="bill">bill</option>
          <option value="invoice">invoice</option>
        </select>
      </label>
      <label>
        Payment Method
        <select name="payment_method" value={form.payment_method} onChange={updateField}>
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
          <select name="credit_card_id" value={form.credit_card_id} onChange={updateField} required>
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
          <select name="bank_account_id" value={form.bank_account_id} onChange={updateField} required>
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
        File
        <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={updateField} required />
      </label>
      <label className="checkbox-label wide">
        <input
          name="auto_create_expense"
          type="checkbox"
          checked={form.auto_create_expense}
          onChange={updateField}
        />
        Add this amount to expenses and budget totals
      </label>
      <div className="form-actions wide">
        <button type="submit">Upload Document</button>
      </div>
    </form>
  );
}
