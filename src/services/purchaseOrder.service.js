const PurchaseOrder = require("../models/PurchaseOrder");

const generatePoNumber = require("../utils/generatePoNumber");

exports.createPO = async (
   data,

   userId,
) => {
   let grandTotal = 0;

   const items = data.items.map((item) => {
      const total = item.quantity * item.unitPrice;

      grandTotal += total;

      return {
         ...item,

         total,
      };
   });

   const poNumber = await generatePoNumber();

   return await PurchaseOrder.create({
      ...data,

      poNumber,

      items,

      grandTotal,

      createdBy: userId,
   });
};
