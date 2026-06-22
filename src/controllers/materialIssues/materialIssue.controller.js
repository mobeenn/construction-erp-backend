const {
   materialIssueSchema,
} = require("../../validators/materialIssue.validation");

const { issueMaterial } = require("../../services/materialIssue.service");
const MaterialIssue = require("../../models/MaterialIssue");

exports.issue = async (req, res) => {
   try {
      const data = materialIssueSchema.parse(req.body);

      const issue = await issueMaterial(
         data.requestId,

         data.remarks,

         req.user._id,
      );

      res.status(201).json({
         success: true,

         data: issue,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

exports.getAll = async (req, res) => {
   try {
      const data = await MaterialIssue.find()

         .populate("request", "requestNo")

         .populate("issuedBy", "name")

         .sort({
            createdAt: -1,
         });

      res.status(200).json({
         success: true,

         data,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
