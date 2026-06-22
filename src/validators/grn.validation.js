const { z } = require("zod");

exports.grnSchema = z.object({
   purchaseOrder: z.string(),

   remarks: z
      .string()

      .optional(),
});
