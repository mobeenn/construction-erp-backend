const PurchaseOrder = require("../../models/PurchaseOrder");

const {
   purchaseOrderSchema,
} = require("../../validators/purchaseOrder.validation");

const { createPO } = require("../../services/purchaseOrder.service");
const { notifyPOReviewed } = require("../../services/notification.service");

// Create PO

exports.create = async (req, res) => {
   try {
      const data = purchaseOrderSchema.parse(req.body);

      const po = await createPO(
         data,

         req.user._id,
      );

      res.status(201).json({
         success: true,

         data: po,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get POs

exports.getAll = async (req, res) => {
   try {
      const po = await PurchaseOrder.find()

         .populate(
            "vendor",

            "companyName",
         )

         .populate(
            "project",

            "name",
         )

         .sort({
            createdAt: -1,
         });

      const { project } = req.query;

      const filtered = project
         ? po.filter((p) => String(p.project?._id || p.project) === project)
         : po;

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

// Approve PO

exports.approve = async (req, res) => {
   try {
      const po = await PurchaseOrder.findByIdAndUpdate(
         req.params.id,

         {
            status: "approved",
         },

         {
            new: true,
         },
      );

      if (po) {
         const populated = await PurchaseOrder.findById(po._id)
            .populate("project", "name")
            .populate("vendor", "companyName");

         await notifyPOReviewed(populated, req.user._id).catch(() => {});
      }

      res.status(200).json({
         success: true,

         data: po,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
