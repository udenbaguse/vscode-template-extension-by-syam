const fs = require("fs");
const path = require("path");

function loadDocs() {
  // Saat dibundle ke out/extension.js, `__dirname` akan mengarah ke folder bundel.
  const docsJsonPath = path.join(__dirname, "docs", "docs.json");

  // Prefer file gabungan (lebih cepat)
  if (fs.existsSync(docsJsonPath)) {
    return JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));
  }

  // Fallback: load semua file json jika docs.json belum tersedia
  const docsDir = path.join(__dirname, "docs");
  if (!fs.existsSync(docsDir)) return {};

  const files = fs.readdirSync(docsDir);
  const allDocs = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(docsDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

    Object.assign(allDocs, json);
  }

  return allDocs;
}

module.exports = loadDocs;
