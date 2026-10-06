const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");
const StockTransfer = require("../models/StockTransfer");
const StockAdjustment = require("../models/StockAdjustment");
const MaterialReturn = require("../models/MaterialReturn");
const generateTransferNo = require("../utils/generateTransferNo");
const generateReturnNo = require("../utils/generateReturnNo");
const generateAdjustmentNo = require("../utils/generateAdjustmentNo");
const { notifyLowInventory } = require("./notification.service");

// Notify store managers + admins when an item drops to/below its reorder level
const alertIfLowStock = async (inventory, userId) => {
   const threshold = inventory.reorderLevel || inventory.minimumStock || 0;
   if ((inventory.currentStock || 0) <= threshold) {
      await notifyLowInventory(inventory, userId).catch(() => {});
   }
};

// Create Material
exports.createInventory = async (data) => {
   const opening = Number(data.openingQuantity ?? data.currentStock ?? 0);
   const doc = await Inventory.create({
      ...data,
      openingQuantity: opening,
      receivedQuantity: Number(data.receivedQuantity ?? 0),
      issuedQuantity: Number(data.issuedQuantity ?? 0),
      transferredQuantity: Number(data.transferredQuantity ?? 0),
      currentStock: opening,
      minimumStock: Number(data.minimumStock ?? 100),
      reorderLevel: Number(data.reorderLevel ?? 50),
      unitPrice: Number(data.unitPrice ?? 0),
   });

   if (opening > 0) {
      await InventoryTransaction.create({
         inventory: doc._id,
         project: doc.project,
         warehouse: doc.warehouse,
         type: "stock_in",
         quantity: opening,
         remarks: "Initial opening stock",
         balanceAfter: opening,
         createdBy: data.createdBy,
      });
   }

   return doc;
};

// Stock In
exports.stockIn = async (inventoryId, quantity, remarks, userId) => {
   const inventory = await Inventory.findById(inventoryId);
   if (!inventory) throw new Error("Item not found");

   const qty = Number(quantity);
   inventory.currentStock = (inventory.currentStock || 0) + qty;
   inventory.receivedQuantity = (inventory.receivedQuantity || 0) + qty;
   await inventory.save();

   await InventoryTransaction.create({
      inventory: inventoryId,
      project: inventory.project,
      warehouse: inventory.warehouse,
      type: "stock_in",
      quantity: qty,
      remarks: remarks || "Manual Stock In",
      balanceAfter: inventory.currentStock,
      createdBy: userId,
   });

   return inventory;
};

// Stock Out
exports.stockOut = async (inventoryId, quantity, remarks, userId) => {
   const inventory = await Inventory.findById(inventoryId);
   if (!inventory) throw new Error("Item not found");

   const qty = Number(quantity);
   if (qty > inventory.currentStock) {
      throw new Error("Insufficient stock available");
   }

   inventory.currentStock -= qty;
   inventory.issuedQuantity = (inventory.issuedQuantity || 0) + qty;
   await inventory.save();

   await alertIfLowStock(inventory, userId);

   await InventoryTransaction.create({
      inventory: inventoryId,
      project: inventory.project,
      warehouse: inventory.warehouse,
      type: "stock_out",
      quantity: qty,
      remarks: remarks || "Manual Stock Out",
      balanceAfter: inventory.currentStock,
      createdBy: userId,
   });

   return inventory;
};

// Transfer between warehouses
exports.transfer = async (inventoryId, toWarehouseId, quantity, remarks, userId) => {
   const source = await Inventory.findById(inventoryId);
   if (!source) throw new Error("Source item not found");

   const qty = Number(quantity);
   if (qty <= 0) throw new Error("Quantity must be greater than 0");
   if (qty > source.currentStock) throw new Error("Insufficient stock in source warehouse");
   if (String(source.warehouse) === String(toWarehouseId)) {
      throw new Error("Source and destination warehouses cannot be the same");
   }

   source.currentStock -= qty;
   source.transferredQuantity = (source.transferredQuantity || 0) + qty;
   await source.save();

   let target = (await Inventory.find()).find(
      (i) =>
         i.materialName.toLowerCase() === source.materialName.toLowerCase() &&
         String(i.warehouse) === String(toWarehouseId) &&
         String(i.project) === String(source.project),
   );

   if (!target) {
      target = await Inventory.create({
         project: source.project,
         warehouse: toWarehouseId,
         materialName: source.materialName,
         category: source.category,
         unit: source.unit,
         openingQuantity: 0,
         receivedQuantity: qty,
         issuedQuantity: 0,
         transferredQuantity: 0,
         currentStock: qty,
         minimumStock: source.minimumStock,
         reorderLevel: source.reorderLevel,
         unitPrice: source.unitPrice,
      });
   } else {
      target.currentStock = (target.currentStock || 0) + qty;
      target.receivedQuantity = (target.receivedQuantity || 0) + qty;
      await target.save();
   }

   await InventoryTransaction.create({
      inventory: source._id,
      project: source.project,
      warehouse: source.warehouse,
      type: "stock_out",
      quantity: qty,
      remarks: `Transfer to warehouse: ${remarks || ""}`.trim(),
      balanceAfter: source.currentStock,
      createdBy: userId,
   });

   await InventoryTransaction.create({
      inventory: target._id,
      project: target.project,
      warehouse: target.warehouse,
      type: "stock_in",
      quantity: qty,
      remarks: `Transfer received from warehouse: ${remarks || ""}`.trim(),
      balanceAfter: target.currentStock,
      createdBy: userId,
   });

   const transferNo = await generateTransferNo();

   const transfer = await StockTransfer.create({
      transferNo,
      fromWarehouse: source.warehouse,
      toWarehouse: toWarehouseId,
      inventory: source._id,
      project: source.project,
      quantity: qty,
      remarks: remarks || "",
      createdBy: userId,
   });

   return { transfer, target, source };
};

