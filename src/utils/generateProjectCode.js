const Project = require("../models/Project");

const generateProjectCode = async () => {
   const count = await Project.countDocuments();

   return `PRJ-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateProjectCode;
