const StockTransfer = require("../models/StockTransfer");
const generateTransferNo = async () => {
   const count = await StockTransfer.countDocuments();
   return `TR-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateTransferNo;
