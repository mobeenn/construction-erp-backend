/**
 * Cut over JSONB (id+doc) tables → fully relational typed tables + children.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool, endPool } = require("../src/config/pool");
const { COLLECTIONS } = require("../src/config/collections");
const { SCHEMAS } = require("../src/db/schema.map");
const {
   docToParentRow,
   extractChildren,
   newId,
} = require("../src/db/relational");

const ROOT = path.join(__dirname, "..");

const tableExists = async (pool, name) => {
   const r = await pool.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1`,
      [name],
   );
   return r.rowCount > 0;
};

const hasDocColumn = async (pool, name) => {
   const r = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'doc'`,
      [name],
   );
   return r.rowCount > 0;
};

const loadSourceDocs = async () => {
   const source = {};

   // Prefer local dump (reliable; avoids dozens of remote probes)
   for (const file of ["db.json", "db.json.backup"]) {
      const p = path.join(ROOT, file);
      if (fs.existsSync(p)) {
         const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
         for (const name of COLLECTIONS) {
            source[name] = Array.isArray(raw[name]) ? raw[name] : [];
         }
         return { source, from: p };
      }
   }

   throw new Error("No db.json / db.json.backup source found");
};

const renameJsonbAside = async (pool) => {
   // One catalog query instead of N round-trips
   const r = await pool.query(
      `SELECT t.table_name
       FROM information_schema.tables t
       JOIN information_schema.columns c
         ON c.table_schema = t.table_schema AND c.table_name = t.table_name
       WHERE t.table_schema = 'public' AND c.column_name = 'doc'`,
   );
   const withDoc = new Set(r.rows.map((row) => row.table_name));

   for (const name of COLLECTIONS) {
      if (!withDoc.has(name)) continue;
      const legacy = `${name}_legacy_jsonb`;
      if (withDoc.has(legacy) || (await tableExists(pool, legacy))) {
         await pool.query(`DROP TABLE IF EXISTS "${legacy}" CASCADE`);
      }
      await pool.query(`ALTER TABLE "${name}" RENAME TO "${legacy}"`);
      console.log(`Renamed ${name} → ${legacy}`);
   }

   // Also drop leftover camelCase JSONB-less conflicts if any
   for (const name of COLLECTIONS) {
      const schema = SCHEMAS[name];
      if (!schema) continue;
      // If old camelCase table still exists and equals snake name, already handled.
      // Drop non-legacy camelCase tables that would block nothing (snake differs).
      if (name !== schema.table && (await tableExists(pool, name))) {
         await pool.query(`DROP TABLE IF EXISTS "${name}" CASCADE`);
         console.log(`Dropped leftover ${name}`);
      }
   }
};

const dropRelationalIfExists = async (pool) => {
   // Drop children first, then parents (reverse dependency order rough)
   const childTables = [];
   const parentTables = [];
   for (const schema of Object.values(SCHEMAS)) {
      parentTables.push(schema.table);
      for (const c of schema.children || []) childTables.push(c.table);
   }
   for (const t of childTables) {
      await pool.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
   }
   for (const t of parentTables) {
      await pool.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
   }
};

const applyRelationalSchema = async (pool) => {
   const sql = fs.readFileSync(
      path.join(ROOT, "src", "db", "schema.relational.sql"),
      "utf-8",
   );
   await pool.query(sql);
   console.log("Applied schema.relational.sql");
};

const insertRow = async (client, table, row) => {
   const keys = Object.keys(row);
   const cols = keys.map((k) => k).join(", ");
   const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
   await client.query(
      `INSERT INTO ${table} (${cols}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${keys
          .filter((k) => k !== "id")
          .map((k) => `${k} = EXCLUDED.${k}`)
          .join(", ")}`,
      keys.map((k) => row[k]),
   );
};

const migrateCollection = async (client, collection, docs) => {
   const schema = SCHEMAS[collection];
   if (!schema) throw new Error(`No schema for ${collection}`);

   let childCounts = {};
   for (const doc of docs) {
      if (!doc._id) doc._id = newId();
      const parent = docToParentRow(collection, doc);
      await insertRow(client, schema.table, parent);

      const children = extractChildren(collection, doc);
      for (const { child, rows } of children) {
         childCounts[child.table] = (childCounts[child.table] || 0) + rows.length;
         for (const row of rows) {
            await insertRow(client, child.table, row);
         }
      }
   }

   return { parent: docs.length, children: childCounts };
};

const countTable = async (pool, table) => {
   const r = await pool.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
   return r.rows[0].c;
};

const expectedChildCounts = (collection, docs) => {
   const schema = SCHEMAS[collection];
   const expected = {};
   for (const child of schema.children || []) {
      expected[child.table] = 0;
   }
   for (const doc of docs) {
      const extracted = extractChildren(collection, { ...doc, _id: doc._id || "x" });
      for (const { child, rows } of extracted) {
         expected[child.table] = (expected[child.table] || 0) + rows.length;
      }
   }
   return expected;
};

const dropLegacy = async (pool) => {
   const r = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name LIKE '%\\_legacy\\_jsonb' ESCAPE '\\'`,
   );
   for (const row of r.rows) {
      await pool.query(`DROP TABLE IF EXISTS "${row.table_name}" CASCADE`);
      console.log("Dropped legacy", row.table_name);
   }
};

const restoreLegacy = async (pool) => {
   console.log("Restoring JSONB legacy tables after failure...");
   await dropRelationalIfExists(pool);
   for (const name of COLLECTIONS) {
      const legacy = `${name}_legacy_jsonb`;
      if (await tableExists(pool, legacy)) {
         if (await tableExists(pool, name)) {
            await pool.query(`DROP TABLE IF EXISTS "${name}" CASCADE`);
         }
         await pool.query(`ALTER TABLE "${legacy}" RENAME TO "${name}"`);
         console.log(`Restored ${legacy} → ${name}`);
      }
   }
};

const main = async () => {
   const pool = getPool();
   const keepLegacy = process.argv.includes("--keep-legacy");

   console.log("Loading source documents...");
   const { source, from } = await loadSourceDocs();
   console.log("Source:", from);
   for (const name of Object.keys(SCHEMAS)) {
      console.log(`  ${name}: ${(source[name] || []).length}`);
   }

   console.log("Moving JSONB tables aside...");
   await renameJsonbAside(pool);

   console.log("Recreating relational tables...");
   await dropRelationalIfExists(pool);
   await applyRelationalSchema(pool);

   const client = await pool.connect();
   let failed = false;
   const report = [];

   try {
      await client.query("BEGIN");

      for (const collection of Object.keys(SCHEMAS)) {
         const docs = source[collection] || [];
         await migrateCollection(client, collection, docs);
         const dbParent = await countTable(client, SCHEMAS[collection].table);
         const expChildren = expectedChildCounts(collection, docs);
         let childrenOk = true;
         const childReport = {};
         for (const [table, exp] of Object.entries(expChildren)) {
            const actual = await countTable(client, table);
            childReport[table] = { expected: exp, actual };
            if (actual !== exp) childrenOk = false;
         }
         const ok = dbParent === docs.length && childrenOk;
         if (!ok) failed = true;
         report.push({
            collection,
            source: docs.length,
            db: dbParent,
            children: childReport,
            ok,
         });
         console.log(
            `${ok ? "OK" : "FAIL"} ${collection}: parent ${docs.length}->${dbParent}`,
            Object.keys(childReport).length ? JSON.stringify(childReport) : "",
         );
      }

      if (failed) {
         await client.query("ROLLBACK");
         console.error("Normalization FAILED — rolled back inserts.");
      } else {
         await client.query("COMMIT");
         console.log("Normalization COMMITTED.");
      }
   } catch (err) {
      try {
         await client.query("ROLLBACK");
      } catch (_) {}
      client.release();
      await restoreLegacy(pool);
      throw err;
   }
   client.release();

   if (failed) {
      await restoreLegacy(pool);
   } else if (!keepLegacy) {
      await dropLegacy(pool);
   } else {
      console.log("Kept *_legacy_jsonb tables (--keep-legacy)");
   }

   console.log("\n--- Summary ---");
   console.table(
      report.map((r) => ({
         collection: r.collection,
         source: r.source,
         db: r.db,
         ok: r.ok,
      })),
   );

   await endPool();
   if (failed) process.exit(1);
   console.log("Relational normalization PASSED.");
};

main().catch(async (err) => {
   console.error(err);
   try {
      await endPool();
   } catch (_) {}
   process.exit(1);
});
