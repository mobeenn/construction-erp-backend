const StockAdjustment = require("../models/StockAdjustment");
const generateAdjustmentNo = async () => {
   const count = await StockAdjustment.countDocuments();
   return `ADJ-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateAdjustmentNo;
