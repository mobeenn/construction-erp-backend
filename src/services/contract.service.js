const Contract = require("../models/Contract");
const generateContractNo = require("../utils/generateContractNo");

exports.createContract = async (data) => {
   const contractNo = await generateContractNo();
   return await Contract.create({ ...data, contractNo });
};
