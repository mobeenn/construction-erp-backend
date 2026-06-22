const Expense = require("../models/Expense");

const generateExpenseNo = async () => {
   const count = await Expense.countDocuments();

   return `EXP-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateExpenseNo;
