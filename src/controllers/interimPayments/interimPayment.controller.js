const InterimPayment = require("../../models/InterimPayment");
const { interimPaymentSchema } = require("../../validators/interimPayment.validation");
const svc = require("../../services/interimPayment.service");

exports.create = async (req, res) => {
   try {
      const data = interimPaymentSchema.parse(req.body);
      const payment = await svc.createPayment(data, req.user._id);
      res.status(201).json({ success: true, data: payment });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const { project, status, from, to, client } = req.query;

      let payments = await InterimPayment.find()
         .populate("project", "name projectCode")
         .populate("contract", "contractNo")
         .populate("client", "name")
         .populate("submittedBy", "name")
         .populate("approvedBy", "name");

      if (project)
         payments = payments.filter(
            (p) => String(p.project?._id || p.project) === project,
         );

      if (status) payments = payments.filter((p) => p.status === status);

      if (client)
         payments = payments.filter(
            (p) => String(p.client?._id || p.client) === client,
         );

      if (from)
         payments = payments.filter(
            (p) => new Date(p.submissionDate || p.createdAt) >= new Date(from),
         );

      if (to)
         payments = payments.filter(
            (p) => new Date(p.submissionDate || p.createdAt) <= new Date(to),
         );

      res.status(200).json({ success: true, data: payments });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getOne = async (req, res) => {
   try {
      const bill = await InterimPayment.findById(req.params.id)
         .populate("project", "name projectCode")
         .populate("contract", "contractNo value")
         .populate("client", "name")
         .populate("submittedBy", "name")
         .populate("approvedBy", "name");

      if (!bill)
         return res.status(404).json({ success: false, message: "Not found" });

      res.status(200).json({ success: true, data: bill });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updateStatus = async (req, res) => {
   try {
      const { status } = req.body;

      const payment = await svc.transitionStatus(req.params.id, status, req.user);

      res.status(200).json({ success: true, data: payment });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.recordPayment = async (req, res) => {
   try {
      const { amount } = req.body;

      const payment = await svc.recordPayment(req.params.id, amount, req.user._id);

      res.status(200).json({ success: true, data: payment });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.financialSummary = async (req, res) => {
   try {
      const data = await svc.getProjectFinancialSummary(req.params.projectId);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.remove = async (req, res) => {
   try {
      await InterimPayment.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Bill deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
