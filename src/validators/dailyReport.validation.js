const { z } = require("zod");

const quantityLine = z.object({
   inventory: z.string().min(1),
   quantity: z.number().positive(),
});

exports.dailyReportSchema = z.object({
   project: z.string().min(1),
   site: z.string().trim().min(1),
   reportDate: z.string().min(1),
   weather: z.string().trim().min(1),
   manpower: z.array(z.object({
      trade: z.string().trim().min(1),
      count: z.number().int().nonnegative(),
   })).default([]),
   equipment: z.array(z.object({
      name: z.string().trim().min(1),
      quantity: z.number().positive(),
      hours: z.number().nonnegative().optional(),
   })).default([]),
   workPerformed: z.string().trim().min(1),
   activities: z.array(z.object({
      activity: z.string().min(1),
      progress: z.number().min(0).max(100).optional(),
      quantityCompleted: z.number().nonnegative().optional(),
      status: z.enum(["not_started", "in_progress", "delayed", "completed", "on_hold"]).optional(),
      remarks: z.string().optional(),
   })).default([]),
   materialConsumed: z.array(quantityLine).default([]),
   materialReceived: z.array(quantityLine).default([]),
   safetyIncidents: z.string().optional().default(""),
   issues: z.string().optional().default(""),
   delays: z.string().optional().default(""),
   instructions: z.string().optional().default(""),
   remarks: z.string().optional().default(""),
});
