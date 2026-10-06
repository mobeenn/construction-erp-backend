const Notification = require("../models/Notification");
const User = require("../models/User");
const Employee = require("../models/Employee");

/**
 * Fire-and-forget helper: never let a notification failure
 * break the business operation that triggered it.
 */
const safe = (promise) =>
   promise.catch((err) => console.error("Notification error:", err.message));

/**
 * Create a notification for a specific user
 */
exports.createNotification = async (data) => {
   return await Notification.create({
      user: data.user,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      project: data.project || null,
      materialRequest: data.materialRequest || null,
      purchaseOrder: data.purchaseOrder || null,
      grn: data.grn || null,
      interimPayment: data.interimPayment || null,
      expense: data.expense || null,
      leaveRequest: data.leaveRequest || null,
      payrollPeriod: data.payrollPeriod || null,
      inventory: data.inventory || null,
      createdBy: data.createdBy || null,
   });
};

/**
 * Create notifications for multiple users
 */
exports.createBulkNotifications = async (users, data) => {
   const notifications = users.map((userId) => ({
      user: userId,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      project: data.project || null,
      materialRequest: data.materialRequest || null,
      purchaseOrder: data.purchaseOrder || null,
      grn: data.grn || null,
      interimPayment: data.interimPayment || null,
      expense: data.expense || null,
      leaveRequest: data.leaveRequest || null,
      payrollPeriod: data.payrollPeriod || null,
      inventory: data.inventory || null,
      createdBy: data.createdBy || null,
   }));

   const created = [];
   for (const notif of notifications) {
      const n = await Notification.create(notif);
      created.push(n);
   }
   return created;
};

/**
 * Get notifications for a specific user
 */
exports.getUserNotifications = async (userId, options = {}) => {
   const query = { user: userId };
   if (options.unreadOnly) query.isRead = false;

   return await Notification.find(query)
      .populate("project", "name")
      .populate("materialRequest", "requestNo")
      .populate("purchaseOrder", "poNumber")
      .populate("grn", "grnNumber")
      .populate("interimPayment", "billNo")
      .populate("expense", "expenseNo")
      .populate("leaveRequest", "leaveType")
      .populate("payrollPeriod", "periodName")
      .populate("inventory", "materialName")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(options.limit || 50);
};

/**
 * Get unread count for a user
 */
exports.getUnreadCount = async (userId) => {
   return await Notification.countDocuments({ user: userId, isRead: false });
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (notificationId, userId) => {
   const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
   });
   if (!notification) return null;
   return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
   );
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllAsRead = async (userId) => {
   return await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
   );
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (notificationId, userId) => {
   const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
   });
   if (!notification) return null;
   return await Notification.findByIdAndDelete(notificationId);
};

/**
 * Get users by role
 */
exports.getUsersByRole = async (roles) => {
   return await User.find({ role: { $in: roles }, isActive: true }).select("_id name email role");
};

/**
 * Get all admin users
 */
exports.getAdmins = async () => {
   return await User.find({ role: "admin", isActive: true }).select("_id name email");
};

/**
 * Get all accountant users
 */
exports.getAccountants = async () => {
   return await User.find({ role: "accountant", isActive: true }).select("_id name email");
};

/**
 * Get all project managers
 */
exports.getProjectManagers = async () => {
   return await User.find({ role: "project_manager", isActive: true }).select("_id name email");
};

/**
 * Get all purchase managers
 */
exports.getPurchaseManagers = async () => {
   return await User.find({ role: "purchase_manager", isActive: true }).select("_id name email");
};

/**
 * Get all store managers
 */
exports.getStoreManagers = async () => {
   return await User.find({ role: "store_manager", isActive: true }).select("_id name email");
};

/**
 * Get all HR users
 */
exports.getHRUsers = async () => {
   return await User.find({ role: "hr", isActive: true }).select("_id name email");
};

// ============ EVENT-SPECIFIC NOTIFICATIONS ============

/**
 * Notify when material request is submitted
 */
exports.notifyMaterialRequestSubmitted = async (request, submittedBy) => {
   const storeManagers = await exports.getStoreManagers();
   const admins = await exports.getAdmins();
   const recipients = [...storeManagers, ...admins].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "New Material Request",
      message: `Material request ${request.requestNo} has been submitted for project ${request.project?.name || "N/A"}`,
      type: "info",
      materialRequest: request._id,
      project: request.project?._id || request.project,
      createdBy: submittedBy,
   });
};

