const MaterialIssue = require("../models/MaterialIssue");

const MaterialRequest = require("../models/MaterialRequest");

const Inventory = require("../models/Inventory");

const InventoryTransaction = require("../models/InventoryTransaction");

const generateIssueNo = require("../utils/generateIssueNo");

exports.issueMaterial = async (
   requestId,

   remarks,

   userId,
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

      if (item.quantity > inventory.currentStock) {
         throw new Error(`${inventory.materialName} stock is low`);
      }

      inventory.currentStock -= item.quantity;

      await inventory.save();

      await InventoryTransaction.create({
         inventory: inventory._id,

         project: request.project,

         type: "stock_out",

         quantity: item.quantity,

         remarks: "Material issued",

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
   });

   request.status = "issued";

   request.issuedBy = userId;

   request.issuedAt = new Date();

   await request.save();

   return issue;
};
