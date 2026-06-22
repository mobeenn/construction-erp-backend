const { z } = require("zod");

exports.vendorSchema = z.object({
   companyName: z.string(),

   contactPerson: z.string(),

   phone: z.string(),

   email: z
      .string()

      .email()

      .optional(),

   address: z.string(),
});
