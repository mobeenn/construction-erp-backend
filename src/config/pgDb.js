const { query, getPool } = require("./pool");
const { COLLECTIONS } = require("./collections");
const { SCHEMAS } = require("../db/schema.map");
const {
   newId,
   docToParentRow,
   parentRowToDoc,
   extractChildren,
   attachChildrenToDoc,
   coerceValue,
} = require("../db/relational");

/*
|--------------------------------------------------------------------------
| PostgreSQL Relational Database Layer
|--------------------------------------------------------------------------
| Typed columns + child tables. Keeps Mongoose-like Model API for services.
*/

const getSchema = (collection) => {
   const schema = SCHEMAS[collection];
   if (!schema) throw new Error(`Unknown collection: ${collection}`);
   return schema;
};

const tableName = (collection) => getSchema(collection).table;

const isDateLike = (v) =>
   v instanceof Date ||
   (typeof v === "string" && v.length >= 10 && !isNaN(Date.parse(v)));

const toComparable = (v) => (isDateLike(v) ? Date.parse(v) : v);

const matchCondition = (value, condition) => {
   if (
      condition !== null &&
      typeof condition === "object" &&
      !(condition instanceof Date) &&
      !Array.isArray(condition)
   ) {
      const keys = Object.keys(condition);
      const isOperator = keys.some((k) => k.startsWith("$"));

      if (isOperator) {
         for (const key of keys) {
            const expected = condition[key];
            if (key === "$gte" && !(toComparable(value) >= toComparable(expected))) return false;
            if (key === "$lte" && !(toComparable(value) <= toComparable(expected))) return false;
            if (key === "$gt" && !(toComparable(value) > toComparable(expected))) return false;
            if (key === "$lt" && !(toComparable(value) < toComparable(expected))) return false;
            if (key === "$ne" && value === expected) return false;
            if (key === "$in" && !expected.includes(value)) return false;
            if (key === "$regex") {
               const re = new RegExp(expected, condition.$options || "");
               if (!re.test(value == null ? "" : String(value))) return false;
            }
            if (key === "$options") continue;
         }
         return true;
      }
   }

   if (value === condition) return true;
   if (isDateLike(value) && isDateLike(condition)) {
      return Date.parse(value) === Date.parse(condition);
   }
   if (value && typeof value === "object" && value._id && String(value._id) === String(condition)) {
      return true;
   }
   if (value != null && condition != null && String(value) === String(condition)) {
      return true;
   }
   return false;
};

const matchDoc = (doc, filter = {}) =>
   Object.keys(filter).every((key) => matchCondition(doc[key], filter[key]));

const applySelect = (doc, select) => {
   if (!select) return doc;
   const fields = select.split(/\s+/).filter(Boolean);
   if (fields.length === 0) return doc;
   if (fields.every((f) => f.startsWith("-"))) {
      const clone = { ...doc };
      fields.forEach((f) => delete clone[f.slice(1)]);
      return clone;
   }
   const clone = { _id: doc._id };
   fields.forEach((f) => {
      if (f in doc) clone[f] = doc[f];
   });
   return clone;
};

const loadChildrenForIds = async (collection, ids) => {
   const schema = getSchema(collection);
   const byParent = {};
   for (const id of ids) {
      byParent[id] = {};
      for (const child of schema.children || []) {
         byParent[id][child.apiKey] = [];
      }
   }
   if (!ids.length || !(schema.children || []).length) return byParent;

   for (const child of schema.children || []) {
      const r = await query(
         `SELECT * FROM ${child.table} WHERE ${child.parentKey} = ANY($1::text[]) ORDER BY sort_order ASC`,
         [ids],
      );
      for (const row of r.rows) {
         const pid = row[child.parentKey];
         if (!byParent[pid]) byParent[pid] = {};
         if (!byParent[pid][child.apiKey]) byParent[pid][child.apiKey] = [];
         byParent[pid][child.apiKey].push(row);
      }
   }
   return byParent;
};

const fetchAll = async (collection) => {
   const schema = getSchema(collection);
   const r = await query(`SELECT * FROM ${schema.table}`);
   const docs = r.rows.map((row) => parentRowToDoc(collection, row));
   const ids = docs.map((d) => d._id);
   const children = await loadChildrenForIds(collection, ids);
   return docs.map((d) => attachChildrenToDoc(collection, d, children[d._id] || {}));
};

const fetchById = async (collection, id) => {
   const schema = getSchema(collection);
   const r = await query(`SELECT * FROM ${schema.table} WHERE id = $1`, [String(id)]);
   if (!r.rows[0]) return null;
   const doc = parentRowToDoc(collection, r.rows[0]);
   const children = await loadChildrenForIds(collection, [doc._id]);
   return attachChildrenToDoc(collection, doc, children[doc._id] || {});
};

