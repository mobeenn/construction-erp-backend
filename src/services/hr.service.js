const Department = require("../models/Department");
const Designation = require("../models/Designation");
const Employee = require("../models/Employee");
const LeaveRequest = require("../models/LeaveRequest");
const SalaryStructure = require("../models/SalaryStructure");
const PayrollPeriod = require("../models/PayrollPeriod");
const PayrollEntry = require("../models/PayrollEntry");
const Attendance = require("../models/Attendance");
const Project = require("../models/Project");
const {
   notifyLeaveSubmitted,
   notifyLeaveReviewed,
   notifyPayrollApproved,
} = require("./notification.service");

const id = (value) => String(value?._id || value || "");
const daysBetween = (start, end) =>
   Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
const dateKey = (value) => String(value || "").slice(0, 10);
const activeOnPeriod = (structure, period) =>
   dateKey(structure.effectiveFrom) <= period.endDate &&
   (!structure.effectiveTo || dateKey(structure.effectiveTo) >= period.startDate);

const amountForLine = (line, basicSalary) =>
   line.type === "percentage" ? basicSalary * Number(line.amount || 0) / 100 : Number(line.amount || 0);
const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

const calculateEntry = (entry) => {
   const basicSalary = Number(entry.basicSalary || 0);
   const allowancesTotal = roundMoney((entry.allowances || []).reduce((sum, line) => sum + amountForLine(line, basicSalary), 0));
   const deductionsTotal = roundMoney((entry.deductions || []).reduce((sum, line) => sum + amountForLine(line, basicSalary), 0));
   const overtimePay = roundMoney(Number(entry.overtimeHours || 0) * Number(entry.overtimeRate || 0));
   return {
      ...entry,
      allowancesTotal,
      deductionsTotal,
      overtimePay,
      grossSalary: roundMoney(basicSalary + allowancesTotal + overtimePay),
      netSalary: roundMoney(basicSalary + allowancesTotal + overtimePay - deductionsTotal),
   };
};

exports.listDepartments = () => Department.find().populate("head", "name").sort({ name: 1 });
exports.createDepartment = async (data) => {
   if (await Department.findOne({ code: data.code })) throw new Error("Department code already exists");
   return Department.create(data);
};
exports.updateDepartment = async (departmentId, data) => {
   if (data.code) {
      const duplicate = await Department.findOne({ code: data.code });
      if (duplicate && id(duplicate) !== departmentId) throw new Error("Department code already exists");
   }
   return Department.findByIdAndUpdate(departmentId, data, { new: true });
};
exports.deleteDepartment = async (departmentId) => {
   const employees = await Employee.find();
   const designations = await Designation.find();
   if (employees.some((employee) => id(employee.department) === departmentId) ||
      designations.some((designation) => id(designation.department) === departmentId)) {
      throw new Error("Department is in use by employees or designations");
   }
   return Department.findByIdAndDelete(departmentId);
};

exports.listDesignations = () => Designation.find().populate("department", "name code").sort({ title: 1 });
exports.createDesignation = async (data) => {
   if (await Designation.findOne({ code: data.code })) throw new Error("Designation code already exists");
   return Designation.create(data);
};
exports.updateDesignation = async (designationId, data) => {
   if (data.code) {
      const duplicate = await Designation.findOne({ code: data.code });
      if (duplicate && id(duplicate) !== designationId) throw new Error("Designation code already exists");
   }
   const current = await Designation.findById(designationId);
   if (!current) throw new Error("Designation not found");
   const updated = await Designation.findByIdAndUpdate(designationId, data, { new: true });
   if (data.title && data.title !== current.title) {
      const employees = await Employee.find();
      for (const employee of employees.filter((item) => id(item.designationId) === designationId)) {
         employee.designation = data.title;
         await employee.save();
      }
   }
   return updated;
};
exports.deleteDesignation = async (designationId) => {
   const employees = await Employee.find();
   const designation = await Designation.findById(designationId);
   if (employees.some((employee) => employee.designationId === designationId ||
      employee.designation === designation?.title)) {
      throw new Error("Designation is assigned to employees");
   }
   return Designation.findByIdAndDelete(designationId);
};

