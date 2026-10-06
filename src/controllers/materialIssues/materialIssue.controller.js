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
         {
            issueType: data.issueType,
            activity: data.activity,
            department: data.department,
            employee: data.employee,
         },
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
         .populate("project", "name projectCode")
         .populate("employee", "name")
         .sort({
            createdAt: -1,
         });

      const { project } = req.query;

      const filtered = project
         ? data.filter(
              (i) => String(i.project?._id || i.project) === project,
           )
         : data;

      res.status(200).json({
         success: true,
         data: filtered,
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};
