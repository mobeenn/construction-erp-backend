const mongoose = require("mongoose");

const connectDB = async () => {
   try {
      await mongoose.connect(
         process.env.MONGO_URI ||
            "mongodb+srv://mobeen0616_db_user:IQSllF6laVMxUISt@cluster0.6ta1s5m.mongodb.net/construction_erp",
      );

      console.log("MongoDB Connected");
   } catch (error) {
      console.log(error);

      process.exit(1);
   }
};

module.exports = connectDB;
