const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dns = require("node:dns/promises");
require("dotenv").config();

const connectDB = require("./src/config/db");

const app = express();

dns.setServers(["1.1.1.1", "1.0.0.1"]);

connectDB();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
   res.status(200).json({
      success: true,
      message: "Construction ERP API Running",
   });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const authRoutes = require("./src/routes/auth.routes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./src/routes/user.routes");
app.use("/api/users", userRoutes);

const employeeRoutes = require("./src/routes/employee.routes");
app.use("/api/employees", employeeRoutes);

const attendanceRoutes = require("./src/routes/attendance.routes");
app.use("/api/attendance", attendanceRoutes);

const projectRoutes = require("./src/routes/project.routes");
app.use("/api/projects", projectRoutes);

const inventoryRoutes = require("./src/routes/inventory.routes");
app.use("/api/inventory", inventoryRoutes);

const materialRequestRoutes = require("./src/routes/materialRequest.routes");
app.use("/api/material-requests", materialRequestRoutes);

const materialIssueRoutes = require("./src/routes/materialIssue.routes");
app.use("/api/material-issues", materialIssueRoutes);

const vendorRoutes = require("./src/routes/vendor.routes");
app.use("/api/vendors", vendorRoutes);

const purchaseOrderRoutes = require("./src/routes/purchaseOrder.routes");
app.use("/api/purchase-orders", purchaseOrderRoutes);

const grnRoutes = require("./src/routes/grn.routes");
app.use("/api/grns", grnRoutes);

const expenseRoutes = require("./src/routes/expense.routes");
app.use("/api/expenses", expenseRoutes);

const dashboardRoutes = require("./src/routes/dashboard.routes");
app.use("/api/dashboard", dashboardRoutes);

const reportRoutes = require("./src/routes/report.routes");
app.use("/api/reports", reportRoutes);

const profitLossRoutes = require("./src/routes/profitLoss.routes");
app.use("/api/profit-loss", profitLossRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: "Route not found",
   });
});
/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
   console.error("SERVER ERROR:", err);

   res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
   });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`Server running on ${PORT}`);
});

module.exports = app;
