const { z } = require("zod");

exports.progressUpdateSchema = z.object({
   project: z.string(),
   activity: z.string(),
   updateDate: z.string().optional(),
   newProgress: z.number().min(0).max(100),
   quantityCompleted: z.number().nonnegative().optional(),
   remarks: z.string().optional(),
});
