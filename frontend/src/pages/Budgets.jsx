import { useEffect, useState } from "react";
import api from "../api.js";
import BudgetForm from "../components/BudgetForm.jsx";
import DataTable from "../components/DataTable.jsx";
import { currentMonth, money, percent } from "../helpers.js";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [budgetsResponse, categoriesResponse] = await Promise.all([
        api.get("/budgets", { params: { month } }),
        api.get("/categories")
      ]);
      setBudgets(budgetsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError("Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [month]);

  async function saveBudget(data) {
    if (editing) {
      await api.put(`/budgets/${editing.id}`, data);
    } else {
      await api.post("/budgets", data);
    }
    setEditing(null);
    loadData();
  }

  async function deleteBudget(id) {
    await api.delete(`/budgets/${id}`);
    loadData();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Budgets</h2>
          <p>Set monthly category limits and watch spending progress.</p>
        </div>
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <section className="panel">
        <h3>{editing ? "Edit Budget" : "Set Monthly Budget"}</h3>
        <BudgetForm categories={categories} editing={editing} onSubmit={saveBudget} onCancel={() => setEditing(null)} />
      </section>
      <section className="panel">
        {loading ? (
          <p className="notice">Loading budgets...</p>
        ) : (
          <DataTable
            columns={[
              { key: "month", label: "Month" },
              { key: "category", label: "Category" },
              { key: "amount", label: "Budget", render: (row) => money(row.amount) },
              { key: "spent", label: "Spent", render: (row) => money(row.spent) },
              {
                key: "used_percent",
                label: "Used",
                render: (row) => (
                  <span className={row.used_percent > 100 ? "danger-text" : ""}>
                    {percent(row.used_percent)} {row.used_percent > 100 ? "Over budget" : ""}
                  </span>
                )
              }
            ]}
            rows={budgets}
            actions={(row) => (
              <>
                <button className="small" onClick={() => setEditing(row)}>
                  Edit
                </button>
                <button className="small danger-button" onClick={() => deleteBudget(row.id)}>
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
