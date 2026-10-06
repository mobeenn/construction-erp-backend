const Employee = require("../../models/Employee");
const User = require("../../models/User");

const { employeeSchema } = require("../../validators/employee.validation");

const { createEmployee } = require("../../services/employee.service");

// Create Employee

exports.create = async (req, res) => {
   try {
      const data = employeeSchema.parse(req.body);
      if (data.userAccount) {
         const account = await User.findById(data.userAccount);
         if (!account || account.role !== "employee" || !account.isActive) throw new Error("Select a valid active employee portal account");
         if (await Employee.findOne({ userAccount: data.userAccount })) throw new Error("This employee account is already linked to a profile");
      }

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



      const employees = await Employee.find()
         .populate("assignedProject", "projectCode name location")
         .populate("department", "name code")
         .populate("designationId", "title code level")
         .populate("userAccount", "name email")

         .sort({ createdAt: -1 });

      const filtered = employees.filter((employee) => {
         const searchable = [employee.name, employee.employeeId, employee.email, employee.phone, employee.designation, employee.assignedSite]
            .filter(Boolean).join(" ");
         return !search || new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(searchable);
      });

      const total = filtered.length;
      const pageEmployees = filtered.slice(skip, skip + limit);

      res.status(200).json({
         success: true,

         total,

         page,

         data: pageEmployees,
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
      const employee = await Employee.findById(req.params.id)
         .populate("assignedProject", "projectCode name location")
         .populate("department", "name code")
         .populate("designationId", "title code level")
         .populate("userAccount", "name email");

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
      const { employeeSchema } = require("../../validators/employee.validation");
      const data = employeeSchema.partial().parse(req.body);
      if (data.userAccount) {
         const account = await User.findById(data.userAccount);
         if (!account || account.role !== "employee" || !account.isActive) throw new Error("Select a valid active employee portal account");
         const linked = await Employee.findOne({ userAccount: data.userAccount });
         if (linked && String(linked._id) !== String(req.params.id)) throw new Error("This employee account is already linked to another profile");
      }
      const employee = await Employee.findByIdAndUpdate(req.params.id, data, { new: true });

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
