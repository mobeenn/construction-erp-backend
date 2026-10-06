const Client = require("../models/Client");
const generateClientCode = require("../utils/generateClientCode");

exports.createClient = async (data) => {
   const clientCode = await generateClientCode();
   return await Client.create({ ...data, clientCode });
};
