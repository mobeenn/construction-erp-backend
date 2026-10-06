const { z } = require("zod");

const moneyLine = z.object({
   name: z.string().trim().min(1),
   amount: z.number().nonnegative(),
   type: z.enum(["fixed", "percentage"]).default("fixed"),
});

exports.departmentSchema = z.object({
   name: z.string().trim().min(2),
   code: z.string().trim().min(2),
   description: z.string().optional().default(""),
   head: z.string().optional().nullable(),
   status: z.enum(["active", "inactive"]).optional(),
});

exports.designationSchema = z.object({
   title: z.string().trim().min(2),
   code: z.string().trim().min(2),
   department: z.string().optional().nullable(),
   level: z.string().optional().default(""),
   description: z.string().optional().default(""),
   status: z.enum(["active", "inactive"]).optional(),
});

exports.leaveRequestSchema = z.object({
   employee: z.string().min(1),
   type: z.enum(["annual", "sick", "casual", "unpaid", "maternity", "paternity", "bereavement", "other"]),
   startDate: z.iso.date(),
   endDate: z.iso.date(),
   reason: z.string().trim().min(5),
   project: z.string().optional().nullable(),
});

exports.leaveReviewSchema = z.object({
   action: z.enum(["approve", "reject"]),
   note: z.string().optional().default(""),
});

exports.salaryStructureSchema = z.object({
   employee: z.string().min(1),
   basicSalary: z.number().nonnegative(),
   currency: z.string().trim().min(3).default("PKR"),
   payFrequency: z.enum(["monthly", "daily", "hourly"]).default("monthly"),
   overtimeRate: z.number().nonnegative().default(0),
   allowances: z.array(moneyLine).default([]),
   deductions: z.array(moneyLine).default([]),
   effectiveFrom: z.iso.date(),
   effectiveTo: z.iso.date().optional().nullable(),
   status: z.enum(["active", "inactive"]).optional(),
});

exports.payrollPeriodSchema = z.object({
   name: z.string().trim().min(3),
   startDate: z.iso.date(),
   endDate: z.iso.date(),
   payDate: z.iso.date(),
});

exports.payrollEntryAdjustmentSchema = z.object({
   allowances: z.array(moneyLine).optional(),
   deductions: z.array(moneyLine).optional(),
   overtimeHours: z.number().nonnegative().optional(),
   overtimeRate: z.number().nonnegative().optional(),
   notes: z.string().optional(),
});
