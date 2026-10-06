const RFQ = require("../../models/RFQ");
const { rfqSchema } = require("../../validators/rfq.validation");
const svc = require("../../services/rfq.service");

exports.create = async (req, res) => {
   try {
      const data = rfqSchema.parse(req.body);
      const rfq = await svc.createRfq(data, req.user._id);
      res.status(201).json({ success: true, data: rfq });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      let rfqs = await RFQ.find()
         .populate("project", "name")
         .populate("createdBy", "name");

      if (req.query.project)
         rfqs = rfqs.filter((r) => String(r.project?._id || r.project) === req.query.project);

      res.status(200).json({ success: true, data: rfqs });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.getOne = async (req, res) => {
   try {
      const rfq = await RFQ.findById(req.params.id)
         .populate("project", "name")
         .populate("createdBy", "name");

      res.status(200).json({ success: true, data: rfq });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
