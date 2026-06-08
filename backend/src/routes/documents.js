const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const { all, get, run } = require("../db");
const { toNumber } = require("../utils");
const { adjustCreditCardBalance } = require("../creditCardMath");
const { adjustBankAccountBalance } = require("../bankMath");

const router = express.Router();
const uploadDir = path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed."));
  }
});

router.get("/", async (req, res, next) => {
  try {
    const documents = await all("SELECT * FROM documents ORDER BY due_date ASC, uploaded_at DESC");
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "A document file is required." });
      return;
    }

    const {
      title,
      vendor,
      amount,
      category,
      due_date,
      status,
      document_type,
      auto_create_expense,
      payment_method,
      credit_card_id,
      bank_account_id
    } = req.body;
    const relativePath = `/uploads/${req.file.filename}`;
    const numericAmount = toNumber(amount);
    const documentDate = due_date || new Date().toISOString().slice(0, 10);
    const documentVendor = vendor || "";
    const documentTitle = title || req.file.originalname;
    const result = await run(
      `INSERT INTO documents
        (title, vendor, amount, category, due_date, status, file_path, original_name, document_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentTitle,
        documentVendor,
        numericAmount,
        category || "Other",
        documentDate,
        status || "pending",
        relativePath,
        req.file.originalname,
        document_type || "bill"
      ]
    );
    const created = await get("SELECT * FROM documents WHERE id = ?", [result.id]);

    if (auto_create_expense === "true" && numericAmount) {
      const selectedCardId =
        payment_method === "Credit Card" || category === "Credit Card" ? credit_card_id || null : null;
      const selectedBankId = payment_method === "Debit Card" ? bank_account_id || null : null;
      await run(
        `INSERT INTO expenses
          (amount, category, description, expense_date, payment_method, credit_card_id, bank_account_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          numericAmount,
          category || "Other",
          `${document_type || "document"}: ${documentTitle}`,
          documentDate,
          payment_method || "Debit Card",
          selectedCardId,
          selectedBankId
        ]
      );
      await adjustCreditCardBalance(selectedCardId, numericAmount);
      await adjustBankAccountBalance(selectedBankId, numericAmount);
    }

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const document = await get("SELECT * FROM documents WHERE id = ?", [req.params.id]);
    if (document) {
      const filename = path.basename(document.file_path);
      const fullPath = path.join(uploadDir, filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    await run("DELETE FROM documents WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