/**
 * Notify when material request is approved/rejected
 */
exports.notifyMaterialRequestReviewed = async (request, reviewedBy) => {
   const requester = request.requestedBy;
   if (!requester) return null;

   const status = request.status === "approved" ? "approved" : "rejected";
   const type = request.status === "approved" ? "success" : "warning";

   return await exports.createNotification({
      user: requester,
      title: `Material Request ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your material request ${request.requestNo} has been ${status}`,
      type,
      materialRequest: request._id,
      project: request.project?._id || request.project,
      createdBy: reviewedBy,
   });
};

/**
 * Notify when PO requires approval
 */
exports.notifyPORequiresApproval = async (po, submittedBy) => {
   const admins = await exports.getAdmins();
   const recipients = admins.map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "PO Requires Approval",
      message: `Purchase order ${po.poNumber} requires your approval`,
      type: "warning",
      purchaseOrder: po._id,
      project: po.project?._id || po.project,
      createdBy: submittedBy,
   });
};

/**
 * Notify when PO is approved/rejected
 */
exports.notifyPOReviewed = async (po, reviewedBy) => {
   const creator = po.createdBy || po.requestedBy;
   if (!creator) return null;

   const status = po.status === "approved" ? "approved" : "rejected";
   const type = po.status === "approved" ? "success" : "warning";

   return await exports.createNotification({
      user: creator,
      title: `Purchase Order ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your purchase order ${po.poNumber} has been ${status}`,
      type,
      purchaseOrder: po._id,
      project: po.project?._id || po.project,
      createdBy: reviewedBy,
   });
};

/**
 * Notify when GRN is created
 */
exports.notifyGRNCreated = async (grn, createdBy) => {
   const storeManagers = await exports.getStoreManagers();
   const admins = await exports.getAdmins();
   const recipients = [...storeManagers, ...admins].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "GRN Created",
      message: `Goods receipt note ${grn.grnNo} has been created`,
      type: "success",
      grn: grn._id,
      project: grn.project?._id || grn.project,
      createdBy,
   });
};

/**
 * Notify when project activity is delayed
 */
exports.notifyActivityDelayed = async (activity, project, notifiedBy) => {
   const admins = await exports.getAdmins();
   const projectManagers = await exports.getProjectManagers();
   const recipients = [...admins, ...projectManagers].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "Project Activity Delayed",
      message: `Activity "${activity.title}" in project ${project?.name || "N/A"} is delayed`,
      type: "warning",
      project: project?._id,
      createdBy: notifiedBy,
   });
};

/**
 * Notify when project budget exceeds threshold
 */
exports.notifyBudgetExceeded = async (project, currentCost, notifiedBy) => {
   const admins = await exports.getAdmins();
   const accountants = await exports.getAccountants();
   const recipients = [...admins, ...accountants].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "Budget Exceeded",
      message: `Project ${project?.name || "N/A"} has exceeded its budget. Current cost: ${currentCost}`,
      type: "error",
      project: project?._id,
      createdBy: notifiedBy,
   });
};

/**
 * Notify when interim payment is submitted
 */
exports.notifyInterimPaymentSubmitted = async (payment, submittedBy) => {
   const admins = await exports.getAdmins();
   const accountants = await exports.getAccountants();
   const recipients = [...admins, ...accountants].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "Interim Payment Submitted",
      message: `Interim payment ${payment.paymentNo} has been submitted for approval`,
      type: "info",
      interimPayment: payment._id,
      project: payment.project?._id || payment.project,
      createdBy: submittedBy,
   });
};

/**
 * Notify when interim payment is approved
 */
exports.notifyInterimPaymentApproved = async (payment, approvedBy) => {
   const submitter = payment.submittedBy;
   if (!submitter) return null;

   return await exports.createNotification({
      user: submitter,
      title: "Interim Payment Approved",
      message: `Your interim payment ${payment.paymentNo} has been approved`,
      type: "success",
      interimPayment: payment._id,
      project: payment.project?._id || payment.project,
      createdBy: approvedBy,
   });
};

/**
 * Notify when payment is recorded
 */
