require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool, endPool } = require("../src/config/pool");
const { COLLECTIONS } = require("../src/config/collections");
const { SCHEMAS } = require("../src/db/schema.map");
const { fetchAll } = require("../src/config/pgDb");

const ROOT = path.join(__dirname, "..");

const main = async () => {
   let source = null;
   for (const file of ["db.json", "db.json.backup"]) {
      const p = path.join(ROOT, file);
      if (fs.existsSync(p)) {
         source = JSON.parse(fs.readFileSync(p, "utf-8"));
         console.log("Comparing against", p);
         break;
      }
   }

   let failed = false;
   for (const name of COLLECTIONS) {
      if (!SCHEMAS[name]) continue;
      const docs = await fetchAll(name);
      const dbCount = docs.length;
      if (source) {
         const srcCount = Array.isArray(source[name]) ? source[name].length : 0;
         const ok = dbCount === srcCount;
         if (!ok) failed = true;
         console.log(`${ok ? "OK" : "FAIL"} ${name}: source=${srcCount} db=${dbCount}`);
      } else {
         console.log(`${name}: ${dbCount}`);
      }
   }

   // Spot-check accounts has typed columns
   const pool = getPool();
   const cols = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='public' AND table_name='accounts'
       ORDER BY ordinal_position`,
   );
   console.log(
      "accounts columns:",
      cols.rows.map((r) => r.column_name).join(", "),
   );
   if (cols.rows.some((r) => r.column_name === "doc")) {
      console.error("FAIL: accounts still has doc column");
      failed = true;
   }
   if (!cols.rows.some((r) => r.column_name === "code")) {
      console.error("FAIL: accounts missing code column");
      failed = true;
   }

   await endPool();
   if (failed) process.exit(1);
   console.log("Relational verify OK");
};

main().catch(async (e) => {
   console.error(e);
   try {
      await endPool();
   } catch (_) {}
   process.exit(1);
});
