const service = require("../../services/hr.service");
const schemas = require("../../validators/hr.validation");

const handle = (fn, status = 200) => async (req, res) => {
   try {
      const data = await fn(req);
      res.status(status).json({ success: true, data });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.listDepartments = handle(() => service.listDepartments());
exports.createDepartment = handle((req) =>
   service.createDepartment(schemas.departmentSchema.parse(req.body)), 201);
exports.updateDepartment = handle((req) =>
   service.updateDepartment(req.params.id, schemas.departmentSchema.partial().parse(req.body)));
exports.deleteDepartment = handle((req) => service.deleteDepartment(req.params.id));

exports.listDesignations = handle(() => service.listDesignations());
exports.createDesignation = handle((req) =>
   service.createDesignation(schemas.designationSchema.parse(req.body)), 201);
exports.updateDesignation = handle((req) =>
   service.updateDesignation(req.params.id, schemas.designationSchema.partial().parse(req.body)));
exports.deleteDesignation = handle((req) => service.deleteDesignation(req.params.id));

exports.listLeaves = handle((req) =>
   service.listLeaveRequests({ user: req.user, status: req.query.status }));
exports.listLeaveEmployees = handle((req) => service.listLeaveEmployees(req.user));
exports.createLeave = handle((req) =>
   service.createLeaveRequest({
      ...schemas.leaveRequestSchema.parse(req.body),
   }, req.user), 201);
exports.managerReview = handle((req) => {
   const data = schemas.leaveReviewSchema.parse(req.body);
   return service.reviewLeaveRequest(req.params.id, data.action, data.note, req.user);
});
exports.hrReview = handle((req) => {
   const data = schemas.leaveReviewSchema.parse(req.body);
   return service.finalizeLeaveRequest(req.params.id, data.action, data.note, req.user._id);
});

exports.listSalaryStructures = handle(() => service.listSalaryStructures());
exports.createSalaryStructure = handle((req) =>
   service.createSalaryStructure(schemas.salaryStructureSchema.parse(req.body), req.user._id), 201);

exports.listPayrollPeriods = handle(() => service.listPayrollPeriods());
exports.createPayrollPeriod = handle((req) =>
   service.createPayrollPeriod(schemas.payrollPeriodSchema.parse(req.body), req.user._id), 201);
exports.generatePayroll = handle((req) => service.generatePayroll(req.params.id), 201);
exports.listPayrollEntries = handle((req) => service.getPayrollEntries(req.params.id));
exports.updatePayrollEntry = handle((req) =>
   service.updatePayrollEntry(req.params.entryId, schemas.payrollEntryAdjustmentSchema.parse(req.body)));
exports.approvePayroll = handle((req) => service.approvePayroll(req.params.id, req.user._id));
exports.getPayslip = handle(async (req) => {
   const data = await service.getPayslip(req.params.entryId);
   if (!data) throw new Error("Payslip not found");
   return data;
});
exports.listMyPayslips = handle((req) => service.listEmployeePayslips(req.user));
exports.getMyPayslip = handle((req) => service.getEmployeePayslip(req.params.entryId, req.user));
exports.payrollReport = handle((req) => service.getPayrollReport({
   from: req.query.from,
   to: req.query.to,
   department: req.query.department,
   site: req.query.site,
}));
