const Contract = require("../../models/Contract");
const { contractSchema } = require("../../validators/contract.validation");
const { createContract } = require("../../services/contract.service");

exports.create = async (req, res) => {
   try {
      const data = contractSchema.parse(req.body);
      const contract = await createContract(data);
      res.status(201).json({ success: true, data: contract });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const { project, client } = req.query;

      let contracts = await Contract.find()
         .populate("client", "name")
         .populate("project", "name projectCode");

      if (project)
         contracts = contracts.filter(
            (c) => String(c.project?._id || c.project) === project,
         );

      if (client)
         contracts = contracts.filter(
            (c) => String(c.client?._id || c.client) === client,
         );

      res.status(200).json({ success: true, data: contracts });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getOne = async (req, res) => {
   try {
      const contract = await Contract.findById(req.params.id)
         .populate("client", "name contactPerson")
         .populate("project", "name projectCode");

      if (!contract)
         return res.status(404).json({ success: false, message: "Contract not found" });

      const InterimPayment = require("../../models/InterimPayment");

      const bills = (await InterimPayment.find()).filter(
         (b) =>
            String(b.contract?._id || b.contract) === String(contract._id) ||
            String(b.project?._id || b.project) === String(contract.project?._id || contract.project),
      );

      const billed = bills.reduce((s, b) => s + (b.grossAmount || 0), 0);

      const received = bills
         .filter((b) => b.status === "paid")
         .reduce((s, b) => s + (b.netAmount || 0), 0);

      const revisedValue =
         (contract.value || 0) + (contract.approvedVariations || 0);

      res.status(200).json({
         success: true,
         data: {
            ...contract,
            summary: {
               contractValue: contract.value || 0,
               approvedVariations: contract.approvedVariations || 0,
               revisedValue,
               retentionPercent: contract.retentionPercent || 0,
               advancePercent: contract.advancePercentage || 0,
               advanceAmount: Math.round(((contract.value || 0) * (contract.advancePercentage || 0)) / 100),
               tax: contract.tax || 0,
               billed,
               received,
               outstanding: billed - received,
            },
            bills,
         },
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.update = async (req, res) => {
   try {
      const data = contractSchema.partial().parse(req.body);
      const contract = await Contract.findByIdAndUpdate(req.params.id, data, {
         new: true,
      });
      res.status(200).json({ success: true, data: contract });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.remove = async (req, res) => {
   try {
      await Contract.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Contract deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
