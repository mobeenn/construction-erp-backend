const { z } = require("zod");

exports.updateUserSchema = z.object({
   name: z.string().min(3).optional(),

   email: z.email().optional(),

   role: z
      .enum([
         "admin",

         "hr",

         "accountant",

         "store_manager",

         "purchase_manager",

         "site_supervisor",
      ])
      .optional(),

   isActive: z.boolean().optional(),
});
