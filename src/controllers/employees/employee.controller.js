const Employee = require("../../models/Employee");

const { employeeSchema } = require("../../validators/employee.validation");

const { createEmployee } = require("../../services/employee.service");

// Create Employee

exports.create = async (req, res) => {
   try {
      const data = employeeSchema.parse(req.body);

      const employee = await createEmployee(data);

      res.status(201).json({
         success: true,

         data: employee,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Employees

exports.getAll = async (req, res) => {
   try {
      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const search = req.query.search || "";

      const skip = (page - 1) * limit;

      const query = {
         name: {
            $regex: search,

            $options: "i",
         },
      };

      const employees = await Employee.find(query)

         .skip(skip)

         .limit(limit)

         .sort({ createdAt: -1 });

      const total = await Employee.countDocuments(query);

      res.status(200).json({
         success: true,

         total,

         page,

         data: employees,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Single Employee

exports.getOne = async (req, res) => {
   try {
      const employee = await Employee.findById(req.params.id);

      res.status(200).json({
         success: true,

         data: employee,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Update Employee

exports.update = async (req, res) => {
   try {
      const employee = await Employee.findByIdAndUpdate(
         req.params.id,

         req.body,

         {
            new: true,
         },
      );

      res.status(200).json({
         success: true,

         data: employee,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Delete Employee

exports.remove = async (req, res) => {
   try {
      await Employee.findByIdAndDelete(req.params.id);

      res.status(200).json({
         success: true,

         message: "Employee deleted",
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
