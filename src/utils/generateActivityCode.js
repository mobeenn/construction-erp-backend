const Activity = require("../models/Activity");

const generateActivityCode = async () => {
   const count = await Activity.countDocuments();
   return `ACT-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateActivityCode;