const writeChildren = async (client, collection, doc) => {
   const schema = getSchema(collection);
   const extracted = extractChildren(collection, doc);
   for (const { child, rows } of extracted) {
      await client.query(`DELETE FROM ${child.table} WHERE ${child.parentKey} = $1`, [
         String(doc._id),
      ]);
      for (const row of rows) {
         const keys = Object.keys(row);
         await client.query(
            `INSERT INTO ${child.table} (${keys.join(", ")}) VALUES (${keys
               .map((_, i) => `$${i + 1}`)
               .join(", ")})`,
            keys.map((k) => row[k]),
         );
      }
   }
};

const upsertDoc = async (collection, doc) => {
   const schema = getSchema(collection);
   if (!doc._id) doc._id = newId();
   const parent = docToParentRow(collection, doc);
   const keys = Object.keys(parent);
   const pool = getPool();
   const client = await pool.connect();
   try {
      await client.query("BEGIN");
      await client.query(
         `INSERT INTO ${schema.table} (${keys.join(", ")})
          VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")})
          ON CONFLICT (id) DO UPDATE SET ${keys
             .filter((k) => k !== "id")
             .map((k) => `${k} = EXCLUDED.${k}`)
             .join(", ")}`,
         keys.map((k) => parent[k]),
      );
      await writeChildren(client, collection, { ...doc, _id: parent.id });
      await client.query("COMMIT");
   } catch (e) {
      await client.query("ROLLBACK");
      throw e;
   } finally {
      client.release();
   }
   return fetchById(collection, parent.id);
};

const deleteById = async (collection, id) => {
   const existing = await fetchById(collection, id);
   if (!existing) return null;
   const schema = getSchema(collection);
   const pool = getPool();
   const client = await pool.connect();
   try {
      await client.query("BEGIN");
      for (const child of schema.children || []) {
         await client.query(`DELETE FROM ${child.table} WHERE ${child.parentKey} = $1`, [
            String(id),
         ]);
      }
      await client.query(`DELETE FROM ${schema.table} WHERE id = $1`, [String(id)]);
      await client.query("COMMIT");
   } catch (e) {
      await client.query("ROLLBACK");
      throw e;
   } finally {
      client.release();
   }
   return existing;
};

const attachSave = (doc, collectionName) => {
   if (!doc) return doc;
   Object.defineProperty(doc, "save", {
      enumerable: false,
      configurable: true,
      writable: true,
      value: async function () {
         const plain = {};
         Object.keys(this).forEach((k) => {
            plain[k] = this[k];
         });
         plain.updatedAt = new Date().toISOString();
         const saved = await upsertDoc(collectionName, plain);
         Object.keys(this).forEach((k) => delete this[k]);
         Object.assign(this, saved);
         return saved;
      },
   });
   return doc;
};

class Query {
   constructor(collectionName, modelMeta, filter = {}, single = false) {
      this._collection = collectionName;
      this._model = modelMeta;
      this._filter = filter;
      this._single = single;
      this._populates = [];
      this._sortSpec = null;
      this._skipN = 0;
      this._limitN = null;
      this._selectStr = null;
      this._byId = null;
   }

   static byId(collectionName, modelMeta, id) {
      const q = new Query(collectionName, modelMeta, {}, true);
      q._byId = id;
      return q;
   }

   populate(path, select = "") {
      this._populates.push([path, select]);
      return this;
   }

   sort(spec) {
      this._sortSpec = spec;
      return this;
   }

   skip(n) {
      this._skipN = n;
      return this;
   }

   limit(n) {
      this._limitN = n;
      return this;
   }

   select(str) {
      this._selectStr = str;
      return this;
   }

   async _exec() {
      let docs;
      if (this._byId != null) {
         const one = await fetchById(this._collection, this._byId);
         docs = one ? [one] : [];
      } else {
         docs = await fetchAll(this._collection);
         docs = docs.filter((d) => matchDoc(d, this._filter));
      }

      docs = docs.map((d) => ({ ...d }));

      for (const [path, select] of this._populates) {
         const refCollection = this._model.refs[path];
         if (!refCollection) continue;
         const ids = [
            ...new Set(
               docs
                  .map((doc) => doc[path])
                  .filter((id) => id && typeof id !== "object")
                  .map(String),
            ),
         ];
         const refMap = {};
         await Promise.all(
            ids.map(async (id) => {
               const target = await fetchById(refCollection, id);
               if (target) refMap[id] = target;
            }),
         );
         for (const doc of docs) {
            const id = doc[path];
            if (!id || typeof id === "object") continue;
            const target = refMap[String(id)];
            if (target) {
               doc[path] = applySelect(
                  { ...target },
                  select ? `${select} _id`.trim() : null,
               );
            }
         }
      }

      if (this._sortSpec) {
         const entries =
            typeof this._sortSpec === "string"
               ? [[this._sortSpec.replace(/^-/, ""), this._sortSpec.startsWith("-") ? -1 : 1]]
               : Object.entries(this._sortSpec);
         docs.sort((a, b) => {
            for (const [key, dir] of entries) {
               const av = toComparable(a[key]);
               const bv = toComparable(b[key]);
               if (av === bv || av === undefined || bv === undefined) continue;
               return (av > bv ? 1 : -1) * (dir === -1 ? -1 : 1);
            }
            return 0;
         });
      }

      if (this._skipN) docs = docs.slice(this._skipN);
      if (this._limitN != null) docs = docs.slice(0, this._limitN);
      if (this._selectStr) docs = docs.map((d) => applySelect(d, this._selectStr));
      docs = docs.map((d) => attachSave(d, this._collection));
      return this._single ? docs[0] || null : docs;
   }

