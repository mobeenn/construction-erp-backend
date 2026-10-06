const GRN = require("../models/GRN");
const PurchaseOrder = require("../models/PurchaseOrder");
const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");
const Warehouse = require("../models/Warehouse");
const generateGrnNo = require("../utils/generateGrnNo");
const { notifyGRNCreated } = require("./notification.service");

exports.createGRN = async (
   purchaseOrderId,
   remarks,
   userId,
   receivedItems,
   allowOverReceive = false,
) => {
   const po = await PurchaseOrder.findById(purchaseOrderId);

   if (!po) {
      throw new Error("Purchase order not found");
   }

   if (
      po.status !== "approved" &&
      po.status !== "delivered" &&
      po.status !== "partially_received"
   ) {
      throw new Error("Purchase order is not approved");
   }

   // default to receiving full remaining qty when no items specified
   const itemsToReceive =
      receivedItems && receivedItems.length > 0
         ? receivedItems
         : po.items
              .map((i) => ({
                 materialName: i.materialName,
                 quantity: i.quantity - (i.receivedQty || 0),
              }))
              .filter((i) => i.quantity > 0);

   for (const item of itemsToReceive) {
      const poItem = po.items.find(
         (i) => i.materialName.toLowerCase() === item.materialName.toLowerCase(),
      );

      if (!poItem) throw new Error(`${item.materialName} not in PO`);

      const remaining = poItem.quantity - (poItem.receivedQty || 0);

      if (item.quantity > remaining && !allowOverReceive) {
         throw new Error(
            `${item.materialName}: received (${item.quantity}) exceeds remaining (${remaining}). Set allowOverReceive=true to override.`,
         );
      }

      poItem.receivedQty = (poItem.receivedQty || 0) + item.quantity;

      let inventory = (await Inventory.find()).find(
         (inv) =>
            String(inv.project) === String(po.project) &&
            inv.materialName.toLowerCase() === item.materialName.toLowerCase(),
      );

      if (!inventory) {
         const warehouses = await Warehouse.find();
         const warehouse =
            warehouses.find(
               (w) => String(w.project) === String(po.project) && w.status === "active",
            ) || warehouses.find((w) => w.status === "active");

         inventory = await Inventory.create({
            project: po.project,
            warehouse: warehouse ? warehouse._id : null,
            materialName: item.materialName,
            category: "Procured Materials",
            unit: poItem?.unit || "units",
            unitPrice: poItem?.unitPrice || 0,
            openingQuantity: 0,
            receivedQuantity: item.quantity,
            issuedQuantity: 0,
            transferredQuantity: 0,
            currentStock: item.quantity,
            minimumStock: 100,
            reorderLevel: 50,
         });

         await InventoryTransaction.create({
            inventory: inventory._id,
            project: po.project,
            warehouse: inventory.warehouse,
            type: "stock_in",
            quantity: item.quantity,
            remarks: `GRN received against PO: ${po.poNumber || ""}`.trim(),
            balanceAfter: inventory.currentStock,
            createdBy: userId,
         });
      } else {
         inventory.currentStock = (inventory.currentStock || 0) + item.quantity;
         inventory.receivedQuantity = (inventory.receivedQuantity || 0) + item.quantity;
         if (poItem && poItem.unitPrice) {
            inventory.unitPrice = poItem.unitPrice;
         }

         await inventory.save();

         await InventoryTransaction.create({
            inventory: inventory._id,
            project: po.project,
            warehouse: inventory.warehouse,
            type: "stock_in",
            quantity: item.quantity,
            remarks: `GRN received against PO: ${po.poNumber || ""}`.trim(),
            balanceAfter: inventory.currentStock,
            createdBy: userId,
         });
      }
   }

   const allReceived = po.items.every(
      (i) => (i.receivedQty || 0) >= i.quantity,
   );

   po.status = allReceived ? "delivered" : "partially_received";

   await po.save();

   const grnNo = await generateGrnNo();

   const grn = await GRN.create({
      grnNo,
      purchaseOrder: po._id,
      vendor: po.vendor,
      project: po.project,
      receivedBy: userId,
      items: itemsToReceive.map((i) => ({
         materialName: i.materialName,
         quantity: i.quantity,
         receivedQty: i.quantity,
      })),
      remarks,
   });

   const populated = await GRN.findById(grn._id)
      .populate("project", "name")
      .populate("vendor", "companyName");

   await notifyGRNCreated(populated, userId).catch(() => {});

   return grn;
};
