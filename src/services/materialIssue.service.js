const MaterialIssue = require("../models/MaterialIssue");
const MaterialRequest = require("../models/MaterialRequest");
const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");
const generateIssueNo = require("../utils/generateIssueNo");
const { notifyLowInventory } = require("./notification.service");

const alertIfLowStock = async (inventory, userId) => {
   const threshold = inventory.reorderLevel || inventory.minimumStock || 0;
   if ((inventory.currentStock || 0) <= threshold) {
      await notifyLowInventory(inventory, userId).catch(() => {});
   }
};

exports.issueMaterial = async (
   requestId,
   remarks,
   userId,
   issueMeta = {},
) => {
   const request = await MaterialRequest.findById(requestId);

   if (!request) {
      throw new Error("Request not found");
   }

   if (request.status !== "approved") {
      throw new Error("Request is not approved");
   }

   for (const item of request.items) {
      const inventory = await Inventory.findById(item.inventory);

      if (!inventory) {
         throw new Error(`Inventory item not found`);
      }

      if (item.quantity > inventory.currentStock) {
         throw new Error(
            `${inventory.materialName} stock is low (Available: ${inventory.currentStock}, Requested: ${item.quantity})`,
         );
      }

      inventory.currentStock -= item.quantity;
      inventory.issuedQuantity = (inventory.issuedQuantity || 0) + item.quantity;

      await inventory.save();

      await alertIfLowStock(inventory, userId);

      await InventoryTransaction.create({
         inventory: inventory._id,
         project: request.project,
         warehouse: inventory.warehouse,
         type: "stock_out",
         quantity: item.quantity,
         remarks: `Material issued (${issueMeta.issueType || "project"}): ${remarks || ""}`.trim(),
         balanceAfter: inventory.currentStock,
         createdBy: userId,
      });
   }

   const issueNo = await generateIssueNo();

   const issue = await MaterialIssue.create({
      issueNo,
      request: request._id,
      project: request.project,
      issuedBy: userId,
      items: request.items,
      remarks,
      issueType: issueMeta.issueType || "project",
      activity: issueMeta.activity,
      department: issueMeta.department,
      employee: issueMeta.employee,
   });

   request.status = "issued";
   request.issuedBy = userId;
   request.issuedAt = new Date().toISOString();

   await request.save();

   return issue;
};
