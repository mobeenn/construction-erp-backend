const {
   createAccountCategory,
   getAllAccountCategories,
   updateAccountCategory,
   deleteAccountCategory,
   createAccount,
   getAllAccounts,
   updateAccount,
   deleteAccount,
   createJournalEntry,
   getAllJournalEntries,
   getJournalEntryById,
   updateJournalEntry,
   deleteJournalEntry,
   createCustomerPayment,
   getAllCustomerPayments,
   updateCustomerPayment,
   deleteCustomerPayment,
   createVendorPayment,
   getAllVendorPayments,
   updateVendorPayment,
   deleteVendorPayment,
   createCashAccount,
   getAllCashAccounts,
   updateCashAccount,
   deleteCashAccount,
   createBankAccount,
   getAllBankAccounts,
   updateBankAccount,
   deleteBankAccount,
   getGeneralLedger,
   getTrialBalance,
   getProfitLoss,
   getBalanceSheet,
   getAccountsReceivable,
   getAccountsPayable,
   getProjectExpenseAllocation,
   getProjectRevenueAllocation,
} = require("../../services/account.service");

const {
   accountCategorySchema,
   accountSchema,
   journalEntrySchema,
   customerPaymentSchema,
   vendorPaymentSchema,
   cashAccountSchema,
   bankAccountSchema,
} = require("../../validators/account.validation");

// ============ ACCOUNT CATEGORIES ============

