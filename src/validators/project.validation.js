const { z } = require("zod");

exports.projectStatus = z.enum([
   "planning",
   "tender",
   "awarded",
   "mobilization",
   "in_progress",
   "on_hold",
   "completed",
   "cancelled",
]);

exports.projectSchema = z.object({
   name: z.string().min(3),
   location: z.string(),
   description: z.string().optional(),
   budget: z.number().nonnegative(),
   startDate: z.string(),
   endDate: z.string().optional(),
   actualEndDate: z.string().optional().nullable(),
   supervisor: z.string().optional(),
   client: z.string().optional().nullable(),
   contract: z.string().optional().nullable(),
   projectManager: z.string().optional(),
   siteSupervisor: z.string().optional(),
   engineers: z.array(z.string()).optional(),
   employees: z.array(z.string()).optional(),
   contractors: z.array(z.string()).optional(),
   status: exports.projectStatus.optional(),
   priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
   contractValue: z.number().nonnegative().optional(),
   progress: z.number().min(0).max(100).optional(),
});

exports.updateProjectSchema = exports.projectSchema.partial();
