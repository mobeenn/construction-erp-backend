const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| JSON File Database
|--------------------------------------------------------------------------
| A tiny MongoDB-compatible data layer backed by a single db.json file.
| Models expose: find, findOne, findById, create, findByIdAndUpdate,
| findByIdAndDelete, countDocuments, aggregate.
*/

const DB_PATH = path.join(__dirname, "..", "..", "db.json");

let cache = null;

const COLLECTIONS = [
   "users",
   "projects",
   "employees",
   "attendance",
   "inventory",
   "inventoryTransactions",
   "materialRequests",
   "materialIssues",
   "vendors",
   "purchaseOrders",
   "grns",
   "expenses",
   "clients",
   "contracts",
   "activities",
   "progressReports",
   "interimPayments",
   "documents",
   "progressUpdates",
   "budgets",
   "rfqs",
   "vendorQuotations",
   "warehouses",
   "stockTransfers",
   "stockAdjustments",
   "materialReturns",
   "dailyReports",
   "departments",
   "designations",
   "leaveRequests",
   "salaryStructures",
   "payrollPeriods",
   "payrollEntries",
   "permissionPolicies",
   "accountCategories",
   "accounts",
   "journalEntries",
   "journalEntryLines",
   "customerPayments",
   "vendorPayments",
   "cashAccounts",
   "bankAccounts",
   "notifications",
];

const load = () => {
   if (cache) return cache;

   if (!fs.existsSync(DB_PATH)) {
      cache = {};
      COLLECTIONS.forEach((c) => (cache[c] = []));
      persist();
      return cache;
   }

   cache = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

   COLLECTIONS.forEach((c) => {
      if (!Array.isArray(cache[c])) cache[c] = [];
   });

   return cache;
};

const persist = () => {
   fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), "utf-8");
};

const newId = () => crypto.randomBytes(12).toString("hex");

const isDateLike = (v) =>
   v instanceof Date ||
   (typeof v === "string" && v.length >= 10 && !isNaN(Date.parse(v)));

const toComparable = (v) => (isDateLike(v) ? Date.parse(v) : v);

/*
| Match a stored value against a query condition.
| Supports exact match and $gte/$lte/$gt/$lt/$ne/$in/$regex/$options.
*/
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
               const re = new RegExp(
                  expected,
                  condition.$options || "",
               );
               if (!re.test(value)) return false;
            }
            if (key === "$options") continue;
         }
         return true;
      }
   }

   if (value === condition) return true;

   // date strings / Date objects representing the same date
   if (isDateLike(value) && isDateLike(condition)) {
      return Date.parse(value) === Date.parse(condition);
   }

   // ObjectId-like comparison (string vs string) is covered above;
   // also allow comparing a stored id with a populated object's _id
   if (
      value &&
      typeof value === "object" &&
      value._id &&
      String(value._id) === String(condition)
   ) {
      return true;
   }

   return false;
};

const matchDoc = (doc, query = {}) => {
   return Object.keys(query).every((key) => matchCondition(doc[key], query[key]));
};

const applySelect = (doc, select) => {
   if (!select) return doc;

   const fields = select.split(/\s+/).filter(Boolean);

   if (fields.length === 0) return doc;

   // exclusion mode e.g. "-password"
   if (fields.every((f) => f.startsWith("-"))) {
      const clone = { ...doc };
      fields.forEach((f) => delete clone[f.slice(1)]);
      return clone;
   }

   // inclusion mode e.g. "name projectCode"
   const clone = { _id: doc._id };
   fields.forEach((f) => {
      if (f in doc) clone[f] = doc[f];
   });
   return clone;
};

