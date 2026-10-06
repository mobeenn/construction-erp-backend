const AccountCategory = require("../models/AccountCategory");
const Account = require("../models/Account");

const seedAccounting = async () => {
   // Check if already seeded
   const existingCategories = await AccountCategory.find();
   if (existingCategories.length > 0) {
      console.log("Accounting data already seeded");
      return;
   }

   // Account Categories
   const categories = [
      { name: "Current Assets", code: "CA", type: "asset", description: "Assets expected to be converted to cash within one year" },
      { name: "Fixed Assets", code: "FA", type: "asset", description: "Long-term tangible assets" },
      { name: "Current Liabilities", code: "CL", type: "liability", description: "Obligations due within one year" },
      { name: "Long-term Liabilities", code: "LTL", type: "liability", description: "Obligations due after one year" },
      { name: "Owner's Equity", code: "OE", type: "equity", description: "Owner's stake in the business" },
      { name: "Revenue", code: "REV", type: "revenue", description: "Income from business operations" },
      { name: "Cost of Goods Sold", code: "COGS", type: "expense", description: "Direct costs of producing goods" },
      { name: "Operating Expenses", code: "OPEX", type: "expense", description: "Day-to-day business expenses" },
      { name: "Payroll Expenses", code: "PAY", type: "expense", description: "Employee salaries and wages" },
      { name: "Project Costs", code: "PROJ", type: "expense", description: "Direct project-related costs" },
   ];

   const categoryIds = {};
   for (const cat of categories) {
      const created = await AccountCategory.create(cat);
      categoryIds[cat.code] = created._id;
   }

   // Default Accounts
   const accounts = [
      // Assets
      { name: "Cash on Hand", code: "1001", category: categoryIds["CA"], type: "asset", openingBalance: 0, description: "Physical cash" },
      { name: "Bank Account", code: "1002", category: categoryIds["CA"], type: "asset", openingBalance: 0, description: "Primary bank account" },
      { name: "Accounts Receivable", code: "1003", category: categoryIds["CA"], type: "asset", openingBalance: 0, description: "Money owed by customers" },
      { name: "Inventory", code: "1004", category: categoryIds["CA"], type: "asset", openingBalance: 0, description: "Materials and supplies" },
      { name: "Equipment", code: "1501", category: categoryIds["FA"], type: "asset", openingBalance: 0, description: "Construction equipment" },
      { name: "Vehicles", code: "1502", category: categoryIds["FA"], type: "asset", openingBalance: 0, description: "Company vehicles" },

      // Liabilities
      { name: "Accounts Payable", code: "2001", category: categoryIds["CL"], type: "liability", openingBalance: 0, description: "Money owed to vendors" },
      { name: "VAT Payable", code: "2002", category: categoryIds["CL"], type: "liability", openingBalance: 0, description: "VAT collected" },
      { name: "Accrued Expenses", code: "2003", category: categoryIds["CL"], type: "liability", openingBalance: 0, description: "Expenses incurred but not yet paid" },
      { name: "Bank Loan", code: "2501", category: categoryIds["LTL"], type: "liability", openingBalance: 0, description: "Long-term bank loans" },

      // Equity
      { name: "Owner's Capital", code: "3001", category: categoryIds["OE"], type: "equity", openingBalance: 0, description: "Owner's investment" },
      { name: "Retained Earnings", code: "3002", category: categoryIds["OE"], type: "equity", openingBalance: 0, description: "Accumulated profits" },

      // Revenue
      { name: "Project Revenue", code: "4001", category: categoryIds["REV"], type: "revenue", openingBalance: 0, description: "Revenue from projects" },
      { name: "Interim Payment Revenue", code: "4002", category: categoryIds["REV"], type: "revenue", openingBalance: 0, description: "Revenue from interim payments" },
      { name: "Other Income", code: "4003", category: categoryIds["REV"], type: "revenue", openingBalance: 0, description: "Miscellaneous income" },

      // Expenses
      { name: "Material Costs", code: "5001", category: categoryIds["PROJ"], type: "expense", openingBalance: 0, description: "Construction materials" },
      { name: "Labor Costs", code: "5002", category: categoryIds["PROJ"], type: "expense", openingBalance: 0, description: "Direct labor" },
      { name: "Subcontractor Costs", code: "5003", category: categoryIds["PROJ"], type: "expense", openingBalance: 0, description: "Subcontractor payments" },
      { name: "Equipment Rental", code: "5004", category: categoryIds["PROJ"], type: "expense", openingBalance: 0, description: "Equipment rental costs" },
      { name: "Salaries & Wages", code: "6001", category: categoryIds["PAY"], type: "expense", openingBalance: 0, description: "Employee compensation" },
      { name: "Office Rent", code: "6002", category: categoryIds["OPEX"], type: "expense", openingBalance: 0, description: "Office space rental" },
      { name: "Utilities", code: "6003", category: categoryIds["OPEX"], type: "expense", openingBalance: 0, description: "Electricity, water, etc." },
      { name: "Fuel & Transport", code: "6004", category: categoryIds["OPEX"], type: "expense", openingBalance: 0, description: "Vehicle fuel and transport" },
      { name: "Insurance", code: "6005", category: categoryIds["OPEX"], type: "expense", openingBalance: 0, description: "Insurance premiums" },
      { name: "Professional Fees", code: "6006", category: categoryIds["OPEX"], type: "expense", openingBalance: 0, description: "Legal, accounting, etc." },
   ];

   for (const acc of accounts) {
      await Account.create(acc);
   }

   console.log(`Seeded ${categories.length} account categories and ${accounts.length} accounts`);
};

module.exports = seedAccounting;
