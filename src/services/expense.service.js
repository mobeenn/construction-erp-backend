const Expense = require("../models/Expense");

const generateExpenseNo = require("../utils/generateExpenseNo");

exports.createExpense = async (
   data,

   userId,
) => {
   const expenseNo = await generateExpenseNo();

   return await Expense.create({
      ...data,

      expenseNo,

      createdBy: userId,
   });
};
