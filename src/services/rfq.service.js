const RFQ = require("../models/RFQ");
const generateRfqNo = require("../utils/generateRfqNo");

exports.createRfq = async (data, userId) => {
   const rfqNo = await generateRfqNo();

   return await RFQ.create({
      ...data,
      rfqNo,
      createdBy: userId,
      status: "open",
   });
};
