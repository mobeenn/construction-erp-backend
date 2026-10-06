const Expense = require("../../models/Expense");

const { expenseSchema } = require("../../validators/expense.validation");

const { createExpense } = require("../../services/expense.service");

// Create Expense

exports.create = async (req, res) => {
   try {
      const data = expenseSchema.parse(req.body);

      const expense = await createExpense(
         data,

         req.user._id,
      );

      res.status(201).json({
         success: true,

         data: expense,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Expenses

exports.getAll = async (req, res) => {
   try {
      const expenses = await Expense.find()

         .populate(
            "project",

            "name",
         )

         .sort({
            createdAt: -1,
         });

      const { project } = req.query;

      const filtered = project
         ? expenses.filter(
              (e) => String(e.project?._id || e.project) === project,
           )
         : expenses;

      res.status(200).json({
         success: true,

         data: filtered,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
