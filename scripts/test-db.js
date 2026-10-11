require("dotenv").config();
const { getPool, endPool, getDatabaseUrl } = require("../src/config/pool");

const main = async () => {
   const url = getDatabaseUrl().replace(/:[^:@/]+@/, ":****@");
   console.log("Connecting:", url);
   const pool = getPool();
   const r = await pool.query(
      "SELECT current_database() AS db, current_user AS usr, NOW() AS now",
   );
   console.log("Connected OK:", r.rows[0]);
   await endPool();
};

main().catch(async (err) => {
   console.error("Connection FAILED:", err.message);
   try {
      await endPool();
   } catch (_) {}
   process.exit(1);
});
