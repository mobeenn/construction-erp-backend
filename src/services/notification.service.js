const Notification = require("../models/Notification");
const User = require("../models/User");
const { query, fetchByIds } = require("../config/pgDb");
const { parentRowToDoc } = require("../db/relational");

/**
 * Fire-and-forget helper: never let a notification failure
 * break the business operation that triggered it.
 */
const safe = (promise) =>
   promise.catch((err) => console.error("Notification error:", err.message));

const pickFields = (doc, fields) => {
   if (!fields) return doc;
   const out = { _id: doc._id };
   String(fields)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((f) => {
         if (f in doc) out[f] = doc[f];
      });
   return out;
};

const POPULATE_SPECS = [
   { path: "project", collection: "projects", select: "name" },
   { path: "materialRequest", collection: "materialRequests", select: "requestNo" },
   { path: "purchaseOrder", collection: "purchaseOrders", select: "poNumber" },
   { path: "grn", collection: "grns", select: "grnNumber" },
   { path: "interimPayment", collection: "interimPayments", select: "billNo" },
   { path: "expense", collection: "expenses", select: "expenseNo" },
   { path: "leaveRequest", collection: "leaveRequests", select: "type" },
   { path: "payrollPeriod", collection: "payrollPeriods", select: "name" },
   { path: "inventory", collection: "inventory", select: "materialName" },
   { path: "createdBy", collection: "users", select: "name" },
];

const populateNotifications = async (docs) => {
   for (const spec of POPULATE_SPECS) {
      const ids = [
         ...new Set(
            docs
               .map((d) => d[spec.path])
               .filter((id) => id && typeof id !== "object")
               .map(String),
         ),
      ];
      if (!ids.length) continue;
      const map = await fetchByIds(spec.collection, ids);
      for (const doc of docs) {
         const id = doc[spec.path];
         if (!id || typeof id === "object") continue;
         const target = map[String(id)];
         if (target) doc[spec.path] = pickFields(target, spec.select);
      }
   }
   return docs;
};

const idOf = (v) => String(v?._id || v || "");

const usersByRoles = async (roles = []) => {
   const users = await User.find({ isActive: true });
   return users.filter((u) => roles.includes(u.role)).map((u) => u._id);
};

const excludeSelf = (ids, userId) =>
   ids.filter((id) => idOf(id) && idOf(id) !== idOf(userId));

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
 * Get notifications for a specific user (SQL WHERE + LIMIT, then batch populate)
 */
exports.getUserNotifications = async (userId, options = {}) => {
   const limit = Math.min(Number(options.limit) || 50, 100);
   const params = [String(userId)];
   let sql = `SELECT * FROM notifications WHERE user_id = $1`;
   if (options.unreadOnly) {
      sql += ` AND is_read = false`;
   }
   sql += ` ORDER BY created_at DESC LIMIT $2`;
   params.push(limit);

   const result = await query(sql, params);
   const docs = result.rows.map((row) => parentRowToDoc("notifications", row));
   return populateNotifications(docs);
};

/**
 * Get unread count for a user
 */
