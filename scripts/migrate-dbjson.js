/**
 * Bootstrap schema and migrate backend/db.json (or db.json.backup) into Supabase Postgres.
 * Fails if any collection source count != destination count.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool, endPool } = require("../src/config/pool");
const { COLLECTIONS } = require("../src/config/collections");

const ROOT = path.join(__dirname, "..");
const SOURCE_CANDIDATES = [
   path.join(ROOT, "db.json"),
   path.join(ROOT, "db.json.backup"),
];

const findSource = () => {
   for (const p of SOURCE_CANDIDATES) {
      if (fs.existsSync(p)) return p;
   }
   throw new Error(`No source file found. Looked for: ${SOURCE_CANDIDATES.join(", ")}`);
};

const runSchema = async (pool) => {
   const schemaPath = path.join(ROOT, "src", "db", "schema.sql");
   const sql = fs.readFileSync(schemaPath, "utf-8");
   await pool.query(sql);
   console.log("Schema applied:", schemaPath);
};

const upsertCollection = async (pool, name, docs) => {
   const table = `"${name}"`;
   for (const doc of docs) {
      if (!doc || !doc._id) {
         throw new Error(`Document in ${name} missing _id`);
      }
      const id = String(doc._id);
      await pool.query(
         `INSERT INTO ${table} (id, doc, created_at, updated_at)
          VALUES ($1, $2::jsonb, $3, $4)
          ON CONFLICT (id) DO UPDATE SET
            doc = EXCLUDED.doc,
            updated_at = EXCLUDED.updated_at`,
         [id, JSON.stringify(doc), doc.createdAt || null, doc.updatedAt || null],
      );
   }
};

const countTable = async (pool, name) => {
   const result = await pool.query(`SELECT COUNT(*)::int AS count FROM "${name}"`);
   return result.rows[0].count;
};

const main = async () => {
   const sourcePath = findSource();
   console.log("Source:", sourcePath);

   const raw = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));
   const pool = getPool();

   await runSchema(pool);

   const report = [];
   let failed = false;

   for (const name of COLLECTIONS) {
      const docs = Array.isArray(raw[name]) ? raw[name] : [];
      await upsertCollection(pool, name, docs);
      const dbCount = await countTable(pool, name);
      const ok = dbCount === docs.length;
      if (!ok) failed = true;
      report.push({ collection: name, source: docs.length, db: dbCount, ok });
      console.log(
         `${ok ? "OK" : "FAIL"}  ${name}: source=${docs.length} db=${dbCount}`,
      );
   }

   console.log("\n--- Summary ---");
   console.table(report);

   await endPool();

   if (failed) {
      console.error("Migration verification FAILED — counts do not match.");
      process.exit(1);
   }

   console.log("Migration verification PASSED — all collection counts match.");
};

main().catch(async (err) => {
   console.error("Migration error:", err);
   try {
      await endPool();
   } catch (_) {
      /* ignore */
   }
   process.exit(1);
});
