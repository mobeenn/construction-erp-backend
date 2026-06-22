const MaterialRequest = require("../models/MaterialRequest");

const generateRequestNo = async () => {
   const count = await MaterialRequest.countDocuments();

   return `MR-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateRequestNo;
