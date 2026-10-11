require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool, endPool } = require("../src/config/pool");

const main = async () => {
   // Prefer relational schema
   const relational = path.join(__dirname, "..", "src", "db", "schema.relational.sql");
   const legacy = path.join(__dirname, "..", "src", "db", "schema.sql");
   const schemaPath = fs.existsSync(relational) ? relational : legacy;
   const sql = fs.readFileSync(schemaPath, "utf-8");
   const pool = getPool();
   await pool.query(sql);
   console.log("Schema applied:", schemaPath);
   await endPool();
};

main().catch(async (err) => {
   console.error(err);
   try {
      await endPool();
   } catch (_) {}
   process.exit(1);
});
