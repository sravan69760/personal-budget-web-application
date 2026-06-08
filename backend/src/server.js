const path = require("path");
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db");

const expensesRouter = require("./routes/expenses");
const incomeRouter = require("./routes/income");
const budgetsRouter = require("./routes/budgets");
const documentsRouter = require("./routes/documents");
const categoriesRouter = require("./routes/categories");
const dashboardRouter = require("./routes/dashboard");
const creditCardsRouter = require("./routes/creditCards");
const banksRouter = require("./routes/banks");

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/expenses", expensesRouter);
app.use("/api/income", incomeRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/credit-cards", creditCardsRouter);
app.use("/api/banks", banksRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Something went wrong." });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Budget backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
