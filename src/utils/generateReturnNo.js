const MaterialReturn = require("../models/MaterialReturn");
const generateReturnNo = async () => {
   const count = await MaterialReturn.countDocuments();
   return `RET-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateReturnNo;
