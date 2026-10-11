const { Pool } = require("pg");
require("dotenv").config();

let pool = null;

const getDatabaseUrl = () => {
   let url = process.env.DATABASE_URL || "";
   if (!url) {
      const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
      if (PGHOST && PGUSER && PGDATABASE) {
         url = `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD || "")}@${PGHOST}:${PGPORT || 5432}/${PGDATABASE}`;
      }
   }
   if (!url) {
      throw new Error("DATABASE_URL is not set");
   }
   // Supabase and most cloud Postgres require SSL (libpq-compat for pg v8+)
   if (!/[?&]sslmode=/.test(url)) {
      const sep = url.includes("?") ? "&" : "?";
      url += `${sep}sslmode=require&uselibpqcompat=true`;
   } else if (!/[?&]uselibpqcompat=/.test(url)) {
      url += "&uselibpqcompat=true";
   }
   return url;
};

const getPool = () => {
   if (pool) return pool;

   pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 10,
   });

   pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL pool error:", err.message);
   });

   return pool;
};

const query = (text, params) => getPool().query(text, params);

const endPool = async () => {
   if (pool) {
      await pool.end();
      pool = null;
   }
};

module.exports = { getPool, getDatabaseUrl, query, endPool };
