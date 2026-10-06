const Project = require("../../models/Project");

const { projectSchema, updateProjectSchema } = require("../../validators/project.validation");

const { createProject, getProjectDashboard } = require("../../services/project.service");

// Create Project

exports.create = async (req, res) => {
   try {
      const data = projectSchema.parse(req.body);

      const project = await createProject(data);

      res.status(201).json({
         success: true,

         data: project,
      });
   } catch (error) {
      res.status(400).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Projects

exports.getAll = async (req, res) => {
   try {
      const { status, client, search } = req.query;

      let projects = await Project.find()

         .populate("supervisor", "name email")

         .populate("client", "name")

         .populate("contract", "contractNo value")

         .populate("projectManager", "name email")

         .populate("siteSupervisor", "name email")

         .sort({
            createdAt: -1,
         });

      if (status) projects = projects.filter((p) => p.status === status);

      if (client)
         projects = projects.filter(
            (p) => String(p.client?._id || p.client) === client,
         );

      if (search)
         projects = projects.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
         );

      res.status(200).json({
         success: true,

         data: projects,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Single Project

exports.getOne = async (req, res) => {
   try {
      const project = await Project.findById(req.params.id)
         .populate("supervisor", "name email")
         .populate("client", "name contactPerson phone email")
         .populate("contract", "contractNo value retentionPercent status")
         .populate("projectManager", "name email")
         .populate("siteSupervisor", "name email");

      if (!project)
         return res.status(404).json({ success: false, message: "Project not found" });

      res.status(200).json({
         success: true,

         data: project,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Project Dashboard

exports.dashboard = async (req, res) => {
   try {
      const data = await getProjectDashboard(req.params.id);

      res.status(200).json({
         success: true,

         data,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Update Project

exports.update = async (req, res) => {
   try {
      const data = updateProjectSchema.parse(req.body);

      const project = await Project.findByIdAndUpdate(
         req.params.id,

         data,

         {
            new: true,
         },
      );

      res.status(200).json({
         success: true,

         data: project,
      });
   } catch (error) {
      res.status(400).json({
         success: false,

         message: error.message,
      });
   }
};

// Delete Project

exports.remove = async (req, res) => {
   try {
      await Project.findByIdAndDelete(req.params.id);

      res.status(200).json({
         success: true,

         message: "Project deleted",
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

exports.updateRevenue = async (
   req,

   res,
) => {
   try {
      const project = await Project.findByIdAndUpdate(
         req.params.id,

         {
            contractValue: req.body.contractValue,

            receivedAmount: req.body.receivedAmount,
         },

         {
            new: true,
         },
      );

      res.status(200).json({
         success: true,

         data: project,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
