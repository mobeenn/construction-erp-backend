-- BuildFlow ERP PostgreSQL schema (JSONB document store)
-- One table per former jsonDb collection

CREATE TABLE IF NOT EXISTS "users" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "users_doc_gin" ON "users" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "projects" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "projects_doc_gin" ON "projects" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "employees" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "employees_doc_gin" ON "employees" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "attendance" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "attendance_doc_gin" ON "attendance" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "inventory" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "inventory_doc_gin" ON "inventory" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "inventoryTransactions" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "inventoryTransactions_doc_gin" ON "inventoryTransactions" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "materialRequests" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "materialRequests_doc_gin" ON "materialRequests" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "materialIssues" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "materialIssues_doc_gin" ON "materialIssues" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "vendors" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "vendors_doc_gin" ON "vendors" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "purchaseOrders" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "purchaseOrders_doc_gin" ON "purchaseOrders" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "grns" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "grns_doc_gin" ON "grns" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "expenses" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "expenses_doc_gin" ON "expenses" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "clients" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "clients_doc_gin" ON "clients" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "contracts" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "contracts_doc_gin" ON "contracts" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "activities" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "activities_doc_gin" ON "activities" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "progressReports" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "progressReports_doc_gin" ON "progressReports" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "interimPayments" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "interimPayments_doc_gin" ON "interimPayments" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "documents" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "documents_doc_gin" ON "documents" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "progressUpdates" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "progressUpdates_doc_gin" ON "progressUpdates" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "budgets" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "budgets_doc_gin" ON "budgets" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "rfqs" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "rfqs_doc_gin" ON "rfqs" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "vendorQuotations" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "vendorQuotations_doc_gin" ON "vendorQuotations" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "warehouses" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "warehouses_doc_gin" ON "warehouses" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "stockTransfers" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "stockTransfers_doc_gin" ON "stockTransfers" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "stockAdjustments" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "stockAdjustments_doc_gin" ON "stockAdjustments" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "materialReturns" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "materialReturns_doc_gin" ON "materialReturns" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "dailyReports" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "dailyReports_doc_gin" ON "dailyReports" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "departments" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "departments_doc_gin" ON "departments" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "designations" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "designations_doc_gin" ON "designations" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "leaveRequests" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "leaveRequests_doc_gin" ON "leaveRequests" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "salaryStructures" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "salaryStructures_doc_gin" ON "salaryStructures" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "payrollPeriods" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "payrollPeriods_doc_gin" ON "payrollPeriods" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "payrollEntries" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "payrollEntries_doc_gin" ON "payrollEntries" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "permissionPolicies" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "permissionPolicies_doc_gin" ON "permissionPolicies" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "accountCategories" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "accountCategories_doc_gin" ON "accountCategories" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "accounts" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "accounts_doc_gin" ON "accounts" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "journalEntries" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "journalEntries_doc_gin" ON "journalEntries" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "journalEntryLines" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "journalEntryLines_doc_gin" ON "journalEntryLines" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "customerPayments" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "customerPayments_doc_gin" ON "customerPayments" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "vendorPayments" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "vendorPayments_doc_gin" ON "vendorPayments" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "cashAccounts" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "cashAccounts_doc_gin" ON "cashAccounts" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "bankAccounts" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "bankAccounts_doc_gin" ON "bankAccounts" USING GIN (doc);

CREATE TABLE IF NOT EXISTS "notifications" (
  id TEXT PRIMARY KEY,
  doc JSONB NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "notifications_doc_gin" ON "notifications" USING GIN (doc);
