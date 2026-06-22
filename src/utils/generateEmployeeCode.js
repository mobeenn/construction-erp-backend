const Employee = require("../models/Employee");

const generateEmployeeCode = async () => {
   const count = await Employee.countDocuments();

   return `EMP-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateEmployeeCode;
