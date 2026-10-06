const { load } = require("./jsonDb");

const connectDB = async () => {
   try {
      load();
      console.log("JSON Database Connected (db.json)");
   } catch (error) {
      // Never kill the process (fatal on serverless) — routes will surface errors.
      console.error("JSON Database failed to load:", error);
   }
};

module.exports = connectDB;
