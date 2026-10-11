const crypto = require("crypto");
const { SCHEMAS } = require("./schema.map");

const newId = () => crypto.randomBytes(12).toString("hex");

const coerceValue = (value, type) => {
   if (value === undefined) return null;
   if (value === null) return null;

   if (type === "boolean") {
      if (typeof value === "boolean") return value;
      if (value === "true" || value === 1) return true;
      if (value === "false" || value === 0) return false;
      return Boolean(value);
   }

   if (type === "numeric") {
      if (value === "" || value === null) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
   }

   if (type === "timestamptz") {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
   }

   if (type === "jsonb") {
      return typeof value === "string" ? value : JSON.stringify(value ?? null);
   }

   // text / ids — unwrap populated objects
   if (typeof value === "object" && value !== null) {
      if (value._id != null) return String(value._id);
      return null;
   }

   return value === undefined ? null : value;
};

const isIdArrayChild = (schema, child) => {
   if (schema.idArrayChildren === true) return true;
   if (Array.isArray(schema.idArrayChildren)) {
      return schema.idArrayChildren.includes(child.apiKey);
   }
   // single-column children named value / with only one text col storing scalar
   return (
      child.columns.length === 1 &&
      (child.columns[0].api === "value" || child.columns[0].db.endsWith("_id"))
   );
};

/** Expand payroll totals object into flat api fields before write. */
const expandOutgoing = (collection, doc) => {
   const schema = SCHEMAS[collection];
   if (!schema?.expandObject) return { ...doc };
   const out = { ...doc };
   const { apiKey, fields } = schema.expandObject;
   const obj = out[apiKey];
   if (obj && typeof obj === "object") {
      for (const [objKey, apiField] of Object.entries(fields)) {
         if (out[apiField] === undefined && obj[objKey] !== undefined) {
            out[apiField] = obj[objKey];
         }
      }
   }
   delete out[apiKey];
   return out;
};

/** Collapse flat totals_* fields into totals object on read. */
const collapseIncoming = (collection, doc) => {
   const schema = SCHEMAS[collection];
   if (!schema?.expandObject) return doc;
   const { apiKey, fields } = schema.expandObject;
   const obj = {};
   let any = false;
   for (const [objKey, apiField] of Object.entries(fields)) {
      if (doc[apiField] !== undefined && doc[apiField] !== null) {
         obj[objKey] = doc[apiField];
         any = true;
      }
      delete doc[apiField];
   }
   if (any) doc[apiKey] = obj;
   else doc[apiKey] = doc[apiKey] || {};
   return doc;
};

const docToParentRow = (collection, doc) => {
   const schema = SCHEMAS[collection];
   const expanded = expandOutgoing(collection, doc);
   const id = String(expanded._id || newId());
   const row = { id };
   for (const c of schema.columns) {
      row[c.db] = coerceValue(expanded[c.api], c.type);
   }
   // ensure timestamps
   if (row.created_at == null && expanded.createdAt) {
      row.created_at = coerceValue(expanded.createdAt, "timestamptz");
   }
   if (row.updated_at == null) {
      row.updated_at = coerceValue(expanded.updatedAt || expanded.createdAt || new Date().toISOString(), "timestamptz");
   }
   return row;
};

const parentRowToDoc = (collection, row) => {
   const schema = SCHEMAS[collection];
   const doc = { _id: row.id };
   for (const c of schema.columns) {
      let v = row[c.db];
      if (c.type === "numeric" && v != null) v = Number(v);
      if (c.type === "timestamptz" && v instanceof Date) v = v.toISOString();
      if (c.type === "jsonb" && typeof v === "string") {
         try {
            v = JSON.parse(v);
         } catch (_) {}
      }
      doc[c.api] = v;
   }
   return collapseIncoming(collection, doc);
};

/**
 * Extract child rows from a document.
 * Returns [{ table, parentKey, parentId, rows: [{id, ...dbCols, sort_order}] }]
 */
const extractChildren = (collection, doc) => {
   const schema = SCHEMAS[collection];
   const parentId = String(doc._id);
   const result = [];

   for (const child of schema.children || []) {
      let items = Array.isArray(doc[child.apiKey]) ? doc[child.apiKey] : null;

      // Fallback: flat materialName/quantity on MR/MI → one item row
      if (
         (!items || items.length === 0) &&
         schema.flattenItemsFallback &&
         child.apiKey === "items" &&
         (doc.materialName != null || doc.quantity != null)
      ) {
         items = [
            {
               materialName: doc.materialName,
               quantity: doc.quantity,
               unit: doc.unit,
               inventory: doc.inventory,
            },
         ];
      }

      if (!items) items = [];

      const idArray = isIdArrayChild(schema, child);
      const rows = items.map((item, index) => {
         const childId = newId();
         const row = {
            id: childId,
            [child.parentKey]: parentId,
            sort_order: index,
         };

         if (idArray) {
            const scalar =
               typeof item === "object" && item !== null
                  ? item._id ?? item.value ?? item.id
                  : item;
            const only = child.columns[0];
            row[only.db] = coerceValue(scalar, only.type);
         } else if (typeof item === "object" && item !== null) {
            for (const c of child.columns) {
               row[c.db] = coerceValue(item[c.api], c.type);
            }
         }
         return row;
      });

      result.push({ child, rows });
   }

   return result;
};

/** Attach child arrays onto a parent doc. */
const attachChildrenToDoc = (collection, doc, childrenByKey) => {
   const schema = SCHEMAS[collection];
   for (const child of schema.children || []) {
      const rows = childrenByKey[child.apiKey] || [];
      const idArray = isIdArrayChild(schema, child);

      if (idArray) {
         const only = child.columns[0];
         doc[child.apiKey] = rows
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((r) => r[only.db])
            .filter((v) => v != null);
      } else {
         doc[child.apiKey] = rows
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((r) => {
               const obj = {};
               for (const c of child.columns) {
                  let v = r[c.db];
                  if (c.type === "numeric" && v != null) v = Number(v);
                  if (c.type === "timestamptz" && v instanceof Date) v = v.toISOString();
                  obj[c.api] = v;
               }
               return obj;
            });
      }
   }

   // Ensure defaults for known array fields
   for (const child of schema.children || []) {
      if (doc[child.apiKey] === undefined) doc[child.apiKey] = [];
   }

   return doc;
};

module.exports = {
   newId,
   coerceValue,
   docToParentRow,
   parentRowToDoc,
   extractChildren,
   attachChildrenToDoc,
   expandOutgoing,
   collapseIncoming,
   isIdArrayChild,
   SCHEMAS,
};
