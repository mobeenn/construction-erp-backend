const { z } = require("zod");

const num = z.number().nonnegative();

exports.interimPaymentSchema = z
   .object({
      project: z.string(),
      contract: z.string().optional().nullable(),
      client: z.string().optional().nullable(),
      periodFrom: z.string().optional(),
      periodTo: z.string().optional(),
      submissionDate: z.string().optional(),
      workCompletedAmount: num.optional(),
      previousCertifiedAmount: num.optional(),
      currentGrossAmount: num.optional(),
      grossAmount: num.optional(),
      advanceRecovery: num.optional(),
      retention: num.optional(),
      tax: num.optional(),
      otherDeductions: num.optional(),
      approvedAmount: num.optional(),
      paidAmount: num.optional(),
      description: z.string().optional(),
      remarks: z.string().optional(),
      status: z
         .enum(["draft", "submitted", "under_review", "approved", "partially_paid", "paid", "rejected"])
         .optional(),
   })
   .refine((d) => d.currentGrossAmount !== undefined || d.grossAmount !== undefined, {
      message: "currentGrossAmount (or grossAmount) is required",
   });
