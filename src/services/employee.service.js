const Employee = require("../models/Employee");

const generateEmployeeCode = require("../utils/generateEmployeeCode");

exports.createEmployee = async (data) => {
   const employeeId = await generateEmployeeCode();

   return await Employee.create({
      ...data,

      employeeId,
   });
};
