const express = require("express");
const { all, get, run } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const params = [];
    let where = "";
    if (req.query.month) {
      where = "WHERE substr(income_date, 1, 7) = ?";
      params.push(req.query.month);
    }
    const rows = await all(`SELECT * FROM income ${where} ORDER BY income_date DESC, id DESC`, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { amount, source, income_date, notes } = req.body;
    const result = await run(
      "INSERT INTO income (amount, source, income_date, notes) VALUES (?, ?, ?, ?)",
      [amount, source, income_date, notes || ""]
    );
    const created = await get("SELECT * FROM income WHERE id = ?", [result.id]);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amount, source, income_date, notes } = req.body;
    await run(
      "UPDATE income SET amount = ?, source = ?, income_date = ?, notes = ? WHERE id = ?",
      [amount, source, income_date, notes || "", req.params.id]
    );
    const updated = await get("SELECT * FROM income WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await run("DELETE FROM income WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
