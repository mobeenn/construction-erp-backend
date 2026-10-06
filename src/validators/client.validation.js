const { z } = require("zod");

exports.clientSchema = z.object({
   name: z.string().min(2),
   contactPerson: z.string().optional(),
   phone: z.string().optional(),
   email: z.string().email().optional().or(z.literal("")),
   address: z.string().optional(),
   taxNo: z.string().optional(),
   taxInformation: z.string().optional(),
   paymentTerms: z.string().optional(),
   status: z.enum(["active", "inactive"]).optional(),
   notes: z.string().optional(),
});
