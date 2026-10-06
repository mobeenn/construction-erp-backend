const Client = require("../models/Client");
const generateClientCode = async () => {
   const count = await Client.countDocuments();
   return `CLI-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateClientCode;
