const Budget = require("../../models/Budget");
const { budgetSchema } = require("../../validators/budget.validation");
const svc = require("../../services/budget.service");

exports.create = async (req, res) => {
   try {
      const data = budgetSchema.parse(req.body);
      const budget = await svc.createBudget(data, req.user._id);
      res.status(201).json({ success: true, data: budget });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const { project } = req.query;

      let budgets = await Budget.find()
         .populate("project", "name projectCode")
         .populate("approvedBy", "name");

      if (project)
         budgets = budgets.filter(
            (b) => String(b.project?._id || b.project) === project,
         );

      res.status(200).json({ success: true, data: budgets });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.activate = async (req, res) => {
   try {
      const budget = await Budget.findByIdAndUpdate(
         req.params.id,
         { status: "active" },
         { new: true },
      );
      res.status(200).json({ success: true, data: budget });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.remove = async (req, res) => {
   try {
      await Budget.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Budget deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.analysis = async (req, res) => {
   try {
      const data = await svc.getProjectBudgetAnalysis(req.params.projectId);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
