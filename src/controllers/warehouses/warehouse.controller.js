const Warehouse = require("../../models/Warehouse");
const { z } = require("zod");

const schema = z.object({
   name: z.string().min(2),
   code: z.string().optional(),
   location: z.string().optional(),
   project: z.string().optional().nullable(),
   manager: z.string().optional().nullable(),
   status: z.enum(["active", "inactive"]).optional(),
});

exports.create = async (req, res) => {
   try {
      const data = schema.parse(req.body);
      const w = await Warehouse.create(data);
      res.status(201).json({ success: true, data: w });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const warehouses = await Warehouse.find()
         .populate("project", "name")
         .populate("manager", "name");
      res.status(200).json({ success: true, data: warehouses });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.update = async (req, res) => {
   try {
      const data = schema.partial().parse(req.body);
      const w = await Warehouse.findByIdAndUpdate(req.params.id, data, { new: true });
      res.status(200).json({ success: true, data: w });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.remove = async (req, res) => {
   try {
      await Warehouse.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Warehouse deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
