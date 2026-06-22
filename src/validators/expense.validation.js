const { z } = require("zod");

exports.expenseSchema = z.object({
   project: z.string(),

   category: z.enum([
      "labour",

      "fuel",

      "equipment",

      "office",

      "transport",

      "maintenance",

      "other",
   ]),

   amount: z.number(),

   description: z.string(),

   paymentMethod: z.enum(["cash", "bank", "cheque"]),
});
