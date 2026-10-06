const { z } = require("zod");

const categories = [
   "labour",
   "materials",
   "equipment",
   "subcontractors",
   "transportation",
   "site_overhead",
   "administration",
   "other",
];

exports.budgetCategories = categories;

exports.budgetSchema = z.object({
   project: z.string(),
   version: z.number().int().positive().optional(),
   approvedDate: z.string().optional(),
   approvedBy: z.string().optional(),
   status: z.enum(["draft", "active", "superseded"]).optional(),
   lines: z
      .array(
         z.object({
            category: z.enum(categories),
            description: z.string().min(1),
            quantity: z.number().nonnegative().optional(),
            unit: z.string().optional(),
            rate: z.number().nonnegative().optional(),
            amount: z.number().nonnegative(),
         }),
      )
      .min(1),
});