exports.listLeaveRequests = async ({ user, status }) => {
   let requests = await LeaveRequest.find()
      .populate("employee", "employeeId name designation department assignedProject assignedSite leaveBalance")
      .populate("project", "name projectCode")
      .populate("managerReviewedBy", "name")
      .populate("hrReviewedBy", "name")
      .sort({ createdAt: -1 });
   if (user.role === "employee") {
      const employee = await Employee.findOne({ userAccount: id(user) });
      requests = requests.filter((request) => employee && id(request.employee) === id(employee));
   }
   if (user.role === "project_manager" || user.role === "site_supervisor") {
      const projects = await Project.find();
      const managedIds = projects
         .filter((project) => id(project.projectManager) === id(user) ||
            id(project.siteSupervisor) === id(user) || id(project.supervisor) === id(user))
         .map((project) => id(project));
      requests = requests.filter((request) =>
         managedIds.includes(id(request.project)) ||
         managedIds.includes(id(request.employee?.assignedProject)));
   }
   if (status) requests = requests.filter((request) => request.status === status);
   return requests;
};

exports.createLeaveRequest = async (data, user) => {
   if (data.endDate < data.startDate) throw new Error("End date cannot be before start date");
   const employee = await Employee.findById(data.employee);
   if (!employee) throw new Error("Employee not found");
   if (user.role === "employee" && id(employee.userAccount) !== id(user)) {
      throw new Error("Employees can only request leave for their own profile");
   }
   if (user.role === "employee" && employee.assignedProject &&
      data.project && id(employee.assignedProject) !== id(data.project)) {
      throw new Error("Employees can only request leave for their assigned project");
   }
   if (["project_manager", "site_supervisor"].includes(user.role)) {
      const assignedProjects = await Project.find();
      const managed = assignedProjects.some((project) =>
         id(project) === id(data.project || employee.assignedProject) &&
         [project.projectManager, project.siteSupervisor, project.supervisor].some((assignee) => id(assignee) === id(user)));
      if (!managed) throw new Error("You can only request leave for employees assigned to your project or site");
   }
   if (data.project && !await Project.findById(data.project)) throw new Error("Project not found");
   const requests = await LeaveRequest.find();
   if (requests.some((request) =>
      id(request.employee) === id(employee) &&
      ["pending_manager", "pending_hr", "approved"].includes(request.status) &&
      request.startDate <= data.endDate && request.endDate >= data.startDate)) {
      throw new Error("This employee already has a pending or approved leave during those dates");
   }
   return LeaveRequest.create({
      ...data,
      project: data.project || employee.assignedProject || "",
      days: daysBetween(data.startDate, data.endDate),
      requestedBy: user._id,
      status: "pending_manager",
   }).then(async (request) => {
      const populated = await LeaveRequest.findById(request._id)
         .populate("employee", "name userAccount")
         .populate("project", "name projectCode");
      await notifyLeaveSubmitted(populated, user).catch(() => {});
      return request;
   });
};

exports.listLeaveEmployees = async (user) => {
   let employees = await Employee.find()
      .populate("assignedProject", "name projectCode")
      .sort({ name: 1 });
   if (["project_manager", "site_supervisor"].includes(user.role)) {
      const projects = await Project.find();
      const managed = new Set(projects
         .filter((project) => [project.projectManager, project.siteSupervisor, project.supervisor]
            .some((assignee) => id(assignee) === id(user)))
         .map((project) => id(project)));
      employees = employees.filter((employee) => managed.has(id(employee.assignedProject)));
   }
   if (user.role === "employee") {
      employees = employees.filter((employee) => id(employee.userAccount) === id(user));
   }
   return employees;
};

