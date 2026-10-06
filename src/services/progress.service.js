const ProgressReport = require("../models/ProgressReport");
const Project = require("../models/Project");

exports.createProgress = async (data, userId) => {
   const report = await ProgressReport.create({
      ...data,
      date: data.date || new Date().toISOString(),
      reportedBy: userId,
   });

   // roll up latest progress onto the project
   const project = await Project.findById(data.project);
   if (project) {
      project.progress = data.percentComplete;
      await project.save();
   }

   return report;
};
