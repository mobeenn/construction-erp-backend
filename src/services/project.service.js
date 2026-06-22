const Project = require("../models/Project");

const generateProjectCode = require("../utils/generateProjectCode");

exports.createProject = async (data) => {
   const projectCode = await generateProjectCode();

   return await Project.create({
      ...data,

      projectCode,
   });
};
