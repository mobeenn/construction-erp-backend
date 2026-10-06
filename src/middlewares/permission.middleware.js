const PermissionPolicy = require("../models/PermissionPolicy");
const { DEFAULT_POLICIES, normalizePolicies, RESOURCES, ACTIONS } = require("../config/permissions");

const getPolicies = async () => {
   const saved = await PermissionPolicy.findOne({ key: "role-policies" });
   return saved ? normalizePolicies(saved.policies) : DEFAULT_POLICIES;
};

const hasPermission = async (user, resource, action) => {
   if (!user || !RESOURCES.includes(resource) || !ACTIONS.includes(action)) return false;
   if (user.role === "admin") return true;
   const explicit = user.permissions?.[resource];
   if (Array.isArray(explicit)) return explicit.includes(action);
   if (explicit && typeof explicit === "object" && typeof explicit[action] === "boolean") return explicit[action];
   const policies = await getPolicies();
   return Boolean(policies[user.role]?.[resource]?.includes(action));
};

const getPermissionForRequest = (req) => {
   const pathname = (req.originalUrl || req.url || "").split("?")[0].toLowerCase();
   const method = req.method.toUpperCase();
   let resource;

   if (/^\/api\/projects(?:\/|$)/.test(pathname)) resource = "projects";
   else if (/^\/api\/activities(?:\/|$)/.test(pathname)) resource = "activities";
   else if (/^\/api\/(?:progress|progress-updates|daily-reports)(?:\/|$)/.test(pathname)) resource = "progress";
   else if (/^\/api\/clients(?:\/|$)/.test(pathname)) resource = "clients";
   else if (/^\/api\/contracts(?:\/|$)/.test(pathname)) resource = "contracts";
   else if (/^\/api\/(?:vendors|rfqs|quotations|purchase-orders|material-requests)(?:\/|$)/.test(pathname)) resource = "procurement";
   else if (/^\/api\/(?:inventory|warehouses|material-issues|grns)(?:\/|$)/.test(pathname)) resource = "inventory";
   else if (/^\/api\/expenses(?:\/|$)/.test(pathname)) resource = "expenses";
   else if (/^\/api\/interim-payments(?:\/|$)/.test(pathname)) resource = "interim_payments";
   else if (/^\/api\/(?:accounts|budgets|profit-loss)(?:\/|$)/.test(pathname)) resource = "accounting";
   else if (/^\/api\/employees(?:\/|$)/.test(pathname)) resource = "employees";
   else if (/^\/api\/attendance(?:\/|$)/.test(pathname)) resource = "attendance";
   else if (/^\/api\/hr\/(?:leaves|manager-leaves|employee\/leaves)(?:\/|$)/.test(pathname)) resource = "leave";
   else if (/^\/api\/hr\/(?:payroll|salary|employee\/payslips)(?:\/|$)/.test(pathname)) resource = "payroll";
   else if (/^\/api\/hr\/(?:employees|departments|designations)(?:\/|$)/.test(pathname)) resource = "employees";
   else if (/^\/api\/reports(?:\/|$)/.test(pathname) || /^\/api\/dashboard(?:\/|$)/.test(pathname)) resource = "reports";
   else if (/^\/api\/documents(?:\/|$)/.test(pathname)) resource = "documents";
   else if (/^\/api\/daily-reports(?:\/|$)/.test(pathname)) resource = "progress";
   if (!resource) return null;

   let action;
   if (/\/hr\/leaves\/[^/]+\/hr-review(?:\/|$)/.test(pathname)) action = "manage";
   else if (/\b(reject|rejection)\b/.test(pathname)) action = "reject";
   else if (/\b(approve|approval|review|select|activate)\b/.test(pathname)) action = "approve";
   else if (/\b(payment|pay)\b/.test(pathname)) action = "payment";
   else if (pathname.includes("/export") || new URLSearchParams((req.originalUrl || "").split("?")[1] || "").has("export")) action = "export";
   else if (method === "GET" || method === "HEAD") action = "view";
   else if (method === "POST") action = "create";
   else if (method === "PUT" || method === "PATCH") action = "edit";
   else if (method === "DELETE") action = "delete";
   if (!action) return null;

   return { resource, action };
};

const enforceRequestPermission = async (req, res, next) => {
   try {
      const required = getPermissionForRequest(req);
      if (!required || await hasPermission(req.user, required.resource, required.action)) return next();
      return res.status(403).json({ success: false, message: `Permission denied: ${required.action} ${required.resource}` });
   } catch (error) {
      return next(error);
   }
};

const authorizePermission = (resource, action) => async (req, res, next) => {
   try {
      if (!await hasPermission(req.user, resource, action)) {
         return res.status(403).json({ success: false, message: `Permission denied: ${action} ${resource}` });
      }
      return next();
   } catch (error) {
      return next(error);
   }
};

module.exports = { authorizePermission, hasPermission, getPolicies, getPermissionForRequest, enforceRequestPermission };
