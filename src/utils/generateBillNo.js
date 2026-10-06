const InterimPayment = require("../models/InterimPayment");
const generateBillNo = async () => {
   const count = await InterimPayment.countDocuments();
   return `IB-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateBillNo;