exports.reviewLeaveRequest = async (requestId, action, note, user) => {
   const request = await LeaveRequest.findById(requestId);
   if (!request) throw new Error("Leave request not found");
   if (request.status !== "pending_manager") throw new Error("Leave request is not awaiting manager review");
   if (user.role === "project_manager" || user.role === "site_supervisor") {
      const projects = await Project.find();
      const project = projects.find((item) => id(item) === id(request.project));
      if (!project || ![project.projectManager, project.siteSupervisor, project.supervisor].some((assignee) => id(assignee) === id(user))) {
         throw new Error("You are not the manager for this employee's project");
      }
   }
   request.managerReviewedBy = user._id;
   request.managerReviewedAt = new Date().toISOString();
   request.managerReviewNote = note || "";
   request.status = action === "approve" ? "pending_hr" : "rejected";
   if (action === "reject") request.hrReviewNote = "Rejected during manager review";
   await request.save();

   if (action === "reject") {
      const populated = await LeaveRequest.findById(request._id)
         .populate("employee", "name userAccount")
         .populate("project", "name projectCode");
      await notifyLeaveReviewed(populated, user._id).catch(() => {});
   }

   return request;
};

exports.finalizeLeaveRequest = async (requestId, action, note, userId) => {
   const request = await LeaveRequest.findById(requestId);
   if (!request) throw new Error("Leave request not found");
   if (request.status !== "pending_hr") throw new Error("Leave request is not awaiting HR approval");
   request.hrReviewedBy = userId;
   request.hrReviewedAt = new Date().toISOString();
   request.hrReviewNote = note || "";
   request.status = action === "approve" ? "approved" : "rejected";
   if (action === "approve") {
      const employee = await Employee.findById(request.employee);
      if (!employee) throw new Error("Employee not found");
      if (["annual", "casual"].includes(request.type)) {
         const balance = Number(employee.leaveBalance ?? 12);
         if (request.days > balance) throw new Error("Insufficient leave balance");
         employee.leaveBalance = balance - request.days;
      }
      await employee.save();
   }
   await request.save();

   const populated = await LeaveRequest.findById(request._id)
      .populate("employee", "name userAccount")
      .populate("project", "name projectCode");
   await notifyLeaveReviewed(populated, userId).catch(() => {});

   return request;
};

exports.listSalaryStructures = async () => SalaryStructure.find()
   .populate("employee", "employeeId name designation department assignedSite")
   .sort({ effectiveFrom: -1 });

