const PurchaseOrder = require("../models/PurchaseOrder");

const generatePoNumber = async () => {
   const count = await PurchaseOrder.countDocuments();

   return `PO-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generatePoNumber;
