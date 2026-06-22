const GRN = require("../models/GRN");

const generateGrnNo = async () => {
   const count = await GRN.countDocuments();

   return `GRN-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateGrnNo;
