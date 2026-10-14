const { Pool } = require("pg");
require("dotenv").config();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const globalKey = "__buildflow_pg_pool__";

const getDatabaseUrl = (preferDirect = false) => {
   let url = "";
   if (preferDirect && process.env.DIRECT_URL) {
      url = process.env.DIRECT_URL;
   } else {
      url = process.env.DATABASE_URL || "";
   }

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

const isTransientDbError = (err) => {
   const msg = String(err?.message || err || "");
   const code = err?.code;
   return (
      code === "EMAXCONNSESSION" ||
      code === "53300" ||
      code === "57P01" ||
      code === "57P03" ||
      /EMAXCONNSESSION|max clients reached|too many clients|remaining connection slots|Connection terminated|timeout exceeded|ECONNRESET|ETIMEDOUT/i.test(
         msg,
      )
   );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPool = () => {
   if (globalThis[globalKey]) {
      return globalThis[globalKey];
   }

   // Serverless: 1 client per isolate. Local: small pool for concurrent requests.
   const max = isServerless
      ? Number(process.env.PG_POOL_MAX || 1)
      : Number(process.env.PG_POOL_MAX || 5);

   const pool = new Pool({
      connectionString: getDatabaseUrl(false),
      ssl: { rejectUnauthorized: false },
      max,
      idleTimeoutMillis: isServerless ? 5_000 : 30_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: isServerless,
      maxUses: isServerless ? 5_000 : undefined,
   });

   pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL pool error:", err.message);
   });

   globalThis[globalKey] = pool;
   return pool;
};

const query = async (text, params) => {
   const pool = getPool();
   let lastError;
   const attempts = isServerless ? 3 : 2;
   for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
         return await pool.query(text, params);
      } catch (err) {
         lastError = err;
         if (!isTransientDbError(err) || attempt === attempts) {
            if (isTransientDbError(err)) {
               const friendly = new Error(
                  "Database is busy (connection limit). Please retry in a moment.",
               );
               friendly.code = err.code || "EMAXCONNSESSION";
               friendly.statusCode = 503;
               friendly.cause = err;
               throw friendly;
            }
            throw err;
         }
         await sleep(100 * attempt * attempt);
      }
   }
   throw lastError;
};

const endPool = async () => {
   const pool = globalThis[globalKey];
   if (pool) {
      await pool.end();
      globalThis[globalKey] = null;
   }
};

module.exports = {
   getPool,
   getDatabaseUrl,
   query,
   endPool,
   isTransientDbError,
   isServerless,
};