exports.notifyPaymentRecorded = async (payment, amount, recordedBy) => {
   const admins = await exports.getAdmins();
   const accountants = await exports.getAccountants();
   const recipients = [...admins, ...accountants].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "Payment Recorded",
      message: `Payment of ${amount} has been recorded for ${payment.paymentNo}`,
      type: "success",
      interimPayment: payment._id,
      project: payment.project?._id || payment.project,
      createdBy: recordedBy,
   });
};

/**
 * Resolve an employee id to the id of the user account
 * linked to that employee (notifications belong to users).
 */
const resolveEmployeeUser = async (employeeId) => {
   if (!employeeId) return null;
   const employee = await Employee.findById(employeeId);
   return employee?.userAccount || null;
};

/**
 * Notify when leave is submitted
 */
exports.notifyLeaveSubmitted = async (leaveRequest, submittedBy) => {
   const hrs = await exports.getHRUsers();
   const admins = await exports.getAdmins();
   const recipients = [...hrs, ...admins].map((u) => u._id);

   const employee = await Employee.findById(leaveRequest.employee);

   return await exports.createBulkNotifications(recipients, {
      title: "Leave Request Submitted",
      message: `Leave request from ${employee?.name || submittedBy?.name || "employee"} is pending review`,
      type: "info",
      leaveRequest: leaveRequest._id,
      project: leaveRequest.project?._id || leaveRequest.project,
      createdBy: submittedBy?._id || submittedBy,
   });
};

/**
 * Notify when leave is approved/rejected
 */
exports.notifyLeaveReviewed = async (leaveRequest, reviewedBy) => {
   const employeeUser = await resolveEmployeeUser(leaveRequest.employee);
   if (!employeeUser) return null;

   const status = leaveRequest.status === "approved" ? "approved" : "rejected";
   const type = leaveRequest.status === "approved" ? "success" : "warning";

   return await exports.createNotification({
      user: employeeUser,
      title: `Leave ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your ${leaveRequest.type || ""} leave request (${leaveRequest.days || 0} day(s)) has been ${status}`,
      type,
      leaveRequest: leaveRequest._id,
      project: leaveRequest.project?._id || leaveRequest.project,
      createdBy: reviewedBy,
   });
};

/**
 * Notify when payroll is approved
 */
exports.notifyPayrollApproved = async (payrollPeriod, approvedBy) => {
   const admins = await exports.getAdmins();
   const accountants = await exports.getAccountants();
   const recipients = [...admins, ...accountants].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "Payroll Approved",
      message: `Payroll for period ${payrollPeriod?.name || "N/A"} has been approved`,
      type: "success",
      payrollPeriod: payrollPeriod?._id,
      createdBy: approvedBy,
   });
};

/**
 * Notify when low inventory is detected
 */
exports.notifyLowInventory = async (inventoryItem, notifiedBy) => {
   const storeManagers = await exports.getStoreManagers();
   const admins = await exports.getAdmins();
   const recipients = [...storeManagers, ...admins].map((u) => u._id);

   return await exports.createBulkNotifications(recipients, {
      title: "Low Inventory Alert",
      message: `${inventoryItem.materialName} is running low. Current stock: ${inventoryItem.currentStock} ${inventoryItem.unit || "units"}`,
      type: "warning",
      inventory: inventoryItem._id,
      project: inventoryItem.project?._id || inventoryItem.project,
      createdBy: notifiedBy,
   });
};

/**
 * Notify when a site daily report is submitted
 * (project manager + admins)
 */
exports.notifyDailyReportSubmitted = async (report, project, submittedBy) => {
   const recipients = [];
   if (project?.projectManager) recipients.push(project.projectManager);
   const admins = await exports.getAdmins();
   admins.forEach((admin) => {
      if (!recipients.some((r) => String(r) === String(admin._id))) {
         recipients.push(admin._id);
      }
   });

   return await exports.createBulkNotifications(recipients, {
      title: "Daily Report Submitted",
      message: `Site daily report for ${project?.name || "N/A"} dated ${String(report.reportDate || "").slice(0, 10)} is pending review`,
      type: "info",
      dailyReport: report._id,
      project: project?._id || project,
      createdBy: submittedBy?._id || submittedBy,
   });
};
