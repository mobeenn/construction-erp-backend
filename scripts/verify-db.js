/**
 * Verify Postgres collection counts against db.json / db.json.backup if present,
 * otherwise just print live counts.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool, endPool } = require("../src/config/pool");
const { COLLECTIONS } = require("../src/config/collections");

const ROOT = path.join(__dirname, "..");

const main = async () => {
   const pool = getPool();
   let source = null;
   for (const name of ["db.json", "db.json.backup"]) {
      const p = path.join(ROOT, name);
      if (fs.existsSync(p)) {
         source = JSON.parse(fs.readFileSync(p, "utf-8"));
         console.log("Comparing against", p);
         break;
      }
   }

   let failed = false;
   for (const name of COLLECTIONS) {
      const result = await pool.query(`SELECT COUNT(*)::int AS count FROM "${name}"`);
      const dbCount = result.rows[0].count;
      if (source) {
         const srcCount = Array.isArray(source[name]) ? source[name].length : 0;
         const ok = dbCount === srcCount;
         if (!ok) failed = true;
         console.log(`${ok ? "OK" : "FAIL"}  ${name}: source=${srcCount} db=${dbCount}`);
      } else {
         console.log(`${name}: ${dbCount}`);
      }
   }

   await endPool();
   if (source && failed) process.exit(1);
   console.log("Verify OK");
};

main().catch(async (err) => {
   console.error(err);
   try {
      await endPool();
   } catch (_) {}
   process.exit(1);
});
