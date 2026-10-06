const { grnSchema } = require("../../validators/grn.validation");

const { createGRN } = require("../../services/grn.service");
const GRN = require("../../models/GRN");

exports.create = async (req, res) => {
   try {
      const data = grnSchema.parse(req.body);

      const grn = await createGRN(
         data.purchaseOrder,

         data.remarks,

         req.user._id,

         data.items,

         data.allowOverReceive,
      );

      res.status(201).json({
         success: true,

         data: grn,
      });
   } catch (error) {
      res.status(400).json({
         success: false,

         message: error.message,
      });
   }
};

// ✅ GET ALL GRNs (NEW)
exports.getAll = async (req, res) => {
   try {
      const grns = await GRN.find()
         .populate("purchaseOrder", "poNumber")
         .populate("vendor", "companyName")
         .populate("project", "name")
         .sort({ createdAt: -1 });

      const { project } = req.query;

      const filtered = project
         ? grns.filter(
              (g) => String(g.project?._id || g.project) === project,
           )
         : grns;

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

