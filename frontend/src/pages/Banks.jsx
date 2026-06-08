import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import BankAccountForm from "../components/BankAccountForm.jsx";
import DataTable from "../components/DataTable.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import { money } from "../helpers.js";

export default function Banks() {
  const [accounts, setAccounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      accounts.reduce(
        (sum, account) => ({
          balance: sum.balance + Number(account.current_balance || 0),
          spent: sum.spent + Number(account.total_spent || 0),
          available: sum.available + Number(account.available_balance || 0)
        }),
        { balance: 0, spent: 0, available: 0 }
      ),
    [accounts]
  );

  async function loadAccounts() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/banks");
      setAccounts(response.data);
    } catch (err) {
      setError("Unable to load bank accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function saveAccount(data) {
    if (editing) {
      await api.put(`/banks/${editing.id}`, data);
    } else {
      await api.post("/banks", data);
    }
    setEditing(null);
    loadAccounts();
  }

  async function deleteAccount(id) {
    await api.delete(`/banks/${id}`);
    loadAccounts();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Banks</h2>
          <p>Track bank accounts and which debit card was used for spending.</p>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="summary-grid">
        <SummaryCard label="Bank Balance" value={money(totals.balance)} tone="income" />
        <SummaryCard label="Debit Spent" value={money(totals.spent)} tone="expense" />
        <SummaryCard label="Available Balance" value={money(totals.available)} />
      </div>

      <section className="panel">
        <h3>{editing ? "Edit Bank Account" : "Add Bank Account"}</h3>
        <BankAccountForm editing={editing} onSubmit={saveAccount} onCancel={() => setEditing(null)} />
      </section>

      <section className="panel">
        <h3>Bank Accounts</h3>
        {loading ? (
          <p className="notice">Loading bank accounts...</p>
        ) : (
          <DataTable
            columns={[
              { key: "account_name", label: "Account" },
              { key: "bank_name", label: "Bank" },
              { key: "account_type", label: "Type" },
              { key: "debit_card_name", label: "Debit Card" },
              { key: "current_balance", label: "Balance", render: (row) => money(row.current_balance) },
              { key: "total_spent", label: "Spent", render: (row) => money(row.total_spent) },
              { key: "available_balance", label: "Available", render: (row) => money(row.available_balance) }
            ]}
            rows={accounts}
            actions={(row) => (
              <>
                <button className="small" onClick={() => setEditing(row)}>
                  Edit
                </button>
                <button className="small danger-button" onClick={() => deleteAccount(row.id)}>
                  Delete
                </button>
              </>
            )}
          />
        )}
      </section>
    </section>
  );
}
