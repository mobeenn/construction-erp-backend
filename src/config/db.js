const { getPool } = require("./pool");

const connectDB = async () => {
   try {
      const pool = getPool();
      await pool.query("SELECT 1");
      console.log("PostgreSQL Connected");
   } catch (error) {
      // Never kill the process (fatal on serverless) — routes will surface errors.
      console.error("PostgreSQL connection failed:", error.message);
   }
};

module.exports = connectDB;
