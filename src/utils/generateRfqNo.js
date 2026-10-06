const RFQ = require("../models/RFQ");
const generateRfqNo = async () => {
   const count = await RFQ.countDocuments();
   return `RFQ-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateRfqNo;
