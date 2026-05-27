const fs = require("fs");

function optionalRequire(packageName) {
  try {
    return require(packageName);
  } catch (error) {
    return null;
  }
}

function cleanLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseMoney(value) {
  const cleaned = String(value || "").replace(/[$,\s]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function extractAmount(text) {
  const lines = cleanLines(text);
  const totalWords = /(amount due|balance due|grand total|total due|total|amount)/i;

  for (const line of lines) {
    if (!totalWords.test(line)) continue;
    const matches = line.match(/\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})|\$?\s*\d+\.\d{2}/g);
    if (matches && matches.length) {
      return parseMoney(matches[matches.length - 1]);
    }
  }

  const allMoney = text.match(/\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})|\$?\s*\d+\.\d{2}/g) || [];
  const amounts = allMoney.map(parseMoney).filter((amount) => amount !== null);
  if (!amounts.length) return null;
  return Math.max(...amounts);
}

function extractDate(text) {
  const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const us = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (us) {
    return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  }

  return "";
}

function extractVendor(text) {
  const ignored = /invoice|receipt|bill|statement|date|total|amount|balance/i;
  const line = cleanLines(text).find((item) => item.length > 2 && !ignored.test(item));
  return line ? line.slice(0, 80) : "";
}

async function readPdf(filePath) {
  const pdfParse = optionalRequire("pdf-parse");
  if (!pdfParse) return "";
  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text || "";
}

async function readImage(filePath) {
  const tesseract = optionalRequire("tesseract.js");
  if (!tesseract) return "";
  const result = await tesseract.recognize(filePath, "eng");
  return result.data.text || "";
}

async function extractDocumentData(file) {
  let text = "";

  if (file.mimetype === "application/pdf") {
    text = await readPdf(file.path);
  } else if (["image/jpeg", "image/png"].includes(file.mimetype)) {
    text = await readImage(file.path);
  }

  return {
    text,
    amount: extractAmount(text),
    due_date: extractDate(text),
    vendor: extractVendor(text)
  };
}

module.exports = {
  extractDocumentData
};
