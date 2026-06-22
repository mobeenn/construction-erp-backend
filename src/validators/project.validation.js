const { z } = require("zod");

exports.projectSchema = z.object({
   name: z.string().min(3),

   location: z.string(),

   description: z
      .string()

      .optional(),

   budget: z.number(),

   startDate: z.string(),

   endDate: z
      .string()

      .optional(),

   supervisor: z
      .string()

      .optional(),
});
