const { z } = require("zod");

exports.materialRequestSchema = z.object({
   project: z.string(),

   remarks: z
      .string()

      .optional(),

   items: z.array(
      z.object({
         inventory: z.string(),

         quantity: z.number(),
      }),
   ),
});
