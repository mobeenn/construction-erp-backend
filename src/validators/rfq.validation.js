const { z } = require("zod");

exports.rfqSchema = z.object({
   project: z.string(),
   request: z.string().optional().nullable(),
   dueDate: z.string().optional(),
   remarks: z.string().optional(),
   items: z
      .array(
         z.object({
            materialName: z.string(),
            quantity: z.number().positive(),
            unit: z.string().optional(),
         }),
      )
      .min(1),
});
