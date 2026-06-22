const { z } = require("zod");

exports.attendanceSchema = z.object({
   employee: z.string(),

   date: z.string(),

   status: z.enum(["present", "absent", "half_day"]),

   overtimeHours: z
      .number()

      .optional(),
   project: z.string(),
});
