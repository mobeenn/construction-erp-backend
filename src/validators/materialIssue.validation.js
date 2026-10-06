const { z } = require("zod");

exports.materialIssueSchema = z.object({
   requestId: z.string(),

   remarks: z.string().optional(),

   issueType: z
      .enum(["project", "activity", "department", "employee"])
      .optional(),

   activity: z.string().optional(),

   department: z.string().optional(),

   employee: z.string().optional(),
});