// Material return
exports.returnMaterial = async (inventoryId, quantity, reason, userId) => {
   const inventory = await Inventory.findById(inventoryId);
   if (!inventory) throw new Error("Item not found");

   const qty = Number(quantity);
   if (qty <= 0) throw new Error("Quantity must be greater than 0");

   inventory.currentStock += qty;
   inventory.receivedQuantity = (inventory.receivedQuantity || 0) + qty;
   await inventory.save();

   await InventoryTransaction.create({
      inventory: inventoryId,
      project: inventory.project,
      warehouse: inventory.warehouse,
      type: "stock_in",
      quantity: qty,
      remarks: `Material Return: ${reason || "Returned to stock"}`,
      balanceAfter: inventory.currentStock,
      createdBy: userId,
   });

   const returnNo = await generateReturnNo();

   const ret = await MaterialReturn.create({
      returnNo,
      inventory: inventoryId,
      project: inventory.project,
      quantity: qty,
      reason: reason || "",
      createdBy: userId,
   });

   return ret;
};

// Stock adjustment (pending approval)
exports.requestAdjustment = async (inventoryId, quantity, reason, userId) => {
   const inventory = await Inventory.findById(inventoryId);
   if (!inventory) throw new Error("Item not found");

   const adjustmentNo = await generateAdjustmentNo();

   const adj = await StockAdjustment.create({
      adjustmentNo,
      inventory: inventoryId,
      project: inventory.project,
      quantity: Number(quantity),
      reason,
      status: "pending",
      createdBy: userId,
   });

   return adj;
};

exports.approveAdjustment = async (id, userId) => {
   const adj = await StockAdjustment.findById(id);
   if (!adj) throw new Error("Adjustment not found");
   if (adj.status !== "pending") throw new Error("Adjustment has already been reviewed");

   const inventory = await Inventory.findById(adj.inventory);
   if (!inventory) throw new Error("Item not found");

   const qty = Number(adj.quantity);
   inventory.currentStock += qty;
   if (inventory.currentStock < 0) throw new Error("Adjustment would result in negative stock");

   if (qty >= 0) {
      inventory.receivedQuantity = (inventory.receivedQuantity || 0) + qty;
   } else {
      inventory.issuedQuantity = (inventory.issuedQuantity || 0) + Math.abs(qty);
   }

   await inventory.save();

   await alertIfLowStock(inventory, userId);

   await InventoryTransaction.create({
      inventory: inventory._id,
      project: inventory.project,
      warehouse: inventory.warehouse,
      type: qty >= 0 ? "stock_in" : "stock_out",
      quantity: Math.abs(qty),
      remarks: `Stock Adjustment (${adj.adjustmentNo}): ${adj.reason}`,
      balanceAfter: inventory.currentStock,
      createdBy: userId,
   });

   adj.status = "approved";
   adj.approvedBy = userId;
   await adj.save();

   return adj;
};