const attachSave = (doc, collectionName) => {
   if (!doc) return doc;

   Object.defineProperty(doc, "save", {
      enumerable: false,
      configurable: true,
      writable: true,
      value: async function () {
         const rows = load()[collectionName];
         const index = rows.findIndex((r) => String(r._id) === String(this._id));

         const plain = {};
         Object.keys(this).forEach((k) => (plain[k] = this[k]));
         plain.updatedAt = new Date().toISOString();

         if (index >= 0) rows[index] = plain;
         else rows.push(plain);

         persist();
         return plain;
      },
   });

   return doc;
};

class Query {
   constructor(docs, model, single = false) {
      this._docs = docs;
      this._model = model;
      this._single = single;
      this._populates = [];
      this._sortSpec = null;
      this._skipN = 0;
      this._limitN = null;
      this._selectStr = null;
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

   _exec() {
      let docs = this._docs.map((d) => ({ ...d }));

      // populate
      for (const [path, select] of this._populates) {
         for (const doc of docs) {
            const refCollection = this._model.refs[path];
            if (!refCollection) continue;

            const id = doc[path];
            if (!id || typeof id === "object") continue;

            const target = load()[refCollection].find(
               (r) => String(r._id) === String(id),
            );

            if (target) {
               doc[path] = applySelect(
                  { ...target },
                  select ? `${select} _id`.trim() : null,
               );
            }
         }
      }

      // sort
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

      docs = docs.map((d) => attachSave(d, this._model.collection));

      return this._single ? docs[0] || null : docs;
   }

   then(resolve, reject) {
      return Promise.resolve(this._exec()).then(resolve, reject);
   }

   catch(reject) {
      return Promise.resolve(this._exec()).catch(reject);
   }
}

const model = (collection, { defaults = {}, refs = {} } = {}) => {
   const collectionName = collection;

   return {
      collection: collectionName,
      refs,

      find(query = {}) {
         return new Query(
            load()[collectionName].filter((d) => matchDoc(d, query)),
            { collection: collectionName, refs },
         );
      },

      findOne(query = {}) {
         return new Query(
            load()[collectionName].filter((d) => matchDoc(d, query)),
            { collection: collectionName, refs },
            true,
         ).limit(1);
      },

      findById(id) {
         return new Query(
            load()[collectionName].filter(
               (d) => String(d._id) === String(id),
            ),
            { collection: collectionName, refs },
            true,
         ).limit(1);
      },

      async create(data) {
         const doc = { ...data };

         Object.keys(defaults).forEach((key) => {
            if (doc[key] === undefined) {
               doc[key] =
                  typeof defaults[key] === "function"
                     ? defaults[key]()
                     : defaults[key];
            }
         });

         doc._id = newId();

         if (!doc.createdAt) doc.createdAt = new Date().toISOString();
         doc.updatedAt = doc.createdAt;

         load()[collectionName].push(doc);
         persist();

         return attachSave({ ...doc }, collectionName);
      },

      async findByIdAndUpdate(id, update, opts = {}) {
         const rows = load()[collectionName];
         const index = rows.findIndex((d) => String(d._id) === String(id));

         if (index < 0) return null;

         const updated = { ...rows[index], ...update, updatedAt: new Date().toISOString() };
         rows[index] = updated;
         persist();

         if (opts.new === false) return attachSave({ ...rows[index] }, collectionName);

         return attachSave({ ...updated }, collectionName);
      },

      async findByIdAndDelete(id) {
         const rows = load()[collectionName];
         const index = rows.findIndex((d) => String(d._id) === String(id));

         if (index < 0) return null;

         const [removed] = rows.splice(index, 1);
         persist();

         return removed;
      },

      async countDocuments(query = {}) {
         return load()[collectionName].filter((d) => matchDoc(d, query)).length;
      },

      async aggregate(pipeline = []) {
         let docs = [...load()[collectionName]];

         for (const stage of pipeline) {
            if (stage.$match) {
               docs = docs.filter((d) => matchDoc(d, stage.$match));
            }

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
                        groups[gKey][outKey] = (groups[gKey][outKey] || 0) + (doc[fieldName] || 0);
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

module.exports = { model, load, persist, DB_PATH };
