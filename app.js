const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./src/config/db");

const app = express();

connectDB();

// Seed accounting data
const seedAccounting = require("./src/seeds/accounting.seed");
seedAccounting().catch(console.error);

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
// JSON Database Status Endpoint
app.get("/db-status", (req, res) => {
   const { load } = require("./src/config/jsonDb");
   const db = load();

   res.json({
      success: true,
      collections: Object.fromEntries(
         Object.entries(db).map(([key, value]) => [key, value.length]),
      ),
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

const clientRoutes = require("./src/routes/client.routes");
app.use("/api/clients", clientRoutes);

const contractRoutes = require("./src/routes/contract.routes");
app.use("/api/contracts", contractRoutes);

const activityRoutes = require("./src/routes/activity.routes");
app.use("/api/activities", activityRoutes);

const progressRoutes = require("./src/routes/progress.routes");
app.use("/api/progress", progressRoutes);

const interimPaymentRoutes = require("./src/routes/interimPayment.routes");
app.use("/api/interim-payments", interimPaymentRoutes);

const documentRoutes = require("./src/routes/document.routes");
app.use("/api/documents", documentRoutes);

const progressUpdateRoutes = require("./src/routes/progressUpdate.routes");
app.use("/api/progress-updates", progressUpdateRoutes);

const budgetRoutes = require("./src/routes/budget.routes");
app.use("/api/budgets", budgetRoutes);

const warehouseRoutes = require("./src/routes/warehouse.routes");
app.use("/api/warehouses", warehouseRoutes);

const rfqRoutes = require("./src/routes/rfq.routes");
app.use("/api/rfqs", rfqRoutes);

const quotationRoutes = require("./src/routes/quotation.routes");
app.use("/api/quotations", quotationRoutes);

const dailyReportRoutes = require("./src/routes/dailyReport.routes");
app.use("/api/daily-reports", dailyReportRoutes);

const hrRoutes = require("./src/routes/hr.routes");
app.use("/api/hr", hrRoutes);

const accountRoutes = require("./src/routes/account.routes");
app.use("/api/accounts", accountRoutes);

const notificationRoutes = require("./src/routes/notification.routes");
app.use("/api/notifications", notificationRoutes);

const permissionsRoutes = require("./src/routes/permissions.routes");
app.use("/api/permissions", permissionsRoutes);

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
