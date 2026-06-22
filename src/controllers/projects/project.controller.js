const Project = require("../../models/Project");

const { projectSchema } = require("../../validators/project.validation");

const { createProject } = require("../../services/project.service");

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
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Projects

exports.getAll = async (req, res) => {
   try {
      const projects = await Project.find()

         .populate(
            "supervisor",

            "name email",
         )

         .sort({
            createdAt: -1,
         });

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

// Update Project

exports.update = async (req, res) => {
   try {
      const project = await Project.findByIdAndUpdate(
         req.params.id,

         req.body,

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
