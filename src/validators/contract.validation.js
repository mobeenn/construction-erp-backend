const { z } = require("zod");

exports.contractSchema = z.object({
   type: z.enum(["client", "subcontract"]).optional(),
   client: z.string().optional().nullable(),
   vendor: z.string().optional().nullable(),
   project: z.string(),
   title: z.string().optional(),
   value: z.number().nonnegative(),
   retentionPercent: z.number().min(0).max(100).optional(),
   advancePercentage: z.number().min(0).max(100).optional(),
   paymentTerms: z.string().optional(),
   tax: z.number().min(0).max(100).optional(),
   approvedVariations: z.number().optional(),
   startDate: z.string().optional(),
   endDate: z.string().optional(),
   status: z
      .enum(["draft", "submitted", "approved", "active", "suspended", "completed", "terminated"])
      .optional(),
   terms: z.string().optional(),
   documents: z.array(z.object({ name: z.string(), url: z.string().optional() })).optional(),
   notes: z.string().optional(),
});