exports.createSalaryStructure = async (data, userId) => {
   const employee = await Employee.findById(data.employee);
   if (!employee) throw new Error("Employee not found");
   const current = await SalaryStructure.find();
   const applicableStructures = current.filter((structure) =>
      id(structure.employee) === data.employee &&
      structure.status === "active" &&
      dateKey(structure.effectiveFrom) >= data.effectiveFrom);
   if (applicableStructures.some((structure) => dateKey(structure.effectiveFrom) > data.effectiveFrom)) {
      throw new Error("The effective date overlaps a future salary structure");
   }
   const affectedPeriods = await PayrollPeriod.find();
   if (affectedPeriods.some((period) => period.locked &&
      data.effectiveFrom >= period.startDate && data.effectiveFrom <= period.endDate)) {
      throw new Error("A salary change cannot be made effective inside an approved payroll period");
   }
   for (const structure of current) {
      if (id(structure.employee) === data.employee && structure.status === "active" &&
         dateKey(structure.effectiveFrom) <= data.effectiveFrom &&
         (!structure.effectiveTo || dateKey(structure.effectiveTo) >= data.effectiveFrom)) {
         structure.effectiveTo = new Date(Date.parse(`${data.effectiveFrom}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
         await structure.save();
      }
   }
   if (data.effectiveFrom <= new Date().toISOString().slice(0, 10)) {
      employee.salary = data.basicSalary;
      await employee.save();
   }
   return SalaryStructure.create({ ...data, createdBy: userId });
};

exports.listPayrollPeriods = async () => PayrollPeriod.find().sort({ startDate: -1 });

exports.createPayrollPeriod = async (data, userId) => {
   if (data.endDate < data.startDate) throw new Error("Payroll period end date cannot be before start date");
   if (data.payDate < data.endDate) throw new Error("Pay date cannot be before the period end date");
   const existing = await PayrollPeriod.find();
   if (existing.some((period) => data.startDate <= period.endDate && data.endDate >= period.startDate)) {
      throw new Error("Payroll periods cannot overlap");
   }
   return PayrollPeriod.create({ ...data, createdBy: userId });
};

exports.generatePayroll = async (periodId) => {
   const period = await PayrollPeriod.findById(periodId);
   if (!period) throw new Error("Payroll period not found");
   if (period.locked || period.status !== "draft") throw new Error("Payroll can only be generated for a draft period");
   const existingEntries = await PayrollEntry.find();
   if (existingEntries.some((entry) => id(entry.period) === periodId)) {
      throw new Error("Payroll has already been generated for this period");
   }
   const employees = (await Employee.find()).filter((employee) => employee.status === "active");
   const attendance = await Attendance.find();
   const structures = await SalaryStructure.find();
   const entries = [];
   for (const employee of employees) {
      const structure = structures
         .filter((item) => id(item.employee) === id(employee) &&
            item.status === "active" && activeOnPeriod(item, period))
         .sort((left, right) => dateKey(right.effectiveFrom).localeCompare(dateKey(left.effectiveFrom)))[0];
      const basicSalary = Number(structure?.basicSalary ?? employee.salary ?? 0);
      const attendanceByDate = new Map();
      attendance.filter((item) =>
         id(item.employee) === id(employee) &&
         dateKey(item.date) >= period.startDate && dateKey(item.date) <= period.endDate)
         .forEach((item) => attendanceByDate.set(dateKey(item.date), item));
      const employeeAttendance = [...attendanceByDate.values()];
      const overtimeHours = employeeAttendance.reduce((sum, item) => sum + Number(item.overtimeHours || 0), 0);
      const payroll = calculateEntry({
         period: periodId,
         employee: id(employee),
         salaryStructure: structure?._id || "",
         basicSalary,
         allowances: structure?.allowances || [],
         deductions: structure?.deductions || [],
         overtimeHours,
         overtimeRate: Number(structure?.overtimeRate || 0),
         attendanceDays: employeeAttendance.filter((item) => item.status === "present").length,
         currency: structure?.currency || "PKR",
         status: "draft",
      });
      entries.push(await PayrollEntry.create(payroll));
   }
   const total = entries.reduce((sum, entry) => sum + entry.netSalary, 0);
   period.employeeCount = entries.length;
   period.totals = {
      basicSalary: entries.reduce((sum, entry) => sum + entry.basicSalary, 0),
      allowances: entries.reduce((sum, entry) => sum + entry.allowancesTotal, 0),
      overtime: entries.reduce((sum, entry) => sum + entry.overtimePay, 0),
      deductions: entries.reduce((sum, entry) => sum + entry.deductionsTotal, 0),
      netSalary: total,
   };
   await period.save();
   return entries;
};

exports.getPayrollEntries = async (periodId) => PayrollEntry.find({ period: periodId })
   .populate("employee", "employeeId name designation department assignedSite assignedProject")
   .sort({ createdAt: 1 });

exports.updatePayrollEntry = async (entryId, data) => {
   const entry = await PayrollEntry.findById(entryId);
   if (!entry) throw new Error("Payroll entry not found");
   const period = await PayrollPeriod.findById(entry.period);
   if (!period || period.locked || period.status !== "draft") throw new Error("Approved payroll is locked and cannot be edited");
   const updated = calculateEntry({ ...entry, ...data });
   const saved = await PayrollEntry.findByIdAndUpdate(entryId, updated, { new: true });
   const entries = await PayrollEntry.find({ period: id(period) });
   period.totals = {
      basicSalary: entries.reduce((sum, item) => sum + Number(item.basicSalary || 0), 0),
      allowances: entries.reduce((sum, item) => sum + Number(item.allowancesTotal || 0), 0),
      overtime: entries.reduce((sum, item) => sum + Number(item.overtimePay || 0), 0),
      deductions: entries.reduce((sum, item) => sum + Number(item.deductionsTotal || 0), 0),
      netSalary: entries.reduce((sum, item) => sum + Number(item.netSalary || 0), 0),
   };
   await period.save();
   return saved;
};

exports.approvePayroll = async (periodId, userId) => {
   const period = await PayrollPeriod.findById(periodId);
   if (!period) throw new Error("Payroll period not found");
   if (period.status !== "draft" || period.locked) throw new Error("Payroll period has already been reviewed");
   const entries = await PayrollEntry.find({ period: periodId });
   if (!entries.length) throw new Error("Generate payroll before approval");
   for (const entry of entries) {
      entry.status = "approved";
      await entry.save();
   }
   period.status = "approved";
   period.locked = true;
   period.approvedBy = userId;
   period.approvedAt = new Date().toISOString();
   await period.save();

   const populated = await PayrollPeriod.findById(period._id);
   await notifyPayrollApproved(populated, userId).catch(() => {});

   return period;
};

exports.getPayslip = async (entryId) => {
   const entry = await PayrollEntry.findById(entryId);
   if (!entry) return null;
   const [employee, period, structure] = await Promise.all([
      Employee.findById(entry.employee),
      PayrollPeriod.findById(entry.period),
      entry.salaryStructure ? SalaryStructure.findById(entry.salaryStructure) : null,
   ]);
   return { ...entry, employee, period, structure };
};

exports.listEmployeePayslips = async (user) => {
   const employee = await Employee.findOne({ userAccount: id(user) });
   if (!employee) throw new Error("Employee profile is not linked to this account");
   const periods = await PayrollPeriod.find();
   const periodMap = new Map(periods.map((period) => [id(period), period]));
   const entries = await PayrollEntry.find({ employee: id(employee) });
   return entries
      .filter((entry) => periodMap.get(id(entry.period))?.locked)
      .map((entry) => ({ ...entry, period: periodMap.get(id(entry.period)) }))
      .sort((left, right) => dateKey(right.period?.endDate).localeCompare(dateKey(left.period?.endDate)));
};

exports.getEmployeePayslip = async (entryId, user) => {
   const employee = await Employee.findOne({ userAccount: id(user) });
   if (!employee) throw new Error("Employee profile is not linked to this account");
   const entry = await PayrollEntry.findById(entryId);
   if (!entry || id(entry.employee) !== id(employee)) throw new Error("Payslip not found");
   const period = await PayrollPeriod.findById(entry.period);
   if (!period?.locked) throw new Error("Payslip is available after payroll approval");
   return exports.getPayslip(entryId);
};

exports.getPayrollReport = async ({ from, to, department, site }) => {
   const periods = await PayrollPeriod.find();
   const periodIds = new Set(periods.filter((period) =>
      (!from || period.endDate >= from) && (!to || period.startDate <= to))
      .map((period) => id(period)));
   const entries = await PayrollEntry.find().populate("employee", "employeeId name designation department assignedSite");
   const filtered = entries.filter((entry) =>
      periodIds.has(id(entry.period)) &&
      (!department || id(entry.employee?.department) === department) &&
      (!site || entry.employee?.assignedSite === site));
   return {
      totals: filtered.reduce((result, entry) => ({
         employees: result.employees + 1,
         basicSalary: result.basicSalary + Number(entry.basicSalary || 0),
         allowances: result.allowances + Number(entry.allowancesTotal || 0),
         overtime: result.overtime + Number(entry.overtimePay || 0),
         deductions: result.deductions + Number(entry.deductionsTotal || 0),
         netSalary: result.netSalary + Number(entry.netSalary || 0),
      }), { employees: 0, basicSalary: 0, allowances: 0, overtime: 0, deductions: 0, netSalary: 0 }),
      periods: periods.filter((period) => periodIds.has(id(period))),
      entries: filtered,
   };
};
