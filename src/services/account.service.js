const AccountCategory = require("../models/AccountCategory");
const Account = require("../models/Account");
const JournalEntry = require("../models/JournalEntry");
const JournalEntryLine = require("../models/JournalEntryLine");
const CustomerPayment = require("../models/CustomerPayment");
const VendorPayment = require("../models/VendorPayment");
const CashAccount = require("../models/CashAccount");
const BankAccount = require("../models/BankAccount");

// ============ ACCOUNT CATEGORIES ============

exports.createAccountCategory = async (data) => {
   return await AccountCategory.create(data);
};

exports.getAllAccountCategories = async () => {
   return await AccountCategory.find().sort({ code: 1 });
};

exports.updateAccountCategory = async (id, data) => {
   return await AccountCategory.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteAccountCategory = async (id) => {
   return await AccountCategory.findByIdAndDelete(id);
};

// ============ ACCOUNTS ============

exports.createAccount = async (data) => {
   return await Account.create(data);
};

exports.getAllAccounts = async (filters = {}) => {
   const query = {};
   if (filters.category) query.category = filters.category;
   if (filters.type) query.type = filters.type;
   if (filters.project) query.project = filters.project;
   if (filters.isActive !== undefined) query.isActive = filters.isActive;

   return await Account.find(query)
      .populate("category", "name code type")
      .populate("project", "name")
      .sort({ code: 1 });
};

exports.updateAccount = async (id, data) => {
   return await Account.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteAccount = async (id) => {
   return await Account.findByIdAndDelete(id);
};

// ============ JOURNAL ENTRIES ============

exports.createJournalEntry = async (data, userId) => {
   const { lines, ...entryData } = data;

   // Validate balanced entry
   const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
   const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

   if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(
         `Journal entry is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
      );
   }

   // Create journal entry
   const entry = await JournalEntry.create({
      ...entryData,
      totalDebit,
      totalCredit,
      createdBy: userId,
   });

   // Create lines
   for (const line of lines) {
      await JournalEntryLine.create({
         ...line,
         journalEntry: entry._id,
      });
   }

   // Update account balances
   for (const line of lines) {
      const account = await Account.findById(line.account);
      if (account) {
         const netChange = (line.debit || 0) - (line.credit || 0);
         await Account.findByIdAndUpdate(line.account, {
            currentBalance: (account.currentBalance || 0) + netChange,
         });
      }
   }

   return entry;
};

exports.getAllJournalEntries = async (filters = {}) => {
   const query = {};
   if (filters.project) query.project = filters.project;
   if (filters.status) query.status = filters.status;
   if (filters.startDate && filters.endDate) {
      query.date = { $gte: filters.startDate, $lte: filters.endDate };
   }

   const entries = await JournalEntry.find(query)
      .populate("project", "name")
      .populate("createdBy", "name")
      .populate("contract", "contractNo")
      .sort({ date: -1, createdAt: -1 });

   // Attach lines to each entry
   for (const entry of entries) {
      const lines = await JournalEntryLine.find({ journalEntry: entry._id })
         .populate("account", "name code")
         .populate("project", "name");
      entry.lines = lines;
   }

   return entries;
};

exports.getJournalEntryById = async (id) => {
   const entry = await JournalEntry.findById(id)
      .populate("project", "name")
      .populate("createdBy", "name")
      .populate("contract", "contractNo");

   if (!entry) return null;

   const lines = await JournalEntryLine.find({ journalEntry: id })
      .populate("account", "name code")
      .populate("project", "name");

   entry.lines = lines;
   return entry;
};

exports.updateJournalEntry = async (id, data) => {
   const { lines, ...entryData } = data;

   // If lines provided, validate balance
   if (lines) {
      const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
      const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.001) {
         throw new Error("Journal entry is not balanced");
      }

      entryData.totalDebit = totalDebit;
      entryData.totalCredit = totalCredit;
   }

   const entry = await JournalEntry.findByIdAndUpdate(id, entryData, {
      new: true,
   });

   // Update lines if provided
   if (lines) {
      // Delete old lines
      const oldLines = await JournalEntryLine.find({ journalEntry: id });
      for (const oldLine of oldLines) {
         await JournalEntryLine.findByIdAndDelete(oldLine._id);
      }

      // Create new lines
      for (const line of lines) {
         await JournalEntryLine.create({
            ...line,
            journalEntry: id,
         });
      }
   }

   return entry;
};

exports.deleteJournalEntry = async (id) => {
   // Delete lines first
   await JournalEntryLine.find({ journalEntry: id }).then((lines) => {
      lines.forEach(async (line) => {
         await JournalEntryLine.findByIdAndDelete(line._id);
      });
   });

   return await JournalEntry.findByIdAndDelete(id);
};

// ============ CUSTOMER PAYMENTS ============

exports.createCustomerPayment = async (data, userId) => {
   const payment = await CustomerPayment.create({
      ...data,
      createdBy: userId,
   });

   // Create journal entry for the payment
   const cashBankAccount = await Account.findOne({
      name: { $regex: data.paymentMethod === "cash" ? "cash" : "bank", $options: "i" },
   });

   if (cashBankAccount) {
      await JournalEntry.create({
         date: data.date,
         reference: `CP-${data.reference}`,
         description: `Customer payment from ${data.client}`,
         totalDebit: data.amount,
         totalCredit: data.amount,
         project: data.project,
         contract: data.contract,
         createdBy: userId,
         lines: [
            {
               account: cashBankAccount._id,
               debit: data.amount,
               credit: 0,
               description: "Payment received",
            },
            {
               account: data.account,
               debit: 0,
               credit: data.amount,
               description: "Revenue recognized",
            },
         ],
      });
   }

   return payment;
};

exports.getAllCustomerPayments = async (filters = {}) => {
   const query = {};
   if (filters.client) query.client = filters.client;
   if (filters.project) query.project = filters.project;
   if (filters.status) query.status = filters.status;

   return await CustomerPayment.find(query)
      .populate("client", "name clientCode")
      .populate("project", "name")
      .populate("contract", "contractNo")
      .populate("account", "name code")
      .populate("createdBy", "name")
      .sort({ date: -1 });
};

exports.updateCustomerPayment = async (id, data) => {
   return await CustomerPayment.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCustomerPayment = async (id) => {
   return await CustomerPayment.findByIdAndDelete(id);
};

// ============ VENDOR PAYMENTS ============

exports.createVendorPayment = async (data, userId) => {
   const payment = await VendorPayment.create({
      ...data,
      createdBy: userId,
   });

   // Create journal entry
   const cashBankAccount = await Account.findOne({
      name: { $regex: data.paymentMethod === "cash" ? "cash" : "bank", $options: "i" },
   });

   if (cashBankAccount) {
      await JournalEntry.create({
         date: data.date,
         reference: `VP-${data.reference}`,
         description: `Vendor payment to ${data.vendor}`,
         totalDebit: data.amount,
         totalCredit: data.amount,
         project: data.project,
         createdBy: userId,
         lines: [
            {
               account: data.account,
               debit: data.amount,
               credit: 0,
               description: "Expense recorded",
            },
            {
               account: cashBankAccount._id,
               debit: 0,
               credit: data.amount,
               description: "Payment made",
            },
         ],
      });
   }

   return payment;
};

exports.getAllVendorPayments = async (filters = {}) => {
   const query = {};
   if (filters.vendor) query.vendor = filters.vendor;
   if (filters.project) query.project = filters.project;
   if (filters.status) query.status = filters.status;

   return await VendorPayment.find(query)
      .populate("vendor", "name vendorCode")
      .populate("project", "name")
      .populate("purchaseOrder", "poNumber")
      .populate("account", "name code")
      .populate("createdBy", "name")
      .sort({ date: -1 });
};

exports.updateVendorPayment = async (id, data) => {
   return await VendorPayment.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteVendorPayment = async (id) => {
   return await VendorPayment.findByIdAndDelete(id);
};

// ============ CASH ACCOUNTS ============

exports.createCashAccount = async (data, userId) => {
   return await CashAccount.create({
      ...data,
      createdBy: userId,
   });
};

exports.getAllCashAccounts = async () => {
   return await CashAccount.find()
      .populate("project", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
};

exports.updateCashAccount = async (id, data) => {
   return await CashAccount.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCashAccount = async (id) => {
   return await CashAccount.findByIdAndDelete(id);
};

// ============ BANK ACCOUNTS ============

exports.createBankAccount = async (data, userId) => {
   return await BankAccount.create({
      ...data,
      createdBy: userId,
   });
};

exports.getAllBankAccounts = async () => {
   return await BankAccount.find()
      .populate("project", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
};

exports.updateBankAccount = async (id, data) => {
   return await BankAccount.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteBankAccount = async (id) => {
   return await BankAccount.findByIdAndDelete(id);
};

// ============ FINANCIAL REPORTS ============

exports.getGeneralLedger = async (filters = {}) => {
   const query = {};
   if (filters.account) query.account = filters.account;
   if (filters.project) query.project = filters.project;
   if (filters.startDate && filters.endDate) {
      query.createdAt = { $gte: filters.startDate, $lte: filters.endDate };
   }

   const lines = await JournalEntryLine.find(query)
      .populate("account", "name code type")
      .populate("journalEntry", "date reference description status")
      .populate("project", "name")
      .sort({ createdAt: 1 });

   return lines;
};

exports.getTrialBalance = async () => {
   const accounts = await Account.find({ isActive: true })
      .populate("category", "name code type")
      .sort({ code: 1 });

   const trialBalance = accounts.map((acc) => ({
      account: acc.name,
      code: acc.code,
      category: acc.category?.name,
      type: acc.category?.type,
      debit: acc.currentBalance > 0 ? acc.currentBalance : 0,
      credit: acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0,
   }));

   const totalDebit = trialBalance.reduce((sum, r) => sum + r.debit, 0);
   const totalCredit = trialBalance.reduce((sum, r) => sum + r.credit, 0);

   return {
      accounts: trialBalance,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.001,
   };
};

exports.getProfitLoss = async () => {
   const accounts = await Account.find({ isActive: true }).populate(
      "category",
      "name code type"
   );

   const revenueAccounts = accounts.filter(
      (a) => a.category?.type === "revenue"
   );
   const expenseAccounts = accounts.filter(
      (a) => a.category?.type === "expense"
   );

   const totalRevenue = revenueAccounts.reduce(
      (sum, a) => sum + Math.abs(a.currentBalance || 0),
      0
   );
   const totalExpense = expenseAccounts.reduce(
      (sum, a) => sum + Math.abs(a.currentBalance || 0),
      0
   );

   return {
      revenue: revenueAccounts.map((a) => ({
         account: a.name,
         code: a.code,
         amount: Math.abs(a.currentBalance || 0),
      })),
      expenses: expenseAccounts.map((a) => ({
         account: a.name,
         code: a.code,
         amount: Math.abs(a.currentBalance || 0),
      })),
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
   };
};

exports.getBalanceSheet = async () => {
   const accounts = await Account.find({ isActive: true }).populate(
      "category",
      "name code type"
   );

   const assets = accounts.filter((a) => a.category?.type === "asset");
   const liabilities = accounts.filter((a) => a.category?.type === "liability");
   const equity = accounts.filter((a) => a.category?.type === "equity");

   const totalAssets = assets.reduce(
      (sum, a) => sum + Math.abs(a.currentBalance || 0),
      0
   );
   const totalLiabilities = liabilities.reduce(
      (sum, a) => sum + Math.abs(a.currentBalance || 0),
      0
   );
   const totalEquity = equity.reduce(
      (sum, a) => sum + Math.abs(a.currentBalance || 0),
      0
   );

   return {
      assets: assets.map((a) => ({
         account: a.name,
         code: a.code,
         amount: Math.abs(a.currentBalance || 0),
      })),
      liabilities: liabilities.map((a) => ({
         account: a.name,
         code: a.code,
         amount: Math.abs(a.currentBalance || 0),
      })),
      equity: equity.map((a) => ({
         account: a.name,
         code: a.code,
         amount: Math.abs(a.currentBalance || 0),
      })),
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced:
         Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.001,
   };
};

// ============ ACCOUNTS RECEIVABLE ============

exports.getAccountsReceivable = async () => {
   const payments = await CustomerPayment.find({ status: "completed" })
      .populate("client", "name clientCode")
      .populate("project", "name")
      .sort({ date: -1 });

   const ar = {};
   for (const payment of payments) {
      const clientId = payment.client?._id || payment.client;
      if (!ar[clientId]) {
         ar[clientId] = {
            client: payment.client,
            totalAmount: 0,
            payments: [],
         };
      }
      ar[clientId].totalAmount += payment.amount;
      ar[clientId].payments.push(payment);
   }

   return Object.values(ar);
};

// ============ ACCOUNTS PAYABLE ============

exports.getAccountsPayable = async () => {
   const payments = await VendorPayment.find({ status: "completed" })
      .populate("vendor", "name vendorCode")
      .populate("project", "name")
      .sort({ date: -1 });

   const ap = {};
   for (const payment of payments) {
      const vendorId = payment.vendor?._id || payment.vendor;
      if (!ap[vendorId]) {
         ap[vendorId] = {
            vendor: payment.vendor,
            totalAmount: 0,
            payments: [],
         };
      }
      ap[vendorId].totalAmount += payment.amount;
      ap[vendorId].payments.push(payment);
   }

   return Object.values(ap);
};

// ============ PROJECT EXPENSE ALLOCATION ============

exports.getProjectExpenseAllocation = async (projectId) => {
   const lines = await JournalEntryLine.find({ project: projectId })
      .populate("account", "name code")
      .populate("journalEntry", "date reference")
      .sort({ createdAt: -1 });

   const expenses = lines
      .filter((l) => l.debit > 0)
      .map((l) => ({
         date: l.journalEntry?.date,
         reference: l.journalEntry?.reference,
         account: l.account?.name,
         amount: l.debit,
         description: l.description,
      }));

   const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

   return {
      projectId,
      expenses,
      totalExpense,
   };
};

// ============ PROJECT REVENUE ALLOCATION ============

exports.getProjectRevenueAllocation = async (projectId) => {
   const lines = await JournalEntryLine.find({ project: projectId })
      .populate("account", "name code")
      .populate("journalEntry", "date reference")
      .sort({ createdAt: -1 });

   const revenues = lines
      .filter((l) => l.credit > 0)
      .map((l) => ({
         date: l.journalEntry?.date,
         reference: l.journalEntry?.reference,
         account: l.account?.name,
         amount: l.credit,
         description: l.description,
      }));

   const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

   return {
      projectId,
      revenues,
      totalRevenue,
   };
};
