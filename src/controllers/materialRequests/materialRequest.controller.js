const MaterialRequest = require("../../models/MaterialRequest");

const {
   materialRequestSchema,
} = require("../../validators/materialRequest.validation");

const {
   createRequest,

   updateStatus,
} = require("../../services/materialRequest.service");

// Create

exports.create = async (req, res) => {
   try {
      const data = materialRequestSchema.parse(req.body);

      const request = await createRequest(
         data,

         req.user._id,
      );

      res.status(201).json({
         success: true,

         data: request,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get All

exports.getAll = async (req, res) => {
   try {
      const requests = await MaterialRequest.find()

         .populate(
            "project",

            "name",
         )

         .populate(
            "requestedBy",

            "name",
         );

      res.status(200).json({
         success: true,

         data: requests,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Approve

exports.approve = async (req, res) => {
   try {
      const request = await updateStatus(
         req.params.id,

         "approved",
      );

      res.status(200).json({
         success: true,

         data: request,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Reject

exports.reject = async (req, res) => {
   try {
      const request = await updateStatus(
         req.params.id,

         "rejected",
      );

      res.status(200).json({
         success: true,

         data: request,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