exports.getUnreadCount = async (userId) => {
   const result = await query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [String(userId)],
   );
   return result.rows[0]?.count || 0;
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
      { new: true },
   );
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllAsRead = async (userId) => {
   const result = await query(
      `UPDATE notifications SET is_read = true, updated_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [String(userId)],
   );
   return { matchedCount: result.rowCount, modifiedCount: result.rowCount };
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

/* -------------------------------------------------------------------------- */
/* Domain notify helpers (fire-and-forget from services)                      */
/* -------------------------------------------------------------------------- */

exports.notifyMaterialRequestSubmitted = async (request, userId) => {
   const recipients = excludeSelf(
      await usersByRoles(["admin", "store_manager", "purchase_manager"]),
      userId,
   );
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Material request submitted",
         message: `${request.requestNo || "Request"} for ${request.project?.name || "a project"} awaits review.`,
         type: "info",
         project: idOf(request.project) || null,
         materialRequest: request._id,
         createdBy: userId,
      }),
   );
};

exports.notifyMaterialRequestReviewed = async (request, userId) => {
   const targets = [];
   if (request.requestedBy) targets.push(idOf(request.requestedBy));
   const admins = await usersByRoles(["admin", "store_manager"]);
   targets.push(...admins.map(idOf));
   return safe(
      exports.createBulkNotifications(excludeSelf([...new Set(targets)], userId), {
         title: `Material request ${request.status}`,
         message: `${request.requestNo || "Request"} was marked ${request.status}.`,
         type: request.status === "approved" ? "success" : "warning",
         project: idOf(request.project) || null,
         materialRequest: request._id,
         createdBy: userId,
      }),
   );
};

exports.notifyPORequiresApproval = async (po, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "purchase_manager"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Purchase order needs approval",
         message: `${po.poNumber || "PO"} is ready for approval.`,
         type: "info",
         project: idOf(po.project) || null,
         purchaseOrder: po._id,
         createdBy: userId,
      }),
   );
};

exports.notifyPOReviewed = async (po, userId) => {
   const targets = [];
   if (po.createdBy) targets.push(idOf(po.createdBy));
   targets.push(...(await usersByRoles(["admin", "purchase_manager"])).map(idOf));
   return safe(
      exports.createBulkNotifications(excludeSelf([...new Set(targets)], userId), {
         title: `Purchase order ${po.status}`,
         message: `${po.poNumber || "PO"} was marked ${po.status}.`,
         type: po.status === "approved" ? "success" : "warning",
         project: idOf(po.project) || null,
         purchaseOrder: po._id,
         createdBy: userId,
      }),
   );
};

exports.notifyGRNCreated = async (grn, userId) => {
   const recipients = excludeSelf(
      await usersByRoles(["admin", "store_manager", "purchase_manager"]),
      userId,
   );
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "GRN recorded",
         message: `${grn.grnNumber || "GRN"} was created.`,
         type: "success",
         project: idOf(grn.project) || null,
         grn: grn._id,
         createdBy: userId,
      }),
   );
};

exports.notifyLowInventory = async (inventory, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "store_manager"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Low stock alert",
         message: `${inventory.materialName || "Material"} is at ${inventory.currentStock ?? 0} (min ${inventory.minimumStock ?? inventory.reorderLevel ?? 0}).`,
         type: "warning",
         project: idOf(inventory.project) || null,
         inventory: inventory._id,
         createdBy: userId,
      }),
   );
};

exports.notifyBudgetExceeded = async (project, spent, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "accountant", "project_manager"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Project budget exceeded",
         message: `${project.name || project.projectCode || "Project"} spend reached ${spent}.`,
         type: "error",
         project: project._id || project,
         createdBy: userId,
      }),
   );
};

exports.notifyInterimPaymentSubmitted = async (bill, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "accountant"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Interim payment submitted",
         message: `${bill.billNo || "Bill"} for ${bill.project?.name || "project"} was submitted.`,
         type: "info",
         project: idOf(bill.project) || null,
         interimPayment: bill._id,
         createdBy: userId,
      }),
   );
};

exports.notifyInterimPaymentApproved = async (bill, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "accountant"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Interim payment approved",
         message: `${bill.billNo || "Bill"} was approved.`,
         type: "success",
         project: idOf(bill.project) || null,
         interimPayment: bill._id,
         createdBy: userId,
      }),
   );
};

exports.notifyPaymentRecorded = async (bill, amount, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "accountant"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Payment recorded",
         message: `Payment of ${amount} recorded against ${bill.billNo || "bill"}.`,
         type: "success",
         project: idOf(bill.project) || null,
         interimPayment: bill._id,
         createdBy: userId,
      }),
   );
};

exports.notifyDailyReportSubmitted = async (report, project, user) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "project_manager"]), user?._id);
   if (project?.projectManager) recipients.push(idOf(project.projectManager));
   return safe(
      exports.createBulkNotifications([...new Set(excludeSelf(recipients, user?._id))], {
         title: "Daily report submitted",
         message: `Site report for ${project?.name || report.project?.name || "project"} is ready for review.`,
         type: "info",
         project: idOf(project) || idOf(report.project) || null,
         createdBy: user?._id,
      }),
   );
};

exports.notifyActivityDelayed = async (activity, project, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "project_manager"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Activity delayed",
         message: `${activity.title || activity.name || "Activity"} on ${project?.name || "project"} is delayed.`,
         type: "warning",
         project: idOf(project) || idOf(activity.project) || null,
         createdBy: userId,
      }),
   );
};

exports.notifyLeaveSubmitted = async (request, user) => {
   const recipients = excludeSelf(
      await usersByRoles(["admin", "hr", "project_manager", "site_supervisor"]),
      user?._id,
   );
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Leave request submitted",
         message: `${request.employee?.name || "Employee"} requested ${request.days || ""} day(s) leave.`,
         type: "info",
         project: idOf(request.project) || null,
         leaveRequest: request._id,
         createdBy: user?._id,
      }),
   );
};

exports.notifyLeaveReviewed = async (request, userId) => {
   const targets = [];
   const emp = request.employee;
   if (emp?.userAccount) targets.push(idOf(emp.userAccount));
   if (request.requestedBy) targets.push(idOf(request.requestedBy));
   targets.push(...(await usersByRoles(["admin", "hr"])).map(idOf));
   return safe(
      exports.createBulkNotifications(excludeSelf([...new Set(targets)], userId), {
         title: `Leave ${request.status}`,
         message: `Leave request for ${emp?.name || "employee"} is now ${String(request.status).replace(/_/g, " ")}.`,
         type: request.status === "approved" ? "success" : "warning",
         project: idOf(request.project) || null,
         leaveRequest: request._id,
         createdBy: userId,
      }),
   );
};

exports.notifyPayrollApproved = async (period, userId) => {
   const recipients = excludeSelf(await usersByRoles(["admin", "hr", "accountant"]), userId);
   return safe(
      exports.createBulkNotifications(recipients, {
         title: "Payroll approved",
         message: `${period.periodName || period.name || "Payroll period"} was approved.`,
         type: "success",
         payrollPeriod: period._id,
         createdBy: userId,
      }),
   );
};