exports.createCategory = async (req, res) => {
   try {
      const data = accountCategorySchema.parse(req.body);
      const category = await createAccountCategory(data);
      res.status(201).json({ success: true, data: category });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getCategories = async (req, res) => {
   try {
      const categories = await getAllAccountCategories();
      res.status(200).json({ success: true, data: categories });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateCategory = async (req, res) => {
   try {
      const category = await updateAccountCategory(req.params.id, req.body);
      res.status(200).json({ success: true, data: category });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.deleteCategory = async (req, res) => {
   try {
      await deleteAccountCategory(req.params.id);
      res.status(200).json({ success: true, message: "Category deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ ACCOUNTS ============

exports.createAccount = async (req, res) => {
   try {
      const data = accountSchema.parse(req.body);
      const account = await createAccount(data);
      res.status(201).json({ success: true, data: account });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAccounts = async (req, res) => {
   try {
      const accounts = await getAllAccounts(req.query);
      res.status(200).json({ success: true, data: accounts });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateAccount = async (req, res) => {
   try {
      const account = await updateAccount(req.params.id, req.body);
      res.status(200).json({ success: true, data: account });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.deleteAccount = async (req, res) => {
   try {
      await deleteAccount(req.params.id);
      res.status(200).json({ success: true, message: "Account deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ JOURNAL ENTRIES ============

exports.createJournalEntry = async (req, res) => {
   try {
      const data = journalEntrySchema.parse(req.body);
      const entry = await createJournalEntry(data, req.user._id);
      res.status(201).json({ success: true, data: entry });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getJournalEntries = async (req, res) => {
   try {
      const entries = await getAllJournalEntries(req.query);
      res.status(200).json({ success: true, data: entries });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getJournalEntry = async (req, res) => {
   try {
      const entry = await getJournalEntryById(req.params.id);
      if (!entry) {
         return res
            .status(404)
            .json({ success: false, message: "Journal entry not found" });
      }
      res.status(200).json({ success: true, data: entry });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateJournalEntry = async (req, res) => {
   try {
      const data = journalEntrySchema.partial().parse(req.body);
      const entry = await updateJournalEntry(req.params.id, data);
      res.status(200).json({ success: true, data: entry });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.deleteJournalEntry = async (req, res) => {
   try {
      await deleteJournalEntry(req.params.id);
      res.status(200).json({ success: true, message: "Journal entry deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ CUSTOMER PAYMENTS ============

exports.createCustomerPayment = async (req, res) => {
   try {
      const data = customerPaymentSchema.parse(req.body);
      const payment = await createCustomerPayment(data, req.user._id);
      res.status(201).json({ success: true, data: payment });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getCustomerPayments = async (req, res) => {
   try {
      const payments = await getAllCustomerPayments(req.query);
      res.status(200).json({ success: true, data: payments });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateCustomerPayment = async (req, res) => {
   try {
      const payment = await updateCustomerPayment(req.params.id, req.body);
      res.status(200).json({ success: true, data: payment });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.deleteCustomerPayment = async (req, res) => {
   try {
      await deleteCustomerPayment(req.params.id);
      res.status(200).json({ success: true, message: "Payment deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ VENDOR PAYMENTS ============

exports.createVendorPayment = async (req, res) => {
   try {
      const data = vendorPaymentSchema.parse(req.body);
      const payment = await createVendorPayment(data, req.user._id);
      res.status(201).json({ success: true, data: payment });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getVendorPayments = async (req, res) => {
   try {
      const payments = await getAllVendorPayments(req.query);
      res.status(200).json({ success: true, data: payments });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateVendorPayment = async (req, res) => {
   try {
      const payment = await updateVendorPayment(req.params.id, req.body);
      res.status(200).json({ success: true, data: payment });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.deleteVendorPayment = async (req, res) => {
   try {
      await deleteVendorPayment(req.params.id);
      res.status(200).json({ success: true, message: "Payment deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ CASH ACCOUNTS ============

exports.createCashAccount = async (req, res) => {
   try {
      const data = cashAccountSchema.parse(req.body);
      const account = await createCashAccount(data, req.user._id);
      res.status(201).json({ success: true, data: account });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getCashAccounts = async (req, res) => {
   try {
      const accounts = await getAllCashAccounts();
      res.status(200).json({ success: true, data: accounts });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateCashAccount = async (req, res) => {
   try {
      const account = await updateCashAccount(req.params.id, req.body);
      res.status(200).json({ success: true, data: account });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.deleteCashAccount = async (req, res) => {
   try {
      await deleteCashAccount(req.params.id);
      res.status(200).json({ success: true, message: "Cash account deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ BANK ACCOUNTS ============

exports.createBankAccount = async (req, res) => {
   try {
      const data = bankAccountSchema.parse(req.body);
      const account = await createBankAccount(data, req.user._id);
      res.status(201).json({ success: true, data: account });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getBankAccounts = async (req, res) => {
   try {
      const accounts = await getAllBankAccounts();
      res.status(200).json({ success: true, data: accounts });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateBankAccount = async (req, res) => {
   try {
      const account = await updateBankAccount(req.params.id, req.body);
      res.status(200).json({ success: true, data: account });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.deleteBankAccount = async (req, res) => {
   try {
      await deleteBankAccount(req.params.id);
      res.status(200).json({ success: true, message: "Bank account deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ FINANCIAL REPORTS ============

exports.getGeneralLedger = async (req, res) => {
   try {
      const ledger = await getGeneralLedger(req.query);
      res.status(200).json({ success: true, data: ledger });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getTrialBalance = async (req, res) => {
   try {
      const trialBalance = await getTrialBalance();
      res.status(200).json({ success: true, data: trialBalance });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getProfitLossReport = async (req, res) => {
   try {
      const profitLoss = await getProfitLoss();
      res.status(200).json({ success: true, data: profitLoss });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getBalanceSheetReport = async (req, res) => {
   try {
      const balanceSheet = await getBalanceSheet();
      res.status(200).json({ success: true, data: balanceSheet });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ AR / AP ============

exports.getAccountsReceivable = async (req, res) => {
   try {
      const ar = await getAccountsReceivable();
      res.status(200).json({ success: true, data: ar });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getAccountsPayable = async (req, res) => {
   try {
      const ap = await getAccountsPayable();
      res.status(200).json({ success: true, data: ap });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

// ============ PROJECT ALLOCATIONS ============

exports.getProjectExpenseAllocation = async (req, res) => {
   try {
      const allocation = await getProjectExpenseAllocation(req.params.projectId);
      res.status(200).json({ success: true, data: allocation });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getProjectRevenueAllocation = async (req, res) => {
   try {
      const allocation = await getProjectRevenueAllocation(req.params.projectId);
      res.status(200).json({ success: true, data: allocation });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
