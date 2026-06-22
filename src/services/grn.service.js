const GRN = require("../models/GRN");

const PurchaseOrder = require("../models/PurchaseOrder");

const Inventory = require("../models/Inventory");

const InventoryTransaction = require("../models/InventoryTransaction");

const generateGrnNo = require("../utils/generateGrnNo");

exports.createGRN = async (
   purchaseOrderId,

   remarks,

   userId,
) => {
   const po = await PurchaseOrder.findById(purchaseOrderId);

   if (!po) {
      throw new Error("Purchase order not found");
   }

   if (po.status !== "approved") {
      throw new Error("Purchase order is not approved");
   }

   for (const item of po.items) {
      const inventory = await Inventory.findOne({
         project: po.project,

         materialName: item.materialName,
      });

      if (inventory) {
         inventory.currentStock += item.quantity;

         await inventory.save();

         await InventoryTransaction.create({
            inventory: inventory._id,

            project: po.project,

            type: "stock_in",

            quantity: item.quantity,

            remarks: "GRN stock received",

            createdBy: userId,
         });
      }
   }

   const grnNo = await generateGrnNo();

   const grn = await GRN.create({
      grnNo,

      purchaseOrder: po._id,

      vendor: po.vendor,

      project: po.project,

      receivedBy: userId,

      items: po.items,

      remarks,
   });

   po.status = "delivered";

   await po.save();

   return grn;
};
