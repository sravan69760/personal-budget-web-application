import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import CreditCardForm from "../components/CreditCardForm.jsx";
import CreditCardPaymentForm from "../components/CreditCardPaymentForm.jsx";
import DataTable from "../components/DataTable.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import { money } from "../helpers.js";

export default function CreditCards() {
  const [cards, setCards] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      cards.reduce(
        (sum, card) => ({
          limit: sum.limit + Number(card.credit_limit || 0),
          owed: sum.owed + Number(card.current_balance || 0),
          paid: sum.paid + Number(card.total_paid || 0),
          available: sum.available + Number(card.available_credit || 0)
        }),
        { limit: 0, owed: 0, paid: 0, available: 0 }
      ),
    [cards]
  );

  async function loadCards() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/credit-cards");
      setCards(response.data);
      if (!selectedCardId && response.data.length) {
        setSelectedCardId(String(response.data[0].id));
      }
    } catch (err) {
      setError("Unable to load credit cards.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments(cardId) {
    if (!cardId) {
      setPayments([]);
      return;
    }
    const response = await api.get(`/credit-cards/${cardId}/payments`);
    setPayments(response.data);
  }

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    loadPayments(selectedCardId);
  }, [selectedCardId]);

  async function saveCard(data) {
    if (editing) {
      await api.put(`/credit-cards/${editing.id}`, data);
    } else {
      await api.post("/credit-cards", data);
    }
    setEditing(null);
    loadCards();
  }

  async function deleteCard(id) {
    await api.delete(`/credit-cards/${id}`);
    if (String(id) === String(selectedCardId)) {
      setSelectedCardId("");
      setPayments([]);
    }
    loadCards();
  }

  async function savePayment(data) {
    await api.post(`/credit-cards/${selectedCardId}/payments`, data);
    await loadCards();
    await loadPayments(selectedCardId);
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Credit Cards</h2>
          <p>Track card balances, available credit, due dates, and payments.</p>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="summary-grid">
        <SummaryCard label="Total Limit" value={money(totals.limit)} />
        <SummaryCard label="Total Owed" value={money(totals.owed)} tone="expense" />
        <SummaryCard label="Total Paid" value={money(totals.paid)} tone="income" />
        <SummaryCard label="Available Credit" value={money(totals.available)} />
      </div>

      <section className="panel">
        <h3>{editing ? "Edit Credit Card" : "Add Credit Card"}</h3>
        <CreditCardForm editing={editing} onSubmit={saveCard} onCancel={() => setEditing(null)} />
      </section>

      <section className="panel">
        <h3>Credit Cards</h3>
        {loading ? (
          <p className="notice">Loading credit cards...</p>
        ) : (
          <DataTable
            columns={[
              { key: "card_name", label: "Card" },
              { key: "bank_name", label: "Bank" },
              { key: "card_type", label: "Type" },
              { key: "credit_limit", label: "Limit", render: (row) => money(row.credit_limit) },
              { key: "current_balance", label: "Owed", render: (row) => money(row.current_balance) },
              { key: "available_credit", label: "Available", render: (row) => money(row.available_credit) },
              { key: "due_date", label: "Due" },
              { key: "payment_status", label: "Status" }
            ]}
            rows={cards}
            actions={(row) => (
              <>
                <button className="small" onClick={() => setSelectedCardId(String(row.id))}>
                  Payments
                </button>
                <button className="small" onClick={() => setEditing(row)}>
                  Edit
                </button>
                <button className="small danger-button" onClick={() => deleteCard(row.id)}>
                  Delete
                </button>
              </>
            )}
          />
        )}
      </section>

      <section className="panel">
        <h3>Record Credit Card Payment</h3>
        <CreditCardPaymentForm
          cards={cards}
          selectedCardId={selectedCardId}
          onCardChange={setSelectedCardId}
          onSubmit={savePayment}
        />
      </section>

      <section className="panel">
        <h3>Payment History</h3>
        <DataTable
          columns={[
            { key: "payment_date", label: "Date" },
            { key: "payment_amount", label: "Amount", render: (row) => money(row.payment_amount) },
            { key: "notes", label: "Notes" }
          ]}
          rows={payments}
          emptyMessage="No payments recorded for this card."
          compact
        />
      </section>
    </section>
  );
}
