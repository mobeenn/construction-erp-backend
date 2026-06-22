const Inventory = require("../models/Inventory");

const InventoryTransaction = require("../models/InventoryTransaction");

// Create Material

exports.createInventory = async (data) => {
   return await Inventory.create(data);
};

// Stock In

exports.stockIn = async (
   inventoryId,

   quantity,

   remarks,

   userId,
) => {
   const inventory = await Inventory.findById(inventoryId);

   inventory.currentStock += quantity;

   await inventory.save();

   await InventoryTransaction.create({
      inventory: inventoryId,

      project: inventory.project,

      type: "stock_in",

      quantity,

      remarks,

      createdBy: userId,
   });

   return inventory;
};

// Stock Out

exports.stockOut = async (
   inventoryId,

   quantity,

   remarks,

   userId,
) => {
   const inventory = await Inventory.findById(inventoryId);

   if (quantity > inventory.currentStock) {
      throw new Error("Insufficient stock");
   }

   inventory.currentStock -= quantity;

   await inventory.save();

   await InventoryTransaction.create({
      inventory: inventoryId,

      project: inventory.project,

      type: "stock_out",

      quantity,

      remarks,

      createdBy: userId,
   });

   return inventory;
};
