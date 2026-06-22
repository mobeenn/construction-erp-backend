const { z } = require("zod");

exports.registerSchema = z.object({
   name: z.string().min(3),

   email: z.email(),

   password: z.string().min(6),

   role: z.enum([
      "admin",
      "hr",
      "accountant",
      "store_manager",
      "purchase_manager",
      "site_supervisor",
   ]),
});

exports.loginSchema = z.object({
   email: z.email(),

   password: z.string(),
});
