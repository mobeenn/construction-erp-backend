const ROLES = [
   "admin",
   "project_manager",
   "site_supervisor",
   "hr",
   "accountant",
   "purchase_manager",
   "store_manager",
   "management",
   "employee",
];

const ACTIONS = ["view", "create", "edit", "delete", "approve", "reject", "export", "payment", "manage"];
const RESOURCES = [
   "projects", "activities", "progress", "clients", "contracts", "procurement",
   "inventory", "expenses", "interim_payments", "accounting", "employees",
   "attendance", "leave", "payroll", "reports", "documents",
];

const grants = (...actions) => actions;
const defaults = {
   admin: Object.fromEntries(RESOURCES.map((resource) => [resource, [...ACTIONS]])),
   project_manager: {
      projects: grants("view", "edit"), activities: grants("view", "create", "edit"),
      progress: grants("view", "create", "approve", "reject"), clients: grants("view"),
      contracts: grants("view"), procurement: grants("view", "create", "approve", "reject"),
      inventory: grants("view"), expenses: grants("view"), interim_payments: grants("view", "approve", "reject"),
      employees: grants("view"), attendance: grants("view"), leave: grants("view", "create", "approve", "reject"),
      payroll: grants("view"), reports: grants("view", "export"), documents: grants("view", "create", "edit"),
   },
   site_supervisor: {
      projects: grants("view"), activities: grants("view", "create", "edit"),
      progress: grants("view", "create"), clients: grants("view"), contracts: grants("view"),
      procurement: grants("view", "create"), inventory: grants("view", "create"),
      expenses: grants("view", "create"), interim_payments: grants("view", "create"),
      employees: grants("view"), attendance: grants("view", "create"), leave: grants("view", "create", "approve", "reject"),
      payroll: [], reports: grants("view"), documents: grants("view", "create"),
   },
   hr: {
      projects: grants("view"), activities: grants("view"), progress: grants("view"),
      clients: grants("view"), contracts: grants("view"), procurement: grants("view"),
      inventory: grants("view"), expenses: grants("view"), interim_payments: grants("view"),
      accounting: grants("view"), employees: grants("view", "create", "edit"),
      attendance: grants("view", "create", "edit", "export"),
      leave: grants("view", "create", "approve", "reject", "manage"),
      payroll: grants("view", "create", "edit", "approve", "export", "manage"),
      reports: grants("view", "export"), documents: grants("view", "create", "edit"),
   },
   accountant: {
      projects: grants("view"), activities: grants("view"), progress: grants("view"),
      clients: grants("view"), contracts: grants("view"), procurement: grants("view"),
      inventory: grants("view"), expenses: grants("view", "create", "edit", "export"),
      interim_payments: grants("view", "payment", "manage"), accounting: [...ACTIONS],
      employees: grants("view"), attendance: grants("view"), leave: [],
      payroll: grants("view", "export"), reports: grants("view", "export"), documents: grants("view"),
   },
   purchase_manager: {
      projects: grants("view"), activities: grants("view"), progress: grants("view"),
      clients: grants("view"), contracts: grants("view"), procurement: grants("view", "create", "edit", "approve", "reject", "export", "manage"),
      inventory: grants("view"), expenses: grants("view"), interim_payments: grants("view"),
      accounting: grants("view"), employees: grants("view"), attendance: grants("view"),
      leave: [], payroll: [], reports: grants("view", "export"), documents: grants("view", "create"),
   },
   store_manager: {
      projects: grants("view"), activities: grants("view"), progress: grants("view"),
      clients: grants("view"), contracts: grants("view"), procurement: grants("view"),
      inventory: grants("view", "create", "edit", "delete", "approve", "reject", "manage", "export"),
      expenses: grants("view"), interim_payments: grants("view"), accounting: grants("view"),
      employees: grants("view"), attendance: grants("view"), leave: [], payroll: [],
      reports: grants("view", "export"), documents: grants("view", "create"),
   },
   management: Object.fromEntries(RESOURCES.map((resource) => [resource, grants("view", "export")])),
   employee: {
      projects: grants("view"), activities: grants("view"), progress: grants("view"),
      clients: [], contracts: [], procurement: [], inventory: [], expenses: [], interim_payments: [],
      accounting: [], employees: [], attendance: grants("view"), leave: grants("view", "create"),
      payroll: grants("view"), reports: [], documents: grants("view"),
   },
};

const normalizePolicies = (value) => {
   const normalized = {};
   for (const role of ROLES) {
      normalized[role] = {};
      for (const resource of RESOURCES) {
         const allowed = value?.[role]?.[resource];
         normalized[role][resource] = Array.isArray(allowed)
            ? [...new Set(allowed.filter((action) => ACTIONS.includes(action)))]
            : [...(defaults[role]?.[resource] || [])];
      }
   }
   normalized.admin = Object.fromEntries(RESOURCES.map((resource) => [resource, [...ACTIONS]]));
   return normalized;
};

module.exports = { ROLES, ACTIONS, RESOURCES, DEFAULT_POLICIES: normalizePolicies(defaults), normalizePolicies };
