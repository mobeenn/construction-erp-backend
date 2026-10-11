const fs = require("fs");
const path = require("path");
const { SCHEMAS, sqlType } = require("../src/db/schema.map");

const parts = [];
parts.push(`-- BuildFlow ERP — fully relational schema (snake_case)
-- Generated from src/db/schema.map.js
-- Do not edit by hand; regenerate with: node scripts/generate-relational-schema.js
`);

for (const schema of Object.values(SCHEMAS)) {
   const cols = [
      "  id TEXT PRIMARY KEY",
      ...schema.columns.map((c) => `  ${c.db} ${sqlType(c.type)}`),
   ];
   parts.push(`CREATE TABLE IF NOT EXISTS ${schema.table} (
${cols.join(",\n")}
);`);

   for (const child of schema.children || []) {
      const childCols = [
         "  id TEXT PRIMARY KEY",
         `  ${child.parentKey} TEXT NOT NULL`,
         ...child.columns.map((c) => `  ${c.db} ${sqlType(c.type)}`),
         "  sort_order INTEGER DEFAULT 0",
      ];
      parts.push(`CREATE TABLE IF NOT EXISTS ${child.table} (
${childCols.join(",\n")}
);
CREATE INDEX IF NOT EXISTS idx_${child.table}_${child.parentKey} ON ${child.table} (${child.parentKey});`);
   }
}

const out = path.join(__dirname, "..", "src", "db", "schema.relational.sql");
fs.writeFileSync(out, parts.join("\n\n") + "\n", "utf-8");
console.log("Wrote", out);
console.log(
   "Tables:",
   Object.values(SCHEMAS).reduce(
      (n, s) => n + 1 + (s.children || []).length,
      0,
   ),
);
