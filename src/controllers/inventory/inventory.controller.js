const Inventory = require("../../models/Inventory");

const {
   inventorySchema,

   stockSchema,
} = require("../../validators/inventory.validation");

const {
   createInventory,
   stockIn: stockInService,
   stockOut: stockOutService,
} = require("../../services/inventory.service");

// Create Material

exports.create = async (req, res) => {
   try {
      const data = inventorySchema.parse(req.body);

      const inventory = await createInventory(data);

      res.status(201).json({
         success: true,

         data: inventory,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Inventory

exports.getAll = async (req, res) => {
   try {
      const inventory = await Inventory.find()

         .populate(
            "project",

            "name projectCode",
         );

      res.status(200).json({
         success: true,

         data: inventory,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Stock In

exports.stockIn = async (req, res) => {
   try {
      const data = stockSchema.parse(req.body);

      const inventory = await stockInService(
         req.params.id,

         data.quantity,

         data.remarks,

         req.user._id,
      );

      res.status(200).json({
         success: true,

         data: inventory,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Stock Out

exports.stockOut = async (req, res) => {
   try {
      const data = stockSchema.parse(req.body);

      const inventory = await stockOutService(
         req.params.id,
         data.quantity,
         data.remarks,
         req.user._id,
      );

      res.status(200).json({
         success: true,

         data: inventory,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
