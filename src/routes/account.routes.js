const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   createCategory,
   getCategories,
   updateCategory,
   deleteCategory,
   createAccount,
   getAccounts,
   updateAccount,
   deleteAccount,
   createJournalEntry,
   getJournalEntries,
   getJournalEntry,
   updateJournalEntry,
   deleteJournalEntry,
   createCustomerPayment,
   getCustomerPayments,
   updateCustomerPayment,
   deleteCustomerPayment,
   createVendorPayment,
   getVendorPayments,
   updateVendorPayment,
   deleteVendorPayment,
   createCashAccount,
   getCashAccounts,
   updateCashAccount,
   deleteCashAccount,
   createBankAccount,
   getBankAccounts,
   updateBankAccount,
   deleteBankAccount,
   getGeneralLedger,
   getTrialBalance,
   getProfitLossReport,
   getBalanceSheetReport,
   getAccountsReceivable,
   getAccountsPayable,
   getProjectExpenseAllocation,
   getProjectRevenueAllocation,
} = require("../controllers/accounting/account.controller");

// Account Categories
router.post("/categories", protect, authorize("admin", "accountant"), createCategory);
router.get("/categories", protect, getCategories);
router.put("/categories/:id", protect, authorize("admin", "accountant"), updateCategory);
router.delete("/categories/:id", protect, authorize("admin", "accountant"), deleteCategory);

// Accounts
router.post("/", protect, authorize("admin", "accountant"), createAccount);
router.get("/", protect, getAccounts);
router.put("/:id", protect, authorize("admin", "accountant"), updateAccount);
router.delete("/:id", protect, authorize("admin", "accountant"), deleteAccount);

// Journal Entries
router.post("/journal-entries", protect, authorize("admin", "accountant"), createJournalEntry);
router.get("/journal-entries", protect, getJournalEntries);
router.get("/journal-entries/:id", protect, getJournalEntry);
router.put("/journal-entries/:id", protect, authorize("admin", "accountant"), updateJournalEntry);
router.delete("/journal-entries/:id", protect, authorize("admin", "accountant"), deleteJournalEntry);

// Customer Payments
router.post("/customer-payments", protect, authorize("admin", "accountant"), createCustomerPayment);
router.get("/customer-payments", protect, getCustomerPayments);
router.put("/customer-payments/:id", protect, authorize("admin", "accountant"), updateCustomerPayment);
router.delete("/customer-payments/:id", protect, authorize("admin", "accountant"), deleteCustomerPayment);

// Vendor Payments
router.post("/vendor-payments", protect, authorize("admin", "accountant"), createVendorPayment);
router.get("/vendor-payments", protect, getVendorPayments);
router.put("/vendor-payments/:id", protect, authorize("admin", "accountant"), updateVendorPayment);
router.delete("/vendor-payments/:id", protect, authorize("admin", "accountant"), deleteVendorPayment);

// Cash Accounts
router.post("/cash-accounts", protect, authorize("admin", "accountant"), createCashAccount);
router.get("/cash-accounts", protect, getCashAccounts);
router.put("/cash-accounts/:id", protect, authorize("admin", "accountant"), updateCashAccount);
router.delete("/cash-accounts/:id", protect, authorize("admin", "accountant"), deleteCashAccount);

// Bank Accounts
router.post("/bank-accounts", protect, authorize("admin", "accountant"), createBankAccount);
router.get("/bank-accounts", protect, getBankAccounts);
router.put("/bank-accounts/:id", protect, authorize("admin", "accountant"), updateBankAccount);
router.delete("/bank-accounts/:id", protect, authorize("admin", "accountant"), deleteBankAccount);

// Financial Reports
router.get("/general-ledger", protect, getGeneralLedger);
router.get("/trial-balance", protect, getTrialBalance);
router.get("/profit-loss", protect, getProfitLossReport);
router.get("/balance-sheet", protect, getBalanceSheetReport);

// AR / AP
router.get("/accounts-receivable", protect, getAccountsReceivable);
router.get("/accounts-payable", protect, getAccountsPayable);

// Project Allocations
router.get("/project-expense-allocation/:projectId", protect, getProjectExpenseAllocation);
router.get("/project-revenue-allocation/:projectId", protect, getProjectRevenueAllocation);

module.exports = router;
