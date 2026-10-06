const { z } = require("zod");

const entityTypes = [
   "project",
   "contract",
   "client",
   "purchaseOrder",
   "grn",
   "vendor",
   "interimPayment",
   "expense",
   "employee",
   "dailyReport",
];

exports.documentSchema = z.object({
   name: z.string().min(1),
   entityType: z.enum(entityTypes),
   entityId: z.string().min(1),
   fileType: z.string().optional(),
   size: z.number().optional(),
   url: z.string().optional(),
   description: z.string().optional(),
   project: z.string().optional().nullable(),
   contract: z.string().optional().nullable(),
   client: z.string().optional().nullable(),
   purchaseOrder: z.string().optional().nullable(),
   grn: z.string().optional().nullable(),
   vendor: z.string().optional().nullable(),
   interimPayment: z.string().optional().nullable(),
   expense: z.string().optional().nullable(),
   employee: z.string().optional().nullable(),
   dailyReport: z.string().optional().nullable(),
});

exports.updateDocumentSchema = z.object({
   name: z.string().min(1).optional(),
   description: z.string().optional(),
});
