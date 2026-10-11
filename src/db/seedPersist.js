const { upsertDoc, deleteById, fetchAll } = require("../config/pgDb");
const { SCHEMAS } = require("./schema.map");
const { query } = require("../config/pool");

/** Replace all rows in a collection with the given documents. */
const replaceCollection = async (name, docs) => {
   const schema = SCHEMAS[name];
   if (!schema) throw new Error(`Unknown collection ${name}`);

   // Delete children then parents
   for (const child of schema.children || []) {
      await query(`DELETE FROM ${child.table}`);
   }
   await query(`DELETE FROM ${schema.table}`);

   for (const doc of docs) {
      if (!doc?._id) throw new Error(`Missing _id in ${name}`);
      await upsertDoc(name, doc);
   }
};

/** Upsert documents without deleting existing rows. */
const upsertCollection = async (name, docs) => {
   for (const doc of docs) {
      if (!doc?._id) throw new Error(`Missing _id in ${name}`);
      await upsertDoc(name, doc);
   }
};

const replaceMany = async (payload) => {
   for (const [name, docs] of Object.entries(payload)) {
      await replaceCollection(name, Array.isArray(docs) ? docs : []);
   }
};

module.exports = { replaceCollection, upsertCollection, replaceMany, fetchAll, deleteById };
