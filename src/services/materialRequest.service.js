const MaterialRequest = require("../models/MaterialRequest");

const generateRequestNo = require("../utils/generateRequestNo");
const {
   notifyMaterialRequestSubmitted,
   notifyMaterialRequestReviewed,
} = require("./notification.service");

// Create Request

exports.createRequest = async (
   data,

   userId,
) => {
   const requestNo = await generateRequestNo();

   const request = await MaterialRequest.create({
      ...data,

      requestNo,

      requestedBy: userId,
   });

   const populated = await MaterialRequest.findById(request._id)
      .populate("project", "name")
      .populate("requestedBy", "name");

   await notifyMaterialRequestSubmitted(populated, userId).catch(() => {});

   return request;
};

// Update Status

exports.updateStatus = async (
   id,

   status,

   userId,
) => {
   const request = await MaterialRequest.findByIdAndUpdate(
      id,

      {
         status,
      },

      {
         new: true,
      },
   );

   if (request) {
      const populated = await MaterialRequest.findById(request._id)
         .populate("project", "name")
         .populate("requestedBy", "name");

      await notifyMaterialRequestReviewed(populated, userId).catch(() => {});
   }

   return request;
};
