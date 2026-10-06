const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const controller = require("../controllers/hr/hr.controller");
const { authorizePermission } = require("../middlewares/permission.middleware");
const hrAdmin = authorize("admin", "hr");
const manager = authorize("admin", "hr", "project_manager", "site_supervisor");
const payrollViewer = authorize("admin", "hr", "accountant");

router.use(protect);

router.get("/departments", authorizePermission("employees", "view"), controller.listDepartments);
router.post("/departments", authorizePermission("employees", "manage"), controller.createDepartment);
router.put("/departments/:id", authorizePermission("employees", "manage"), controller.updateDepartment);
router.delete("/departments/:id", authorizePermission("employees", "manage"), controller.deleteDepartment);
router.get("/designations", authorizePermission("employees", "view"), controller.listDesignations);
router.post("/designations", authorizePermission("employees", "manage"), controller.createDesignation);
router.put("/designations/:id", authorizePermission("employees", "manage"), controller.updateDesignation);
router.delete("/designations/:id", authorizePermission("employees", "manage"), controller.deleteDesignation);

router.get("/leaves", authorizePermission("leave", "view"), controller.listLeaves);
router.get("/leave-employees", authorizePermission("leave", "view"), controller.listLeaveEmployees);
router.post("/leaves", authorizePermission("leave", "create"), controller.createLeave);
router.put("/leaves/:id/manager-review", authorizePermission("leave", "approve"), controller.managerReview);
router.put("/leaves/:id/hr-review", authorizePermission("leave", "manage"), controller.hrReview);

router.get("/salary-structures", authorizePermission("payroll", "view"), controller.listSalaryStructures);
router.post("/salary-structures", authorizePermission("payroll", "manage"), controller.createSalaryStructure);
router.get("/my-payslips", authorizePermission("payroll", "view"), controller.listMyPayslips);
router.get("/my-payslips/:entryId", authorizePermission("payroll", "view"), controller.getMyPayslip);

router.get("/payroll-periods", authorizePermission("payroll", "view"), controller.listPayrollPeriods);
router.post("/payroll-periods", authorizePermission("payroll", "manage"), controller.createPayrollPeriod);
router.post("/payroll-periods/:id/generate", authorizePermission("payroll", "manage"), controller.generatePayroll);
router.get("/payroll-periods/:id/entries", authorizePermission("payroll", "view"), controller.listPayrollEntries);
router.put("/payroll-entries/:entryId", authorizePermission("payroll", "edit"), controller.updatePayrollEntry);
router.put("/payroll-periods/:id/approve", authorizePermission("payroll", "approve"), controller.approvePayroll);
router.get("/payroll-entries/:entryId/payslip", authorizePermission("payroll", "view"), controller.getPayslip);
router.get("/payroll-reports", authorizePermission("reports", "view"), controller.payrollReport);

module.exports = router;
