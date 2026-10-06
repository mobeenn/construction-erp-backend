const { z } = require("zod");

exports.progressSchema = z.object({
   project: z.string(),
   date: z.string().optional(),
   percentComplete: z.number().min(0).max(100),
   quantityDone: z.number().optional(),
   summary: z.string().optional(),
});
