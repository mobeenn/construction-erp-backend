const VendorQuotation = require("../../models/VendorQuotation");
const { quotationSchema } = require("../../validators/quotation.validation");
const svc = require("../../services/quotation.service");

exports.create = async (req, res) => {
   try {
      const data = quotationSchema.parse(req.body);
      const q = await svc.createQuotation(data);
      res.status(201).json({ success: true, data: q });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      let qs = await VendorQuotation.find()
         .populate("vendor", "companyName")
         .populate("rfq", "rfqNo");

      if (req.query.rfq)
         qs = qs.filter((q) => String(q.rfq?._id || q.rfq) === req.query.rfq);

      res.status(200).json({ success: true, data: qs });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.select = async (req, res) => {
   try {
      const q = await svc.selectQuotation(req.params.id);
      res.status(200).json({ success: true, data: q });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.compare = async (req, res) => {
   try {
      const data = await svc.compareByRfq(req.params.rfqId);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
