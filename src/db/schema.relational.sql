-- BuildFlow ERP — fully relational schema (snake_case)
-- Generated from src/db/schema.map.js
-- Do not edit by hand; regenerate with: node scripts/generate-relational-schema.js


CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  password TEXT,
  role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  client_code TEXT,
  name TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_no TEXT,
  tax_information TEXT,
  payment_terms TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  vendor_code TEXT,
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  project_code TEXT,
  name TEXT,
  location TEXT,
  description TEXT,
  budget NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  status TEXT,
  progress NUMERIC,
  contract_value NUMERIC,
  received_amount NUMERIC,
  priority TEXT,
  supervisor_id TEXT,
  client_id TEXT,
  contract_id TEXT,
  project_manager_id TEXT,
  site_supervisor_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS project_engineers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_project_engineers_project_id ON project_engineers (project_id);

CREATE TABLE IF NOT EXISTS project_employees (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  employee_id TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_project_employees_project_id ON project_employees (project_id);

CREATE TABLE IF NOT EXISTS project_contractors (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  vendor_id TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_project_contractors_project_id ON project_contractors (project_id);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  contract_no TEXT,
  type TEXT,
  title TEXT,
  value NUMERIC,
  retention_percent NUMERIC,
  advance_percentage NUMERIC,
  payment_terms TEXT,
  tax NUMERIC,
  approved_variations NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT,
  terms TEXT,
  notes TEXT,
  client_id TEXT,
  project_id TEXT,
  vendor_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contract_documents (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  name TEXT,
  url TEXT,
  file_type TEXT,
  size NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_contract_documents_contract_id ON contract_documents (contract_id);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_code TEXT,
  name TEXT,
  cnic TEXT,
  phone TEXT,
  email TEXT,
  designation TEXT,
  salary NUMERIC,
  assigned_site TEXT,
  employee_type TEXT,
  status TEXT,
  joining_date TIMESTAMPTZ,
  bank_name TEXT,
  bank_account TEXT,
  emergency_contact TEXT,
  leave_balance NUMERIC,
  assigned_project_id TEXT,
  department_id TEXT,
  designation_id TEXT,
  user_account_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS employee_project_assignments (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  project_id TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_employee_project_assignments_employee_id ON employee_project_assignments (employee_id);

CREATE TABLE IF NOT EXISTS employee_performance_notes (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  note TEXT,
  note_date TIMESTAMPTZ,
  created_by TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_employee_performance_notes_employee_id ON employee_performance_notes (employee_id);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  description TEXT,
  status TEXT,
  head_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS designations (
  id TEXT PRIMARY KEY,
  title TEXT,
  code TEXT,
  level TEXT,
  description TEXT,
  status TEXT,
  department_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ,
  status TEXT,
  overtime_hours NUMERIC,
  employee_id TEXT,
  marked_by TEXT,
  project_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  name TEXT,
  title TEXT,
  activity_code TEXT,
  wbs_code TEXT,
  category TEXT,
  phase TEXT,
  planned_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  planned_quantity NUMERIC,
  completed_quantity NUMERIC,
  unit TEXT,
  planned_percentage NUMERIC,
  actual_percentage NUMERIC,
  progress NUMERIC,
  status TEXT,
  weight NUMERIC,
  project_id TEXT,
  assigned_to TEXT,
  responsible_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS progress_updates (
  id TEXT PRIMARY KEY,
  previous_progress NUMERIC,
  new_progress NUMERIC,
  quantity_completed NUMERIC,
  remarks TEXT,
  status TEXT,
  update_date TIMESTAMPTZ,
  project_id TEXT,
  activity_id TEXT,
  updated_by TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS progress_reports (
  id TEXT PRIMARY KEY,
  title TEXT,
  progress NUMERIC,
  remarks TEXT,
  report_date TIMESTAMPTZ,
  project_id TEXT,
  reported_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  budget_code TEXT,
  version NUMERIC,
  status TEXT,
  total_budget NUMERIC,
  approved_date TIMESTAMPTZ,
  project_id TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  category TEXT,
  description TEXT,
  quantity NUMERIC,
  unit TEXT,
  rate NUMERIC,
  amount NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_budget_lines_budget_id ON budget_lines (budget_id);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  location TEXT,
  status TEXT,
  project_id TEXT,
  manager_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  material_name TEXT,
  category TEXT,
  unit TEXT,
  unit_price NUMERIC,
  current_stock NUMERIC,
  minimum_stock NUMERIC,
  reorder_level NUMERIC,
  opening_quantity NUMERIC,
  received_quantity NUMERIC,
  issued_quantity NUMERIC,
  transferred_quantity NUMERIC,
  project_id TEXT,
  warehouse_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  type TEXT,
  quantity NUMERIC,
  remarks TEXT,
  balance_after NUMERIC,
  inventory_id TEXT,
  project_id TEXT,
  warehouse_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS material_requests (
  id TEXT PRIMARY KEY,
  request_no TEXT,
  status TEXT,
  remarks TEXT,
  material_name TEXT,
  quantity NUMERIC,
  unit TEXT,
  project_id TEXT,
  requested_by TEXT,
  approved_by TEXT,
  issued_by TEXT,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS material_request_items (
  id TEXT PRIMARY KEY,
  material_request_id TEXT NOT NULL,
  inventory_id TEXT,
  material_name TEXT,
  quantity NUMERIC,
  unit TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_material_request_items_material_request_id ON material_request_items (material_request_id);

CREATE TABLE IF NOT EXISTS material_issues (
  id TEXT PRIMARY KEY,
  issue_no TEXT,
  remarks TEXT,
  issue_type TEXT,
  department TEXT,
  material_name TEXT,
  quantity NUMERIC,
  unit TEXT,
  request_id TEXT,
  project_id TEXT,
  issued_by TEXT,
  employee_id TEXT,
  activity_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS material_issue_items (
  id TEXT PRIMARY KEY,
  material_issue_id TEXT NOT NULL,
  inventory_id TEXT,
  material_name TEXT,
  quantity NUMERIC,
  unit TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_material_issue_items_material_issue_id ON material_issue_items (material_issue_id);

CREATE TABLE IF NOT EXISTS material_returns (
  id TEXT PRIMARY KEY,
  return_no TEXT,
  quantity NUMERIC,
  reason TEXT,
  inventory_id TEXT,
  project_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id TEXT PRIMARY KEY,
  transfer_no TEXT,
  quantity NUMERIC,
  status TEXT,
  from_warehouse_id TEXT,
  to_warehouse_id TEXT,
  inventory_id TEXT,
  project_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id TEXT PRIMARY KEY,
  adjustment_no TEXT,
  quantity NUMERIC,
  type TEXT,
  reason TEXT,
  status TEXT,
  inventory_id TEXT,
  project_id TEXT,
  created_by TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rfqs (
  id TEXT PRIMARY KEY,
  rfq_no TEXT,
  status TEXT,
  project_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rfq_items (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  material_name TEXT,
  quantity NUMERIC,
  unit TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items (rfq_id);

CREATE TABLE IF NOT EXISTS vendor_quotations (
  id TEXT PRIMARY KEY,
  quotation_no TEXT,
  status TEXT,
  grand_total NUMERIC,
  vendor_id TEXT,
  rfq_id TEXT,
  project_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS vendor_quotation_items (
  id TEXT PRIMARY KEY,
  vendor_quotation_id TEXT NOT NULL,
  material_name TEXT,
  quantity NUMERIC,
  unit_price NUMERIC,
  total NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_vendor_quotation_items_vendor_quotation_id ON vendor_quotation_items (vendor_quotation_id);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT,
  grand_total NUMERIC,
  status TEXT,
  site TEXT,
  budget_category TEXT,
  delivery_location TEXT,
  expected_delivery TIMESTAMPTZ,
  payment_terms TEXT,
  vendor_id TEXT,
  project_id TEXT,
  created_by TEXT,
  requested_by TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id TEXT PRIMARY KEY,
  purchase_order_id TEXT NOT NULL,
  material_name TEXT,
  quantity NUMERIC,
  unit_price NUMERIC,
  total NUMERIC,
  received_qty NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items (purchase_order_id);

CREATE TABLE IF NOT EXISTS grns (
  id TEXT PRIMARY KEY,
  grn_no TEXT,
  remarks TEXT,
  purchase_order_id TEXT,
  vendor_id TEXT,
  project_id TEXT,
  received_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS grn_items (
  id TEXT PRIMARY KEY,
  grn_id TEXT NOT NULL,
  material_name TEXT,
  quantity NUMERIC,
  ordered_qty NUMERIC,
  received_qty NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_grn_items_grn_id ON grn_items (grn_id);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_no TEXT,
  category TEXT,
  amount NUMERIC,
  description TEXT,
  payment_method TEXT,
  expense_date TIMESTAMPTZ,
  project_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS interim_payments (
  id TEXT PRIMARY KEY,
  payment_no TEXT,
  period_from TIMESTAMPTZ,
  period_to TIMESTAMPTZ,
  current_gross_amount NUMERIC,
  gross_amount NUMERIC,
  work_completed_amount NUMERIC,
  previous_certified_amount NUMERIC,
  advance_recovery NUMERIC,
  retention NUMERIC,
  tax NUMERIC,
  other_deductions NUMERIC,
  net_amount NUMERIC,
  approved_amount NUMERIC,
  paid_amount NUMERIC,
  outstanding_amount NUMERIC,
  status TEXT,
  description TEXT,
  submission_date TIMESTAMPTZ,
  approval_date TIMESTAMPTZ,
  payment_date TIMESTAMPTZ,
  project_id TEXT,
  contract_id TEXT,
  client_id TEXT,
  submitted_by TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS interim_payment_receipts (
  id TEXT PRIMARY KEY,
  interim_payment_id TEXT NOT NULL,
  amount NUMERIC,
  paid_at TIMESTAMPTZ,
  paid_by TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_interim_payment_receipts_interim_payment_id ON interim_payment_receipts (interim_payment_id);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  entity_type TEXT,
  entity_id TEXT,
  file_type TEXT,
  size NUMERIC,
  url TEXT,
  description TEXT,
  is_active BOOLEAN,
  project_id TEXT,
  contract_id TEXT,
  client_id TEXT,
  purchase_order_id TEXT,
  grn_id TEXT,
  vendor_id TEXT,
  interim_payment_id TEXT,
  expense_id TEXT,
  employee_id TEXT,
  daily_report_id TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY,
  site TEXT,
  report_date TIMESTAMPTZ,
  weather TEXT,
  work_performed TEXT,
  safety_incidents TEXT,
  issues TEXT,
  delays TEXT,
  instructions TEXT,
  remarks TEXT,
  status TEXT,
  project_id TEXT,
  site_supervisor_id TEXT,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS daily_report_manpower (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  trade TEXT,
  count NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_daily_report_manpower_daily_report_id ON daily_report_manpower (daily_report_id);

CREATE TABLE IF NOT EXISTS daily_report_equipment (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  name TEXT,
  quantity NUMERIC,
  hours NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_daily_report_equipment_daily_report_id ON daily_report_equipment (daily_report_id);

CREATE TABLE IF NOT EXISTS daily_report_activities (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  activity_id TEXT,
  progress NUMERIC,
  quantity_completed NUMERIC,
  status TEXT,
  remarks TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_daily_report_activities_daily_report_id ON daily_report_activities (daily_report_id);

CREATE TABLE IF NOT EXISTS daily_report_material_consumed (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  inventory_id TEXT,
  quantity NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_daily_report_material_consumed_daily_report_id ON daily_report_material_consumed (daily_report_id);

CREATE TABLE IF NOT EXISTS daily_report_material_received (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  inventory_id TEXT,
  quantity NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_daily_report_material_received_daily_report_id ON daily_report_material_received (daily_report_id);

CREATE TABLE IF NOT EXISTS daily_report_attachments (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  url TEXT,
  name TEXT,
  file_type TEXT,
  size NUMERIC,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_daily_report_attachments_daily_report_id ON daily_report_attachments (daily_report_id);

CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY,
  type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  days NUMERIC,
  reason TEXT,
  status TEXT,
  manager_reviewed_at TIMESTAMPTZ,
  hr_reviewed_at TIMESTAMPTZ,
  manager_review_note TEXT,
  hr_review_note TEXT,
  employee_id TEXT,
  project_id TEXT,
  manager_reviewed_by TEXT,
  hr_reviewed_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS salary_structures (
  id TEXT PRIMARY KEY,
  basic_salary NUMERIC,
  overtime_rate NUMERIC,
  currency TEXT,
  pay_frequency TEXT,
  effective_from TIMESTAMPTZ,
  status TEXT,
  employee_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS salary_allowances (
  id TEXT PRIMARY KEY,
  salary_structure_id TEXT NOT NULL,
  name TEXT,
  amount NUMERIC,
  type TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_salary_allowances_salary_structure_id ON salary_allowances (salary_structure_id);

CREATE TABLE IF NOT EXISTS salary_deductions (
  id TEXT PRIMARY KEY,
  salary_structure_id TEXT NOT NULL,
  name TEXT,
  amount NUMERIC,
  type TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_salary_deductions_salary_structure_id ON salary_deductions (salary_structure_id);

CREATE TABLE IF NOT EXISTS payroll_periods (
  id TEXT PRIMARY KEY,
  name TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  pay_date TIMESTAMPTZ,
  status TEXT,
  locked BOOLEAN,
  employee_count NUMERIC,
  totals_basic_salary NUMERIC,
  totals_allowances NUMERIC,
  totals_overtime NUMERIC,
  totals_deductions NUMERIC,
  totals_net_salary NUMERIC,
  created_by TEXT,
  approved_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payroll_entries (
  id TEXT PRIMARY KEY,
  basic_salary NUMERIC,
  allowances_total NUMERIC,
  deductions_total NUMERIC,
  overtime_hours NUMERIC,
  overtime_rate NUMERIC,
  overtime_pay NUMERIC,
  net_salary NUMERIC,
  currency TEXT,
  status TEXT,
  attendance_days NUMERIC,
  period_id TEXT,
  employee_id TEXT,
  salary_structure_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payroll_entry_allowances (
  id TEXT PRIMARY KEY,
  payroll_entry_id TEXT NOT NULL,
  name TEXT,
  amount NUMERIC,
  type TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_payroll_entry_allowances_payroll_entry_id ON payroll_entry_allowances (payroll_entry_id);

CREATE TABLE IF NOT EXISTS payroll_entry_deductions (
  id TEXT PRIMARY KEY,
  payroll_entry_id TEXT NOT NULL,
  name TEXT,
  amount NUMERIC,
  type TEXT,
  sort_order INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_payroll_entry_deductions_payroll_entry_id ON payroll_entry_deductions (payroll_entry_id);

CREATE TABLE IF NOT EXISTS permission_policies (
  id TEXT PRIMARY KEY,
  key TEXT,
  policies JSONB,
  updated_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS account_categories (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  type TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  type TEXT,
  opening_balance NUMERIC,
  current_balance NUMERIC,
  description TEXT,
  is_active BOOLEAN,
  category_id TEXT,
  project_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ,
  reference TEXT,
  description TEXT,
  total_debit NUMERIC,
  total_credit NUMERIC,
  status TEXT,
  project_id TEXT,
  contract_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id TEXT PRIMARY KEY,
  debit NUMERIC,
  credit NUMERIC,
  description TEXT,
  journal_entry_id TEXT,
  account_id TEXT,
  project_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS customer_payments (
  id TEXT PRIMARY KEY,
  receipt_no TEXT,
  date TIMESTAMPTZ,
  reference TEXT,
  amount NUMERIC,
  payment_method TEXT,
  status TEXT,
  description TEXT,
  client_id TEXT,
  project_id TEXT,
  contract_id TEXT,
  interim_payment_id TEXT,
  account_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS vendor_payments (
  id TEXT PRIMARY KEY,
  payment_no TEXT,
  date TIMESTAMPTZ,
  reference TEXT,
  amount NUMERIC,
  payment_method TEXT,
  status TEXT,
  description TEXT,
  vendor_id TEXT,
  project_id TEXT,
  purchase_order_id TEXT,
  account_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cash_accounts (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  balance NUMERIC,
  opening_balance NUMERIC,
  description TEXT,
  is_active BOOLEAN,
  project_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  bank_name TEXT,
  account_number TEXT,
  branch TEXT,
  balance NUMERIC,
  opening_balance NUMERIC,
  description TEXT,
  is_active BOOLEAN,
  project_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN,
  user_id TEXT,
  project_id TEXT,
  inventory_id TEXT,
  material_request_id TEXT,
  purchase_order_id TEXT,
  grn_id TEXT,
  interim_payment_id TEXT,
  expense_id TEXT,
  leave_request_id TEXT,
  payroll_period_id TEXT,
  daily_report_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
