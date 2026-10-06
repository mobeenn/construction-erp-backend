const VendorQuotation = require("../models/VendorQuotation");
const RFQ = require("../models/RFQ");
const generateQuotationNo = require("../utils/generateQuotationNo");

exports.createQuotation = async (data) => {
   const quantity = Number(data.quantity);
   const unitPrice = Number(data.unitPrice);
   const tax = Number(data.tax || 0);
   const discount = Number(data.discount || 0);

   const subtotal = quantity * unitPrice;
   const total = subtotal + tax - discount;

   const quotationNo = await generateQuotationNo();

   return await VendorQuotation.create({
      ...data,
      quotationNo,
      total,
      status: "received",
   });
};

exports.selectQuotation = async (quotationId) => {
   const quotation = await VendorQuotation.findById(quotationId);

   if (!quotation) throw new Error("Quotation not found");

   quotation.status = "selected";

   await quotation.save();

   const rfq = await RFQ.findById(quotation.rfq);

   if (rfq) {
      rfq.status = "awarded";
      await rfq.save();
   }

   return quotation;
};

exports.compareByRfq = async (rfqId) => {
   const quotations = (await VendorQuotation.find())
      .filter((q) => String(q.rfq) === String(rfqId))
      .map(async (q) => q);

   const resolved = await Promise.all(quotations);

   // populate vendor manually
   const Vendor = require("../models/Vendor");

   for (const q of resolved) {
      const vendor = await Vendor.findById(q.vendor);
      q.vendor = vendor ? vendor.companyName : q.vendor;
   }

   // group by item
   const byItem = {};

   resolved.forEach((q) => {
      if (!byItem[q.item]) byItem[q.item] = [];

      byItem[q.item].push(q);
   });

   Object.keys(byItem).forEach((item) => {
      byItem[item].sort((a, b) => a.total - b.total);
   });

   return byItem;
};
