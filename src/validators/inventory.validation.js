const { z } = require("zod");

exports.inventorySchema = z.object({
   project: z.string(),

   materialName: z.string(),

   category: z.string(),

   unit: z.enum(["bags", "tons", "pieces", "kg", "liters"]),

   unitPrice: z.number(),

   minimumStock: z
      .number()

      .optional(),
});

exports.stockSchema = z.object({
   quantity: z.number(),

   remarks: z
      .string()

      .optional(),
});
