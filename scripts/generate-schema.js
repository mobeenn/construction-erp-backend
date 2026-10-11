const fs = require("fs");
const path = require("path");
const { COLLECTIONS } = require("../src/config/collections");

const parts = COLLECTIONS.map(
   (c) => `CREATE TABLE IF NOT EXISTS "${c}" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "${c}_doc_gin" ON "${c}" USING GIN (doc);`,
).join("\n\n");

const out = path.join(__dirname, "..", "src", "db", "schema.sql");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
   out,
   `-- BuildFlow ERP PostgreSQL schema (JSONB document store)
-- One table per former jsonDb collection

${parts}
`,
   "utf-8",
);
console.log("Wrote", COLLECTIONS.length, "tables to", out);