   then(resolve, reject) {
      return this._exec().then(resolve, reject);
   }

   catch(reject) {
      return this._exec().catch(reject);
   }
}

const model = (collection, { defaults = {}, refs = {} } = {}) => {
   const collectionName = collection;
   const meta = { collection: collectionName, refs };

   return {
      collection: collectionName,
      refs,

      find(filter = {}) {
         return new Query(collectionName, meta, filter, false);
      },

      findOne(filter = {}) {
         return new Query(collectionName, meta, filter, true).limit(1);
      },

      findById(id) {
         return Query.byId(collectionName, meta, id);
      },

      async create(data) {
         const doc = { ...data };
         Object.keys(defaults).forEach((key) => {
            if (doc[key] === undefined) {
               doc[key] =
                  typeof defaults[key] === "function" ? defaults[key]() : defaults[key];
            }
         });
         if (!doc._id) doc._id = newId();
         if (!doc.createdAt) doc.createdAt = new Date().toISOString();
         doc.updatedAt = doc.createdAt;
         const saved = await upsertDoc(collectionName, doc);
         return attachSave(saved, collectionName);
      },

      async findByIdAndUpdate(id, update, opts = {}) {
         const existing = await fetchById(collectionName, id);
         if (!existing) return null;
         const updated = {
            ...existing,
            ...update,
            _id: existing._id,
            updatedAt: new Date().toISOString(),
         };
         const saved = await upsertDoc(collectionName, updated);
         if (opts.new === false) return attachSave(existing, collectionName);
         return attachSave(saved, collectionName);
      },

      async findByIdAndDelete(id) {
         return deleteById(collectionName, id);
      },

      async countDocuments(filter = {}) {
         // Empty filter: cheap SQL COUNT instead of loading every row into memory
         if (!filter || Object.keys(filter).length === 0) {
            const schema = getSchema(collectionName);
            const result = await query(`SELECT COUNT(*)::int AS count FROM ${schema.table}`);
            return result.rows[0].count;
         }
         const docs = await fetchAll(collectionName);
         return docs.filter((d) => matchDoc(d, filter)).length;
      },

      async aggregate(pipeline = []) {
         let docs = await fetchAll(collectionName);
         for (const stage of pipeline) {
            if (stage.$match) docs = docs.filter((d) => matchDoc(d, stage.$match));
            if (stage.$group) {
               const groups = {};
               for (const doc of docs) {
                  const idExpr = stage.$group._id;
                  const key =
                     idExpr === null || idExpr === undefined
                        ? null
                        : typeof idExpr === "string" && idExpr.startsWith("$")
                          ? doc[idExpr.slice(1)]
                          : idExpr;
                  const gKey = String(key);
                  if (!groups[gKey]) groups[gKey] = { _id: key };
                  for (const [outKey, agg] of Object.entries(stage.$group)) {
                     if (outKey === "_id") continue;
                     if (agg.$sum) {
                        const fieldName = String(agg.$sum).replace(/^\$/, "");
                        groups[gKey][outKey] =
                           (groups[gKey][outKey] || 0) + (doc[fieldName] || 0);
                     }
                  }
               }
               docs = Object.values(groups);
            }
         }
         return docs;
      },
   };
};

const getCollectionCounts = async () => {
   const counts = {};
   for (const name of COLLECTIONS) {
      if (!SCHEMAS[name]) continue;
      const result = await query(`SELECT COUNT(*)::int AS count FROM ${tableName(name)}`);
      counts[name] = result.rows[0].count;
   }
   return counts;
};

module.exports = {
   model,
   COLLECTIONS,
   fetchAll,
   fetchById,
   upsertDoc,
   deleteById,
   getCollectionCounts,
   tableName,
   coerceValue,
};
