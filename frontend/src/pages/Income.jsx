import { useEffect, useState } from "react";
import api from "../api.js";
import IncomeForm from "../components/IncomeForm.jsx";
import DataTable from "../components/DataTable.jsx";
import { currentMonth, money } from "../helpers.js";

export default function Income() {
  const [income, setIncome] = useState([]);
  const [editing, setEditing] = useState(null);
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIncome() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/income", { params: { month } });
      setIncome(response.data);
    } catch (err) {
      setError("Unable to load income.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncome();
  }, [month]);

  async function saveIncome(data) {
    if (editing) {
      await api.put(`/income/${editing.id}`, data);
    } else {
      await api.post("/income", data);
    }
    setEditing(null);
    loadIncome();
  }

  async function deleteIncome(id) {
    await api.delete(`/income/${id}`);
    loadIncome();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Income</h2>
          <p>Track paychecks, reimbursements, and other income.</p>
        </div>
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <section className="panel">
        <h3>{editing ? "Edit Income" : "Add Income"}</h3>
        <IncomeForm editing={editing} onSubmit={saveIncome} onCancel={() => setEditing(null)} />
      </section>
      <section className="panel">
        {loading ? (
          <p className="notice">Loading income...</p>
        ) : (
          <DataTable
            columns={[
              { key: "income_date", label: "Date" },
              { key: "source", label: "Source" },
              { key: "notes", label: "Notes" },
              { key: "amount", label: "Amount", render: (row) => money(row.amount) }
            ]}
            rows={income}
            actions={(row) => (
              <>
                <button className="small" onClick={() => setEditing(row)}>
                  Edit
                </button>
                <button className="small danger-button" onClick={() => deleteIncome(row.id)}>
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
