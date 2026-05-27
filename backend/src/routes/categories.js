const express = require("express");
const { all } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await all("SELECT * FROM categories ORDER BY name");
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
