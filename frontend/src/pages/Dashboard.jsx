import { useEffect, useState } from "react";
import api from "../api.js";
import { money, percent, savedMonth, saveMonth } from "../helpers.js";
import SummaryCard from "../components/SummaryCard.jsx";
import DataTable from "../components/DataTable.jsx";

export default function Dashboard() {
  const [month, setMonth] = useState(savedMonth());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/dashboard/summary", { params: { month } });
        setSummary(response.data);
      } catch (err) {
        setError("Unable to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [month]);

  if (loading) return <p className="notice">Loading dashboard...</p>;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Month overview, spending methods, categories, and upcoming bills.</p>
        </div>
        <input type="month" value={month} onChange={(event) => setMonth(saveMonth(event.target.value))} />
      </div>

      {error ? <p className="error">{error}</p> : null}

      {summary ? (
        <>
          <div className="summary-grid">
            <SummaryCard label="Income" value={money(summary.totalIncome)} tone="income" />
            <SummaryCard label="Expenses" value={money(summary.totalExpenses)} tone="expense" />
            <SummaryCard label="Remaining" value={money(summary.remainingBalance)} />
            <SummaryCard
              label="Budget Used"
              value={percent(summary.budgetUsedPercent)}
              helper={`${money(summary.totalBudget)} monthly budget`}
              tone={summary.budgetUsedPercent > 100 ? "danger" : "neutral"}
            />
          </div>

          <div className="summary-grid">
            <SummaryCard label="Credit Card Owed" value={money(summary.creditCards?.totalOwed)} tone="expense" />
            <SummaryCard label="Credit Limit" value={money(summary.creditCards?.totalLimit)} />
            <SummaryCard label="Available Credit" value={money(summary.creditCards?.availableCredit)} tone="income" />
            <SummaryCard label="Credit Card Paid" value={money(summary.creditCards?.totalPaid)} />
          </div>

          <div className="summary-grid">
            <SummaryCard label="Bank Balance" value={money(summary.banks?.totalBalance)} tone="income" />
            <SummaryCard label="Debit Card Spent" value={money(summary.banks?.totalSpent)} tone="expense" />
            <SummaryCard label="Available Bank Balance" value={money(summary.banks?.availableBalance)} />
          </div>

          <div className="two-column">
            <section className="panel">
              <h3>Upcoming Credit Card Payments</h3>
              <DataTable
                columns={[
                  { key: "card_name", label: "Card" },
                  { key: "bank_name", label: "Bank" },
                  { key: "due_date", label: "Due" },
                  { key: "current_balance", label: "Owed", render: (row) => money(row.current_balance) },
                  { key: "payment_status", label: "Status" }
                ]}
                rows={summary.creditCards?.upcomingPayments || []}
                emptyMessage="No upcoming credit card payments."
                compact
              />
            </section>
            <section className="panel">
              <h3>Spending By Payment Method</h3>
              <DataTable
                columns={[
                  { key: "payment_method", label: "Payment Method" },
                  { key: "total", label: "Spent", render: (row) => money(row.total) }
                ]}
                rows={summary.spendingByPaymentMethod || []}
                emptyMessage="No payment method spending yet."
                compact
              />
            </section>
          </div>

          <div className="two-column">
            <section className="panel">
              <h3>Spending By Category</h3>
              <DataTable
                columns={[
                  { key: "category", label: "Category" },
                  { key: "total", label: "Spent", render: (row) => money(row.total) }
                ]}
                rows={summary.spendingByCategory || []}
                emptyMessage="No category spending yet."
                compact
              />
            </section>
          </div>

          <div className="two-column">
            <section className="panel">
              <h3>Upcoming Bills</h3>
              <DataTable
                columns={[
                  { key: "title", label: "Title" },
                  { key: "vendor", label: "Vendor" },
                  { key: "due_date", label: "Due" },
                  { key: "amount", label: "Amount", render: (row) => money(row.amount) },
                  { key: "status", label: "Status" }
                ]}
                rows={summary.upcomingBills}
                emptyMessage="No upcoming bills."
                compact
              />
            </section>
            <section className="panel">
              <h3>Recent Expenses</h3>
              <DataTable
                columns={[
                  { key: "expense_date", label: "Date" },
                  { key: "category", label: "Category" },
                  { key: "description", label: "Description" },
                  { key: "amount", label: "Amount", render: (row) => money(row.amount) }
                ]}
                rows={summary.recentExpenses}
                emptyMessage="No recent expenses."
                compact
              />
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