exports.ledger = async (inventoryId) => {
   const txs = await InventoryTransaction.find()
      .populate("inventory", "materialName unit category unitPrice")
      .populate("project", "name projectCode")
      .populate("warehouse", "name code location")
      .populate("createdBy", "name email");

   let filtered = inventoryId
      ? txs.filter((t) => String(t.inventory?._id || t.inventory) === String(inventoryId))
      : txs;

   return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

exports.movements = async () => {
   const txs = await InventoryTransaction.find()
      .populate("inventory", "materialName unit category unitPrice")
      .populate("project", "name projectCode")
      .populate("warehouse", "name code location")
      .populate("createdBy", "name email");

   return txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

exports.valuation = async () => {
   const items = await Inventory.find()
      .populate("warehouse", "name code location")
      .populate("project", "name projectCode");

   const itemsValuation = items.map((i) => ({
      ...i,
      totalValue: (i.currentStock || 0) * (i.unitPrice || 0),
   }));

   const totalValue = itemsValuation.reduce((sum, i) => sum + i.totalValue, 0);
   const totalQuantity = itemsValuation.reduce((sum, i) => sum + (i.currentStock || 0), 0);

   const byWarehouse = {};
   itemsValuation.forEach((i) => {
      const wId = i.warehouse?._id || i.warehouse || "unassigned";
      const wName = i.warehouse?.name || "Unassigned Warehouse";
      if (!byWarehouse[wId]) {
         byWarehouse[wId] = {
            warehouseId: wId,
            name: wName,
            code: i.warehouse?.code || "",
            totalValue: 0,
            totalItems: 0,
            totalQuantity: 0,
         };
      }
      byWarehouse[wId].totalValue += i.totalValue;
      byWarehouse[wId].totalItems += 1;
      byWarehouse[wId].totalQuantity += (i.currentStock || 0);
   });

   const byProject = {};
   itemsValuation.forEach((i) => {
      const pId = i.project?._id || i.project || "unassigned";
      const pName = i.project?.name || "General Inventory";
      if (!byProject[pId]) {
         byProject[pId] = {
            projectId: pId,
            name: pName,
            projectCode: i.project?.projectCode || "",
            totalValue: 0,
            totalItems: 0,
            totalQuantity: 0,
         };
      }
      byProject[pId].totalValue += i.totalValue;
      byProject[pId].totalItems += 1;
      byProject[pId].totalQuantity += (i.currentStock || 0);
   });

   return {
      totalValue,
      totalQuantity,
      itemCount: items.length,
      items: itemsValuation,
      byWarehouse: Object.values(byWarehouse),
      byProject: Object.values(byProject),
   };
};

exports.lowStock = async () => {
   const items = await Inventory.find()
      .populate("warehouse", "name code location")
      .populate("project", "name projectCode");

   const alerts = items
      .filter((i) => (i.currentStock || 0) <= (i.reorderLevel || i.minimumStock || 0))
      .map((i) => {
         let severity = "reorder";
         if ((i.currentStock || 0) <= 0) severity = "out_of_stock";
         else if ((i.currentStock || 0) <= (i.minimumStock || 0)) severity = "critical";

         return {
            ...i,
            severity,
            deficit: Math.max(0, (i.reorderLevel || i.minimumStock || 0) - (i.currentStock || 0)),
         };
      });

   return alerts;
};

exports.consumption = async (projectId, activityId) => {
   const MaterialIssue = require("../models/MaterialIssue");

   const issues = await MaterialIssue.find()
      .populate("project", "name projectCode")
      .populate("issuedBy", "name");

   let filteredIssues = issues;
   if (projectId) {
      filteredIssues = filteredIssues.filter(
         (i) => String(i.project?._id || i.project) === String(projectId),
      );
   }
   if (activityId) {
      filteredIssues = filteredIssues.filter(
         (i) => String(i.activity?._id || i.activity) === String(activityId),
      );
   }

   const byProject = {};
   const byActivity = {};
   const byMaterial = {};
   const byIssueType = {
      project: 0,
      activity: 0,
      department: 0,
      employee: 0,
   };

   for (const issue of filteredIssues) {
      const pKey = issue.project?._id ? String(issue.project._id) : String(issue.project || "general");
      const pName = issue.project?.name || "General";
      if (!byProject[pKey]) byProject[pKey] = { id: pKey, name: pName, totalQty: 0, issuesCount: 0 };
      byProject[pKey].issuesCount += 1;

      const actKey = issue.activity || "Unassigned Activity";
      if (!byActivity[actKey]) byActivity[actKey] = { activity: actKey, totalQty: 0, issuesCount: 0 };
      byActivity[actKey].issuesCount += 1;

      const type = issue.issueType || "project";
      if (byIssueType[type] !== undefined) byIssueType[type] += 1;

      for (const item of issue.items || []) {
         const matName = item.materialName || "Material";
         const qty = Number(item.quantity || 0);

         byProject[pKey].totalQty += qty;
         byActivity[actKey].totalQty += qty;

         if (!byMaterial[matName]) {
            byMaterial[matName] = { materialName: matName, unit: item.unit || "units", totalQuantity: 0 };
         }
         byMaterial[matName].totalQuantity += qty;
      }
   }

   return {
      totalIssues: filteredIssues.length,
      byIssueType,
      byProject: Object.values(byProject),
      byActivity: Object.values(byActivity),
      byMaterial: Object.values(byMaterial),
      recentIssues: filteredIssues.slice(0, 20),
   };
};
