const { z } = require("zod");

exports.activitySchema = z.object({
   project: z.string(),
   name: z.string().min(2),
   title: z.string().optional(),
   description: z.string().optional(),
   activityCode: z.string().optional(),
   wbsCode: z.string().optional(),
   category: z.string().optional(),
   plannedStart: z.string().optional(),
   plannedEnd: z.string().optional(),
   actualStart: z.string().optional().nullable(),
   actualEnd: z.string().optional().nullable(),
   plannedQuantity: z.number().nonnegative().optional(),
   completedQuantity: z.number().nonnegative().optional(),
   unit: z.string().optional(),
   plannedPercentage: z.number().min(0).max(100).optional(),
   actualPercentage: z.number().min(0).max(100).optional(),
   status: z
      .enum(["not_started", "in_progress", "delayed", "completed", "on_hold"])
      .optional(),
   responsible: z.string().optional().nullable(),
   assignedTo: z.string().optional().nullable(),
   weight: z.number().nonnegative().optional(),
   phase: z.string().optional(),
   remarks: z.string().optional(),
});

