const { z } = require("zod");

exports.inventorySchema = z.object({
   project: z.string().min(1, "Project is required"),
   warehouse: z.string().optional().nullable(),
   materialName: z.string().min(1, "Material Name is required"),
   category: z.string().min(1, "Category is required"),
   unit: z.string().min(1, "Unit is required"),
   unitPrice: z.number().nonnegative("Unit Price cannot be negative"),
   minimumStock: z.number().nonnegative().optional(),
   reorderLevel: z.number().nonnegative().optional(),
   openingQuantity: z.number().nonnegative().optional(),
   currentStock: z.number().optional(),
});

exports.stockSchema = z.object({
   quantity: z.number().positive("Quantity must be greater than 0"),
   remarks: z.string().optional(),
});
