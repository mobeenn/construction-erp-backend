const PurchaseOrder = require("../models/PurchaseOrder");

const generatePoNumber = require("../utils/generatePoNumber");
const { notifyPORequiresApproval } = require("./notification.service");

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

         receivedQty: 0,
      };
   });

   const poNumber = await generatePoNumber();

   const po = await PurchaseOrder.create({
      ...data,

      poNumber,

      items,

      grandTotal,

      createdBy: userId,

      requestedBy: data.requestedBy || userId,
   });

   const populated = await PurchaseOrder.findById(po._id)
      .populate("project", "name")
      .populate("vendor", "companyName");

   await notifyPORequiresApproval(populated, userId).catch(() => {});

   return po;
};
