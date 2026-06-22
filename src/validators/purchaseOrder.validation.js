const { z } = require("zod");

exports.purchaseOrderSchema = z.object({
   vendor: z.string(),

   project: z.string(),

   items: z.array(
      z.object({
         materialName: z.string(),

         quantity: z.number(),

         unitPrice: z.number(),
      }),
   ),
});
