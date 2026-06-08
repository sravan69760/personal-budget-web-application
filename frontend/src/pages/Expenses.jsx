import { useEffect, useState } from "react";
import api from "../api.js";
import ExpenseForm from "../components/ExpenseForm.jsx";
import DataTable from "../components/DataTable.jsx";
import { money, savedMonth, saveMonth } from "../helpers.js";
import { paymentMethods } from "../constants.js";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ month: savedMonth(), category: "", payment_method: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [expensesResponse, categoriesResponse, creditCardsResponse, bankAccountsResponse] = await Promise.all([
        api.get("/expenses", { params: filters }),
        api.get("/categories"),
        api.get("/credit-cards"),
        api.get("/banks")
      ]);
      setExpenses(expensesResponse.data);
      setCategories(categoriesResponse.data);
      setCreditCards(creditCardsResponse.data);
      setBankAccounts(bankAccountsResponse.data);
    } catch (err) {
      setError("Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters.month, filters.category, filters.payment_method]);

  async function saveExpense(data) {
    if (editing) {
      await api.put(`/expenses/${editing.id}`, data);
    } else {
      await api.post("/expenses", data);
    }
    setEditing(null);
    loadData();
  }

  async function deleteExpense(id) {
    await api.delete(`/expenses/${id}`);
    loadData();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Expenses</h2>
          <p>Add, edit, filter, and review spending.</p>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}
      <section className="panel">
        <h3>{editing ? "Edit Expense" : "Add Expense"}</h3>
        <ExpenseForm
          categories={categories}
          creditCards={creditCards}
          bankAccounts={bankAccounts}
          editing={editing}
          onSubmit={saveExpense}
          onCancel={() => setEditing(null)}
        />
      </section>

      <section className="panel">
        <div className="filters">
          <input
            type="month"
            value={filters.month}
            onChange={(event) => setFilters({ ...filters, month: saveMonth(event.target.value) })}
          />
          <select
            value={filters.category}
            onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={filters.payment_method}
            onChange={(event) => setFilters({ ...filters, payment_method: event.target.value })}
          >
            <option value="">All payment methods</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="notice">Loading expenses...</p>
        ) : (
          <DataTable
            columns={[
              { key: "expense_date", label: "Date" },
              { key: "category", label: "Category" },
              { key: "description", label: "Description" },
              { key: "payment_method", label: "Payment" },
              { key: "credit_card_name", label: "Card", render: (row) => row.credit_card_name || "" },
              {
                key: "bank_account_name",
                label: "Bank",
                render: (row) => row.bank_account_name ? `${row.debit_card_name || row.bank_account_name} - ${row.bank_account_bank}` : ""
              },
              { key: "amount", label: "Amount", render: (row) => money(row.amount) }
            ]}
            rows={expenses}
            actions={(row) => (
              <>
                <button className="small" onClick={() => setEditing(row)}>
                  Edit
                </button>
                <button className="small danger-button" onClick={() => deleteExpense(row.id)}>
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
