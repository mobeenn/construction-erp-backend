const MaterialRequest = require("../models/MaterialRequest");

const generateRequestNo = require("../utils/generateRequestNo");

// Create Request

exports.createRequest = async (
   data,

   userId,
) => {
   const requestNo = await generateRequestNo();

   return await MaterialRequest.create({
      ...data,

      requestNo,

      requestedBy: userId,
   });
};

// Update Status

exports.updateStatus = async (
   id,

   status,
) => {
   return await MaterialRequest.findByIdAndUpdate(
      id,

      {
         status,
      },

      {
         new: true,
      },
   );
};
