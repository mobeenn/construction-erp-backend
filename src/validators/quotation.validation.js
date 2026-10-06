const { z } = require("zod");

exports.quotationSchema = z.object({
   vendor: z.string(),
   rfq: z.string(),
   item: z.string(),
   quantity: z.number().positive(),
   unitPrice: z.number().nonnegative(),
   tax: z.number().nonnegative().optional(),
   discount: z.number().nonnegative().optional(),
   deliveryTime: z.string().optional(),
   validity: z.string().optional(),
});
