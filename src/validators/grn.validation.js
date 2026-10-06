const { z } = require("zod");

exports.grnSchema = z.object({
   purchaseOrder: z.string(),

   remarks: z.string().optional(),

   allowOverReceive: z.boolean().optional(),

   items: z
      .array(
         z.object({
            materialName: z.string(),
            quantity: z.number().positive(),
         }),
      )
      .optional(),
});
