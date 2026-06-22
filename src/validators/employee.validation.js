const { z } = require("zod");

exports.employeeSchema = z.object({
   name: z.string().min(3),

   cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/),

   phone: z.string().regex(/^03\d{9}$/),

   email: z
      .string()

      .email()

      .optional(),

   designation: z.string(),

   salary: z.number(),

   assignedSite: z.string(),
   assignedProject: z.string(),
});
