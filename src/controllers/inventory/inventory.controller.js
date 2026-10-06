const Inventory = require("../../models/Inventory");
const {
   inventorySchema,
   stockSchema,
} = require("../../validators/inventory.validation");
const {
   createInventory,
   stockIn: stockInService,
   stockOut: stockOutService,
   transfer,
   returnMaterial,
   requestAdjustment,
   approveAdjustment,
   ledger,
   movements,
   valuation,
   lowStock,
   consumption,
} = require("../../services/inventory.service");

const StockTransfer = require("../../models/StockTransfer");
const StockAdjustment = require("../../models/StockAdjustment");
const MaterialReturn = require("../../models/MaterialReturn");

// Transfer stock between warehouses
exports.transfer = async (req, res) => {
   try {
      const { inventoryId, toWarehouseId, quantity, remarks } = req.body;

      if (!inventoryId || !toWarehouseId || !quantity) {
         return res.status(400).json({
            success: false,
            message: "inventoryId, toWarehouseId, and quantity are required",
         });
      }

      const data = await transfer(
         inventoryId,
         toWarehouseId,
         Number(quantity),
         remarks,
         req.user._id,
      );

      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

// Return material
exports.returnMaterial = async (req, res) => {
   try {
      const { inventoryId, quantity, reason } = req.body;

      if (!inventoryId || !quantity) {
         return res.status(400).json({
            success: false,
            message: "inventoryId and quantity are required",
         });
      }

      const data = await returnMaterial(
         inventoryId,
         Number(quantity),
         reason,
         req.user._id,
      );

      res.status(201).json({ success: true, data });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

// Request stock adjustment
exports.adjust = async (req, res) => {
   try {
      const { inventoryId, quantity, reason } = req.body;

      if (!inventoryId || quantity === undefined) {
         return res.status(400).json({
            success: false,
            message: "inventoryId and quantity are required",
         });
      }

      const data = await requestAdjustment(
         inventoryId,
         Number(quantity),
         reason,
         req.user._id,
      );

      res.status(201).json({ success: true, data });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

// Approve/reject adjustment
exports.reviewAdjustment = async (req, res) => {
   try {
      const { action } = req.body;

      const adj = await StockAdjustment.findById(req.params.id);

      if (!adj) {
         return res.status(404).json({ success: false, message: "Adjustment not found" });
      }

      if (action === "approve") {
         const data = await approveAdjustment(req.params.id, req.user._id);
         return res.status(200).json({ success: true, data });
      }

      if (action === "reject") {
         adj.status = "rejected";
         adj.approvedBy = req.user._id;
         await adj.save();
         return res.status(200).json({ success: true, data: adj });
      }

      res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'reject'" });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.transfers = async (req, res) => {
   try {
      const data = await StockTransfer.find()
         .populate("fromWarehouse", "name code location")
         .populate("toWarehouse", "name code location")
         .populate("inventory", "materialName unit category")
         .populate("project", "name projectCode")
         .populate("createdBy", "name email");

      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.adjustments = async (req, res) => {
   try {
      const data = await StockAdjustment.find()
         .populate("inventory", "materialName unit currentStock")
         .populate("project", "name projectCode")
         .populate("createdBy", "name email")
         .populate("approvedBy", "name email");

      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.returns = async (req, res) => {
   try {
      const data = await MaterialReturn.find()
         .populate("inventory", "materialName unit category")
         .populate("project", "name projectCode")
         .populate("createdBy", "name email");

      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.ledger = async (req, res) => {
   try {
      const data = await ledger(req.query.inventory);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.movements = async (req, res) => {
   try {
      const data = await movements();
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.valuation = async (req, res) => {
   try {
      const data = await valuation();
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.lowStock = async (req, res) => {
   try {
      const data = await lowStock();
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.consumption = async (req, res) => {
   try {
      const data = await consumption(req.query.project, req.query.activity);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// Create Material
exports.create = async (req, res) => {
   try {
      const data = inventorySchema.parse(req.body);

      const inventory = await createInventory({
         ...data,
         createdBy: req.user._id,
      });

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
         .populate("project", "name projectCode")
         .populate("warehouse", "name code location status");

      const { project, warehouse, category, search } = req.query;

      let filtered = inventory;

      if (project) {
         filtered = filtered.filter(
            (i) => String(i.project?._id || i.project) === project,
         );
      }

      if (warehouse) {
         filtered = filtered.filter(
            (i) => String(i.warehouse?._id || i.warehouse) === warehouse,
         );
      }

      if (category) {
         filtered = filtered.filter(
            (i) => (i.category || "").toLowerCase() === category.toLowerCase(),
         );
      }

      if (search) {
         const q = search.toLowerCase();
         filtered = filtered.filter(
            (i) =>
               (i.materialName || "").toLowerCase().includes(q) ||
               (i.category || "").toLowerCase().includes(q),
         );
      }

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
