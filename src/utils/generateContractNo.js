const Contract = require("../models/Contract");
const generateContractNo = async () => {
   const count = await Contract.countDocuments();
   return `CTR-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateContractNo;
