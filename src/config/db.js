const { load } = require("./jsonDb");

const connectDB = async () => {
   try {
      load();
      console.log("JSON Database Connected (db.json)");
   } catch (error) {
      console.log(error);

      process.exit(1);
   }
};

module.exports = connectDB;
