const Employee = require("../../models/Employee");
const User = require("../../models/User");
const { query, fetchByIds } = require("../../config/pgDb");
const { employeeSchema } = require("../../validators/employee.validation");
const { createEmployee } = require("../../services/employee.service");

const pickFields = (doc, fields) => {
   if (!fields) return doc;
   const out = { _id: doc._id };
   String(fields)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((f) => {
         if (f in doc) out[f] = doc[f];
      });
   return out;
};

const populateEmployees = async (docs) => {
   const specs = [
      { path: "assignedProject", collection: "projects", select: "projectCode name location" },
      { path: "department", collection: "departments", select: "name code" },
      { path: "designationId", collection: "designations", select: "title code level" },
      { path: "userAccount", collection: "users", select: "name email" },
   ];
   for (const spec of specs) {
      const ids = [
         ...new Set(
            docs
               .map((d) => d[spec.path])
               .filter((id) => id && typeof id !== "object")
               .map(String),
         ),
      ];
      if (!ids.length) continue;
      const map = await fetchByIds(spec.collection, ids);
      for (const doc of docs) {
         const id = doc[spec.path];
         if (!id || typeof id === "object") continue;
         const target = map[String(id)];
         if (target) doc[spec.path] = pickFields(target, spec.select);
      }
   }
   return docs;
};

// Create Employee
exports.create = async (req, res) => {
   try {
      const data = employeeSchema.parse(req.body);
      if (data.userAccount) {
         const account = await User.findById(data.userAccount);
         if (!account || account.role !== "employee" || !account.isActive) {
            throw new Error("Select a valid active employee portal account");
         }
         if (await Employee.findOne({ userAccount: data.userAccount })) {
            throw new Error("This employee account is already linked to a profile");
         }
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

// Get Employees — SQL search + LIMIT/OFFSET, then batch populate page rows
exports.getAll = async (req, res) => {
   try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = String(req.query.search || "").trim();
      const skip = (page - 1) * limit;

      const params = [];
      let where = "1=1";
      if (search) {
         params.push(`%${search}%`);
         where = `(name ILIKE $1 OR employee_code ILIKE $1 OR COALESCE(email,'') ILIKE $1 OR COALESCE(phone,'') ILIKE $1 OR COALESCE(designation,'') ILIKE $1 OR COALESCE(assigned_site,'') ILIKE $1)`;
      }

      const countResult = await query(
         `SELECT COUNT(*)::int AS count FROM employees WHERE ${where}`,
         params,
      );
      const total = countResult.rows[0]?.count || 0;

      const listParams = [...params, limit, skip];
      const limIdx = params.length + 1;
      const offIdx = params.length + 2;
      const idResult = await query(
         `SELECT id FROM employees WHERE ${where}
          ORDER BY created_at DESC NULLS LAST
          LIMIT $${limIdx} OFFSET $${offIdx}`,
         listParams,
      );
      const ids = idResult.rows.map((r) => r.id);
      const map = await fetchByIds("employees", ids);
      const pageEmployees = await populateEmployees(
         ids.map((id) => map[id]).filter(Boolean),
      );

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
      const data = employeeSchema.partial().parse(req.body);
      if (data.userAccount) {
         const account = await User.findById(data.userAccount);
         if (!account || account.role !== "employee" || !account.isActive) {
            throw new Error("Select a valid active employee portal account");
         }
         const linked = await Employee.findOne({ userAccount: data.userAccount });
         if (linked && String(linked._id) !== String(req.params.id)) {
            throw new Error("This employee account is already linked to a profile");
         }
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
