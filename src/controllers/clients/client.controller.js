const Client = require("../../models/Client");
const { clientSchema } = require("../../validators/client.validation");
const { createClient } = require("../../services/client.service");

exports.create = async (req, res) => {
   try {
      const data = clientSchema.parse(req.body);
      const client = await createClient(data);
      res.status(201).json({ success: true, data: client });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const search = req.query.search || "";

      let clients = await Client.find();

      if (search) {
         clients = clients.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()),
         );
      }

      res.status(200).json({ success: true, data: clients });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.update = async (req, res) => {
   try {
      const data = clientSchema.partial().parse(req.body);
      const client = await Client.findByIdAndUpdate(req.params.id, data, { new: true });
      res.status(200).json({ success: true, data: client });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getOne = async (req, res) => {
   try {
      const client = await Client.findById(req.params.id);

      if (!client)
         return res.status(404).json({ success: false, message: "Client not found" });

      const Project = require("../../models/Project");
      const Contract = require("../../models/Contract");

      const projects = (await Project.find()).filter(
         (p) => String(p.client) === String(client._id),
      );

      const contracts = (await Contract.find())
         .filter((c) => String(c.client) === String(client._id))
         .map((c) => ({ ...c }));

      res.status(200).json({
         success: true,
         data: {
            ...client,
            projects: projects.map((p) => ({
               _id: p._id,
               projectCode: p.projectCode,
               name: p.name,
               status: p.status,
               contractValue: p.contractValue,
               budget: p.budget,
            })),
            contracts,
         },
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.remove = async (req, res) => {
   try {
      await Client.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Client deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
