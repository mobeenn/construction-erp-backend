const { z } = require("zod");

exports.employeeSchema = z.object({
   name: z.string().min(3),

   cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/),

   phone: z.string().regex(/^03\d{9}$/),

   email: z.email().optional().or(z.literal("")),
   designation: z.string().trim().min(1),
   designationId: z.string().optional().or(z.literal("")),
   userAccount: z.string().optional().or(z.literal("")),
   department: z.string().optional().or(z.literal("")),
   employeeType: z.enum(["permanent", "contract", "daily_wage", "temporary"]).optional(),
   salary: z.number().nonnegative(),
   assignedSite: z.string().optional().or(z.literal("")),
   assignedProject: z.string().optional().or(z.literal("")),
   projectAssignments: z.array(z.string()).optional(),
   status: z.enum(["active", "inactive", "on_leave", "terminated"]).optional(),
   joiningDate: z.string().optional(),
   bankName: z.string().optional(),
   bankAccount: z.string().optional(),
   emergencyContact: z.string().optional(),
   leaveBalance: z.number().nonnegative().optional(),
});
