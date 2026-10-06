const { z } = require("zod");

exports.accountCategorySchema = z.object({
   name: z.string().min(1),
   code: z.string().min(1),
   type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
   description: z.string().optional(),
   isActive: z.boolean().optional(),
});

exports.accountSchema = z.object({
   name: z.string().min(1),
   code: z.string().min(1),
   category: z.string(),
   type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
   openingBalance: z.number().optional(),
   description: z.string().optional(),
   project: z.string().optional(),
   isActive: z.boolean().optional(),
});

exports.journalEntryLineSchema = z.object({
   account: z.string(),
   debit: z.number().default(0),
   credit: z.number().default(0),
   description: z.string().optional(),
   project: z.string().optional(),
});

exports.journalEntrySchema = z.object({
   date: z.string().or(z.date()),
   reference: z.string().min(1),
   description: z.string().optional(),
   lines: z.array(exports.journalEntryLineSchema).min(2),
   project: z.string().optional(),
   contract: z.string().optional(),
   status: z.enum(["draft", "posted", "void"]).optional(),
});

exports.customerPaymentSchema = z.object({
   date: z.string().or(z.date()),
   reference: z.string().min(1),
   client: z.string(),
   amount: z.number().positive(),
   paymentMethod: z.enum(["cash", "bank", "cheque"]),
   account: z.string(),
   project: z.string().optional(),
   contract: z.string().optional(),
   interimPayment: z.string().optional(),
   description: z.string().optional(),
   status: z.enum(["pending", "completed", "cancelled"]).optional(),
});

exports.vendorPaymentSchema = z.object({
   date: z.string().or(z.date()),
   reference: z.string().min(1),
   vendor: z.string(),
   amount: z.number().positive(),
   paymentMethod: z.enum(["cash", "bank", "cheque"]),
   account: z.string(),
   project: z.string().optional(),
   purchaseOrder: z.string().optional(),
   description: z.string().optional(),
   status: z.enum(["pending", "completed", "cancelled"]).optional(),
});

exports.cashAccountSchema = z.object({
   name: z.string().min(1),
   code: z.string().min(1),
   openingBalance: z.number().default(0),
   project: z.string().optional(),
   description: z.string().optional(),
   isActive: z.boolean().optional(),
});

exports.bankAccountSchema = z.object({
   name: z.string().min(1),
   code: z.string().min(1),
   bankName: z.string().min(1),
   accountNumber: z.string().min(1),
   branch: z.string().optional(),
   openingBalance: z.number().default(0),
   project: z.string().optional(),
   description: z.string().optional(),
   isActive: z.boolean().optional(),
});
