const { z } = require("zod");

exports.materialIssueSchema = z.object({
   requestId: z.string(),

   remarks: z
      .string()

      .optional(),
});
