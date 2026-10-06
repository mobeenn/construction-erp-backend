const { z } = require("zod");

exports.purchaseOrderSchema = z.object({
   vendor: z.string(),

   project: z.string(),

   site: z.string().optional(),

   budgetCategory: z.string().optional(),

   requestedBy: z.string().optional(),

   deliveryLocation: z.string().optional(),

   expectedDelivery: z.string().optional(),

   paymentTerms: z.string().optional(),

   items: z.array(
      z.object({
         materialName: z.string(),

         quantity: z.number(),

         unitPrice: z.number(),
      }),
   ),
});
