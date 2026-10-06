/* Full realistic seed — preserves users + accounting chart, rebuilds operational data. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "..", "..", "db.json");
const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

const nid = () => crypto.randomBytes(12).toString("hex");
const now = () => new Date().toISOString();
const iso = (s) => new Date(s).toISOString();
const pick = (a, i) => a[i % a.length];

const users = db.users;
const accountCategories = db.accountCategories;
const accounts = db.accounts;
const U = (role) => users.find((u) => u.role === role)._id;
const adminId = U("admin"), hrId = U("hr"), accId = U("accountant"),
   storeId = U("store_manager"), purchId = U("purchase_manager"), supId = U("site_supervisor");

/* ---------------- Clients ---------------- */
const clientDefs = [
   ["Green Homes Developers", "Faisal Iqbal", "0300-5551112", "info@greenhomes.pk", "DHA Phase 5, Lahore"],
   ["Skyline Builders Ltd", "Ayesha Raza", "0321-4448899", "contact@skyline.pk", "Gulberg Greens, Islamabad"],
   ["River View Housing", "Bilal Ahmed", "0333-2224455", "info@riverview.pk", "Model Town, Multan"],
   ["Metro Commercial Group", " kamran Shah", "0301-7779900", "projects@metrocommercial.pk", "Blue Area, Islamabad"],
   ["Pearl City Developers", "Sana Malik", "0345-8881122", "info@pearlcity.pk", "Bahria Town, Karachi"],
   ["Heritage Estates", "Usman Tariq", "0302-6663344", "hello@heritageestates.pk", "Cantt, Rawalpindi"],
];
const clients = clientDefs.map((c, i) => ({
   _id: nid(), clientCode: `CLI-${String(i + 1).padStart(4, "0")}`,
   name: c[0].trim(), contactPerson: c[1].trim(), phone: c[2], email: c[3],
   address: c[4], taxNo: `NTN-1000${i + 21}`, taxInformation: `NTN-1000${i + 21}`,
   paymentTerms: i % 2 ? "30 days" : "15 days", status: "active",
   notes: i === 0 ? "Key account client" : "Returning developer client",
   createdAt: now(), updatedAt: now(),
}));

/* ---------------- Vendors ---------------- */
const vendorDefs = [
   ["ABC Cement Suppliers", "Imran Butt", "042-1112223", "sales@abccement.com", "Lahore"],
   ["Steel House Gujranwala", "Nadeem Akhtar", "055-4445566", "info@steelhousegrw.pk", "G.T. Road, Gujranwala"],
   ["Lucky Bricks Co.", "Rashid Minhas", "0300-1238877", "orders@luckybricks.pk", "Kasur Road, Lahore"],
   ["Power Cables & Electric", "Danish Ali", "021-3455667", "sales@powerelec.pk", "Saddar, Karachi"],
   ["Modern Paints Depot", "Shahid Mehmood", "042-3577889", "info@modernpaints.pk", "Ichhra, Lahore"],
   ["Heavy Machinery Rentals", "Tariq Javed", "0301-9992211", "rent@heavymachinery.pk", "Rawat, Rawalpindi"],
   ["Sand & Crush Quarry", "Ghulam Abbas", "0344-5566778", "orders@sandcrush.pk", "Margalla Hills, Taxila"],
   ["Timber & Plywood Mart", "Farooq Sheikh", "042-3722114", "info@timbermart.pk", "Shah Alam Market, Lahore"],
   ["Al-Noor Sanitary Store", "Hafiz Saeed", "0302-4455667", "sales@alnoorsanitary.pk", "College Road, Rawalpindi"],
   ["City Concrete RMC", "Adnan Khalid", "051-8733445", "dispatch@cityrmc.pk", "I-9 Industrial Area, Islamabad"],
];
const vendors = vendorDefs.map((v, i) => ({
   _id: nid(), vendorCode: `VND-${String(i + 1).padStart(4, "0")}`,
   companyName: v[0], contactPerson: v[1], phone: v[2], email: v[3], address: v[4],
   status: "active", createdAt: now(), updatedAt: now(),
}));

/* ---------------- Departments / Designations ---------------- */
const deptDefs = [["Civil", "CIVIL"], ["Electrical", "ELEC"], ["Mechanical", "MECH"], ["Procurement", "PROC"], ["Finance", "FIN"], ["HR & Admin", "HRAD"]];
const departments = deptDefs.map((d) => ({ _id: nid(), name: d[0], code: d[1], description: `${d[0]} department`, head: adminId, status: "active", createdAt: now(), updatedAt: now() }));
const desigDefs = [
   ["Project Manager", "PM", 0], ["Site Engineer", "SE", 0], ["Civil Engineer", "CE", 0],
   ["Quantity Surveyor", "QS", 0], ["Store Keeper", "SK", 3], ["Accountant", "ACC", 4],
   ["HR Officer", "HRO", 5], ["Foreman", "FRM", 0], ["Mason", "MSN", 0], ["Electrician", "ELC", 1],
];
const designations = desigDefs.map((d) => ({ _id: nid(), title: d[0], code: d[1], department: departments[d[2]]._id, level: "L2", description: `${d[0]} role`, status: "active", createdAt: now(), updatedAt: now() }));

/* ---------------- Projects + Contracts + Warehouses ---------------- */
const projectDefs = [
   ["Green Valley Apartments", "DHA Phase 5, Lahore", 48000000, 50000000, "in_progress", 55, "2026-08-01", "2027-08-01"],
   ["Skyline Commercial Plaza", "Gulberg Greens, Islamabad", 95000000, 90000000, "in_progress", 38, "2026-06-15", "2027-12-31"],
   ["River View Villas", "Model Town, Multan", 32000000, 30000000, "in_progress", 62, "2026-04-01", "2027-03-31"],
   ["Metro Trade Center", "Blue Area, Islamabad", 150000000, 142000000, "mobilization", 8, "2026-11-01", "2028-05-31"],
   ["Pearl City Block C", "Bahria Town, Karachi", 67000000, 64000000, "in_progress", 44, "2026-07-10", "2027-10-30"],
   ["Heritage Renovation Wing", "Cantt, Rawalpindi", 18000000, 17000000, "on_hold", 25, "2026-05-01", "2027-01-31"],
   ["Lakefront Farmhouses", "Bedian Road, Lahore", 41000000, 39000000, "planning", 3, "2026-12-01", "2027-11-30"],
   ["City Hospital Extension", "Gulberg, Lahore", 88000000, 84000000, "awarded", 0, "2026-11-15", "2028-02-28"],
];
const projects = [], contracts = [], warehouses = [];
projectDefs.forEach((p, i) => {
   const pid = nid(), cid = nid(), wid = nid();
   const client = clients[i % clients.length];
   projects.push({
      _id: pid, projectCode: `PRJ-${String(i + 1).padStart(4, "0")}`, name: p[0], location: p[1],
      description: `${p[0]} — turnkey construction including structure, finishes and MEP.`,
      budget: p[3], startDate: p[6], endDate: p[7], actualEndDate: null,
      supervisor: supId, projectManager: adminId, siteSupervisor: supId,
      client: client._id, contract: cid, engineers: [], employees: [], contractors: [],
      status: p[4], progress: p[5], contractValue: p[2], receivedAmount: Math.round(p[2] * p[5] / 100 * 0.6),
      priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
      createdAt: now(), updatedAt: now(),
   });
   contracts.push({
      _id: cid, contractNo: `CTR-${String(i + 1).padStart(4, "0")}`, type: "client",
      client: client._id, project: pid, vendor: null, title: `${p[0]} — Primary Contract`,
      value: p[2], retentionPercent: 5, advancePercentage: i % 2 ? 10 : 0,
      paymentTerms: "Monthly interim bills", tax: 0, approvedVariations: i * 150000,
      startDate: p[6], endDate: p[7], status: p[4] === "planning" || p[4] === "awarded" ? "approved" : "active",
      terms: "Standard FIDIC terms", documents: [], notes: "", createdAt: now(), updatedAt: now(),
   });
   warehouses.push({
      _id: wid, name: `${p[0]} Store`, code: `WH-${String(i + 1).padStart(3, "0")}`,
      location: p[1], project: pid, manager: storeId, status: "active", createdAt: now(), updatedAt: now(),
   });
});

/* ---------------- Employees (30) ---------------- */
const first = ["Ahmed", "Bilal", "Usman", "Ali", "Hassan", "Imran", "Kamran", "Farhan", "Nadeem", "Rashid", "Sana", "Ayesha", "Fatima", "Hira", "Mahnoor", "Danish", "Adnan", "Tariq", "Shahid", "Faisal"];
const last = ["Khan", "Ahmed", "Malik", "Butt", "Sheikh", "Raza", "Iqbal", "Hussain", "Ali", "Mahmood"];
const desigPool = ["Civil Engineer", "Site Engineer", "Mason", "Foreman", "Electrician", "Quantity Surveyor", "Store Keeper", "Accountant", "HR Officer", "Labour"];
const employees = first.map((f, i) => {
   const l = pick(last, i * 3 + 1);
   return {
      _id: nid(), employeeId: `EMP-${String(i + 1).padStart(4, "0")}`, name: `${f} ${l}`,
      cnic: `35201-${String(1000000 + i * 137331).slice(0, 7)}-${i % 10}`,
      phone: `0300${String(1000000 + i * 7919).slice(0, 7)}`,
      email: `${f.toLowerCase()}.${l.toLowerCase()}${i}@example.com`,
      designation: desigPool[i % desigPool.length],
      designationId: designations[i % designations.length]._id,
      department: departments[i % departments.length]._id,
      salary: 45000 + (i % 8) * 15000,
      assignedSite: projects[i % projects.length].location,
      assignedProject: projects[i % projects.length]._id,
      projectAssignments: [projects[i % projects.length]._id],
      employeeType: i % 5 === 4 ? "daily_wage" : "permanent",
      status: i === 27 ? "on_leave" : "active", joiningDate: iso(`2025-${String((i % 12) + 1).padStart(2, "0")}-15`),
      bankName: "HBL", bankAccount: `PK36HABB0001234567${String(100 + i)}`,
      emergencyContact: `0301${String(2000000 + i * 9119).slice(0, 7)}`,
      leaveBalance: 12 - (i % 4), performanceNotes: [],
      createdAt: now(), updatedAt: now(),
   };
});

/* ---------------- Attendance (last 10 days) ---------------- */
const attendance = [];
for (let d = 9; d >= 0; d--) {
   const dt = new Date(); dt.setDate(dt.getDate() - d);
   const ds = dt.toISOString().slice(0, 10);
   employees.forEach((e, i) => {
      if ((i + d) % 17 === 0) return; // off day
      attendance.push({
         _id: nid(), employee: e._id, date: ds,
         status: (i + d) % 13 === 0 ? "absent" : (i + d) % 11 === 0 ? "half_day" : "present",
         overtimeHours: (i + d) % 4 === 0 ? 2 : 0,
         markedBy: hrId, project: e.assignedProject, createdAt: now(), updatedAt: now(),
      });
   });
}

/* ---------------- Activities (7 per project) ---------------- */
const actDefs = [
   ["Excavation", "WBS-1.1", "Earthwork", "cft"], ["Foundation Concrete", "WBS-1.2", "Structural", "m3"],
   ["Column Casting", "WBS-2.1", "Structural", "m3"], ["Brick Masonry", "WBS-2.2", "Masonry", "cft"],
   ["Plaster Work", "WBS-3.1", "Finishes", "sft"], ["Electrical Wiring", "WBS-4.1", "MEP", "points"],
   ["Paint & Finishes", "WBS-5.1", "Finishes", "sft"],
];
const activities = [];
projects.forEach((p, pi) => {
   actDefs.forEach((a, ai) => {
      const pct = Math.min(100, Math.max(0, p.progress + (ai - 3) * 12));
      activities.push({
         _id: nid(), project: p._id, name: a[0], title: a[0],
         activityCode: `ACT-${String(pi * 10 + ai + 1).padStart(4, "0")}`,
         wbsCode: a[1], category: a[2],
         plannedStart: "2026-09-01", plannedEnd: "2026-11-15",
         actualStart: "2026-09-01", actualEnd: pct === 100 ? "2026-11-10" : null,
         plannedQuantity: 100 + ai * 25, completedQuantity: Math.round((100 + ai * 25) * pct / 100),
         unit: a[3], plannedPercentage: Math.min(100, pct + 8), actualPercentage: pct, progress: pct,
         status: pct >= 100 ? "completed" : pct >= 60 ? "in_progress" : pct > 0 ? "in_progress" : "not_started",
         weight: ai + 1, phase: ai < 2 ? "Structure" : ai < 5 ? "Finishes" : "MEP",
         createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Budgets (1 active per project) ---------------- */
const budgets = projects.map((p, i) => ({
   _id: nid(), project: p._id, budgetCode: `BUD-${String(i + 1).padStart(4, "0")}`,
   version: 1, status: "active", totalBudget: p.budget,
   approvedBy: adminId, approvedDate: now(),
   lines: [
      { category: "labour", description: "Masons and labourers", quantity: 500, unit: "days", rate: 2200, amount: 1100000 },
      { category: "materials", description: "Cement, steel, bricks", quantity: 1, unit: "lot", rate: Math.round(p.budget * 0.45), amount: Math.round(p.budget * 0.45) },
      { category: "equipment", description: "Crane + transit mixer rental", quantity: 6, unit: "months", rate: 350000, amount: 2100000 },
      { category: "subcontractors", description: "Electrical & plumbing subs", quantity: 1, unit: "lot", rate: Math.round(p.budget * 0.12), amount: Math.round(p.budget * 0.12) },
      { category: "transportation", description: "Material haulage", quantity: 1, unit: "lot", rate: 800000, amount: 800000 },
      { category: "site_overhead", description: "Site office & utilities", quantity: 1, unit: "lot", rate: 600000, amount: 600000 },
   ],
   createdAt: now(), updatedAt: now(),
}));

/* ---------------- Progress updates + reports ---------------- */
const progressUpdates = [];
projects.forEach((p) => {
   const acts = activities.filter((a) => a.project === p._id).slice(0, 3);
   acts.forEach((a, k) => {
      progressUpdates.push({
         _id: nid(), project: p._id, activity: a._id,
         previousProgress: Math.max(0, a.actualPercentage - 10), newProgress: a.actualPercentage,
         quantityCompleted: Math.round(a.plannedQuantity * a.actualPercentage / 100),
         remarks: k === 0 ? "Work progressing as planned" : "Quality check passed",
         status: k === 2 ? "pending" : "approved",
         updatedBy: supId, approvedBy: k === 2 ? null : adminId,
         updateDate: now(), createdAt: now(), updatedAt: now(),
      });
   });
});
const progressReports = projects.slice(0, 4).map((p, i) => ({
   _id: nid(), project: p._id, title: `Weekly progress week ${i + 32}`,
   progress: p.progress, remarks: "On track", reportedBy: supId, reportDate: now(), createdAt: now(), updatedAt: now(),
}));

/* ---------------- Materials / inventory (8 per project) ---------------- */
const matDefs = [
   ["Cement", "Construction", "bags", 1400], ["Steel Rebar", "Steel", "kg", 265],
   ["Bricks", "Masonry", "nos", 18], ["Sand", "Aggregates", "cft", 95],
   ["Crush", "Aggregates", "cft", 130], ["Paint", "Finishes", "ltr", 1850],
   ["PVC Pipes", "MEP", "len", 2400], ["Tiles", "Finishes", "sft", 320],
];
const inventory = [], inventoryTransactions = [];
projects.forEach((p, pi) => {
   matDefs.forEach((m, mi) => {
      const iid = nid();
      const stock = 200 + ((pi * 37 + mi * 53) % 600);
      inventory.push({
         _id: iid, project: p._id, materialName: m[0], category: m[1], unit: m[2],
         unitPrice: m[3], currentStock: stock, minimumStock: 100, reorderLevel: 100,
         openingQuantity: 350, receivedQuantity: stock, issuedQuantity: 40 + mi * 5, transferredQuantity: 0,
         warehouse: warehouses[pi]._id, createdAt: now(), updatedAt: now(),
      });
      inventoryTransactions.push({
         _id: nid(), inventory: iid, project: p._id, warehouse: warehouses[pi]._id,
         type: "in", quantity: stock, remarks: "Opening + GRN receipts", createdBy: storeId, createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Material requests / issues ---------------- */
const materialRequests = [], materialIssues = [];
projects.forEach((p, pi) => {
   for (let k = 0; k < 3; k++) {
      const rid = nid();
      const m = matDefs[(pi + k) % matDefs.length];
      materialRequests.push({
         _id: rid, requestNo: `MR-${String(pi * 3 + k + 1).padStart(4, "0")}`,
         project: p._id, materialName: m[0], quantity: 50 + k * 25, unit: m[2],
         status: k === 0 ? "approved" : k === 1 ? "pending" : "issued",
         requestedBy: supId, approvedBy: k === 0 || k === 2 ? adminId : null,
         createdAt: now(), updatedAt: now(),
      });
      if (k !== 1) {
         materialIssues.push({
            _id: nid(), issueNo: `MI-${String(pi * 3 + k + 1).padStart(4, "0")}`,
            request: rid, project: p._id, materialName: m[0], quantity: 50 + k * 25, unit: m[2],
            issuedBy: storeId, employee: employees[(pi * 3 + k) % employees.length]._id,
            activity: activities.find((a) => a.project === p._id)._id,
            createdAt: now(), updatedAt: now(),
         });
      }
   }
});

/* ---------------- RFQs + quotations + POs + GRNs ---------------- */
const rfqs = [], vendorQuotations = [], purchaseOrders = [], grns = [];
projects.forEach((p, pi) => {
   for (let k = 0; k < 2; k++) {
      const rfqid = nid();
      const m1 = matDefs[(pi + k) % matDefs.length], m2 = matDefs[(pi + k + 2) % matDefs.length];
      rfqs.push({
         _id: rfqid, rfqNo: `RFQ-${String(pi * 2 + k + 1).padStart(4, "0")}`,
         project: p._id, status: k === 0 ? "awarded" : "open", createdBy: purchId,
         items: [
            { materialName: m1[0], quantity: 200, unit: m1[2] },
            { materialName: m2[0], quantity: 100, unit: m2[2] },
         ],
         createdAt: now(), updatedAt: now(),
      });
      const v1 = vendors[(pi + k) % vendors.length], v2 = vendors[(pi + k + 1) % vendors.length];
      [v1, v2].forEach((v, vi) => {
         vendorQuotations.push({
            _id: nid(), quotationNo: `Q-${String(pi * 4 + k * 2 + vi + 1).padStart(4, "0")}`,
            rfq: rfqid, vendor: v._id, project: p._id,
            status: vi === 0 && k === 0 ? "selected" : "received",
            items: [
               { materialName: m1[0], quantity: 200, unitPrice: m1[3] + vi * 20, total: 200 * (m1[3] + vi * 20) },
               { materialName: m2[0], quantity: 100, unitPrice: m2[3] + vi * 15, total: 100 * (m2[3] + vi * 15) },
            ],
            grandTotal: 200 * (m1[3] + vi * 20) + 100 * (m2[3] + vi * 15),
            createdAt: now(), updatedAt: now(),
         });
      });
      // PO for first RFQ item set
      const items = [
         { materialName: m1[0], quantity: 200, unitPrice: m1[3], total: 200 * m1[3], receivedQty: k === 0 ? 200 : 0 },
         { materialName: m2[0], quantity: 100, unitPrice: m2[3], total: 100 * m2[3], receivedQty: k === 0 ? 100 : 0 },
      ];
      const gt = items.reduce((s, x) => s + x.total, 0);
      const poid = nid();
      purchaseOrders.push({
         _id: poid, poNumber: `PO-${String(pi * 2 + k + 1).padStart(4, "0")}`,
         vendor: v1._id, project: p._id, createdBy: purchId, requestedBy: supId,
         approvedBy: k === 0 ? adminId : null,
         items, grandTotal: gt, status: k === 0 ? "delivered" : "approved",
         site: p.location, budgetCategory: "materials", deliveryLocation: p.location,
         expectedDelivery: "2026-11-20", paymentTerms: "30 days",
         createdAt: now(), updatedAt: now(),
      });
      if (k === 0) {
         grns.push({
            _id: nid(), grnNo: `GRN-${String(pi * 2 + k + 1).padStart(4, "0")}`,
            purchaseOrder: poid, vendor: v1._id, project: p._id, receivedBy: storeId,
            items: items.map((x) => ({ materialName: x.materialName, quantity: x.quantity, orderedQty: x.quantity, receivedQty: x.quantity })),
            remarks: "Received in good condition", createdAt: now(), updatedAt: now(),
         });
      }
   }
});

/* ---------------- Expenses (5 per project) ---------------- */
const expCats = ["labour", "fuel", "equipment", "transport", "other"];
const expenses = [];
projects.forEach((p, pi) => {
   expCats.forEach((c, k) => {
      expenses.push({
         _id: nid(), expenseNo: `EXP-${String(pi * 5 + k + 1).padStart(4, "0")}`,
         project: p._id, category: c, amount: 60000 + ((pi * 13 + k * 29) % 40) * 10000,
         description: `${c} cost for ${p.name} — week ${k + 1}`,
         paymentMethod: k % 3 === 0 ? "cash" : k % 3 === 1 ? "bank" : "cheque",
         expenseDate: new Date(Date.now() - (k * 4 + pi) * 864e5).toISOString(),
         createdBy: accId, createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Interim + customer/vendor payments ---------------- */
const interimPayments = [], customerPayments = [], vendorPayments = [];
projects.forEach((p, pi) => {
   for (let k = 0; k < 3; k++) {
      const gross = Math.round(p.contractValue * (0.1 + k * 0.05));
      const ret = Math.round(gross * 0.05), net = gross - ret - 50000;
      const ipid = nid();
      interimPayments.push({
         _id: ipid, paymentNo: `IB-${String(pi * 3 + k + 1).padStart(4, "0")}`,
         project: p._id, contract: contracts[pi]._id, client: p.client,
         periodFrom: `2026-0${7 + k}-01`, periodTo: `2026-0${7 + k}-28`,
         currentGrossAmount: gross, grossAmount: gross, workCompletedAmount: gross,
         previousCertifiedAmount: k * Math.round(p.contractValue * 0.1),
         advanceRecovery: 50000, retention: ret, tax: 0, otherDeductions: 0,
         netAmount: net, approvedAmount: net, paidAmount: k === 0 ? net : k === 1 ? Math.round(net / 2) : 0,
         status: k === 0 ? "paid" : k === 1 ? "partially_paid" : "submitted",
         description: `Running bill ${k + 1} for ${p.name}`, createdAt: now(), updatedAt: now(),
      });
      if (k < 2) {
         customerPayments.push({
            _id: nid(), receiptNo: `CR-${String(pi * 2 + k + 1).padStart(4, "0")}`,
            date: now(), reference: `CR-${pi * 2 + k + 1}`, client: p.client, project: p._id,
            contract: contracts[pi]._id, interimPayment: ipid,
            amount: k === 0 ? net : Math.round(net / 2), paymentMethod: "bank",
            account: accounts.find((a) => a.code === "1002")._id,
            status: "completed", description: `Client payment against IB-${pi * 3 + k + 1}`,
            createdBy: accId, createdAt: now(), updatedAt: now(),
         });
      }
   }
   const po = purchaseOrders.find((x) => x.project === p._id);
   if (po) {
      vendorPayments.push({
         _id: nid(), paymentNo: `VP-${String(pi + 1).padStart(4, "0")}`,
         date: now(), reference: `VP-${pi + 1}`, vendor: po.vendor, project: p._id,
         purchaseOrder: po._id, amount: Math.round(po.grandTotal * 0.7), paymentMethod: "bank",
         account: accounts.find((a) => a.code === "1002")._id,
         status: "completed", description: `Part payment to vendor for ${po.poNumber}`,
         createdBy: accId, createdAt: now(), updatedAt: now(),
      });
   }
});

/* ---------------- Documents (3 per project) ---------------- */
const documents = [];
projects.forEach((p, pi) => {
   [["Foundation Drawing", "drawing"], ["Soil Test Report", "report"], ["Contract Copy", "contract"]].forEach((d, k) => {
      documents.push({
         _id: nid(), project: p._id, contract: contracts[pi]._id, client: p.client,
         name: `${d[0]} — ${p.name}`, category: d[1],
         entityType: "project", entityId: p._id,
         fileType: "pdf", size: 245000 + k * 10000,
         url: "https://example.com/docs/sample.pdf",
         description: `${d[0]} for ${p.name}`, uploadedBy: adminId, isActive: true,
         createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Stock transfers / adjustments / returns ---------------- */
const stockTransfers = projects.slice(0, 3).map((p, i) => ({
   _id: nid(), transferNo: `ST-${String(i + 1).padStart(4, "0")}`,
   fromWarehouse: warehouses[i]._id, toWarehouse: warehouses[(i + 1) % warehouses.length]._id,
   inventory: inventory.find((x) => x.project === p._id)._id, project: p._id,
   quantity: 50, status: "completed", createdBy: storeId, createdAt: now(), updatedAt: now(),
}));
const stockAdjustments = projects.slice(0, 3).map((p, i) => ({
   _id: nid(), adjustmentNo: `ADJ-${String(i + 1).padStart(4, "0")}`,
   inventory: inventory.find((x) => x.project === p._id)._id, project: p._id,
   quantity: 10, type: "addition", reason: "Physical count correction",
   status: "approved", createdBy: storeId, approvedBy: adminId, createdAt: now(), updatedAt: now(),
}));
const materialReturns = projects.slice(0, 2).map((p, i) => ({
   _id: nid(), returnNo: `MRET-${String(i + 1).padStart(4, "0")}`,
   inventory: inventory.find((x) => x.project === p._id)._id, project: p._id,
   quantity: 15, reason: "Excess material returned to store", createdBy: storeId, createdAt: now(), updatedAt: now(),
}));

/* ---------------- Daily reports ---------------- */
const dailyReports = projects.slice(0, 4).map((p, i) => ({
   _id: nid(), project: p._id, site: p.location, reportDate: new Date(Date.now() - i * 864e5).toISOString().slice(0, 10),
   weather: "Sunny", workPerformed: `Concrete pouring and masonry at ${p.name}`,
   manpower: [{ trade: "Mason", count: 12 }, { trade: "Labour", count: 25 }],
   equipment: [{ name: "Transit Mixer", quantity: 2, hours: 8 }],
   activities: [], materialConsumed: [], materialReceived: [],
   safetyIncidents: "", issues: "", delays: "", instructions: "", remarks: "Work on schedule",
   status: i === 0 ? "pending" : "approved",
   siteSupervisor: supId, reviewedBy: i === 0 ? null : adminId,
   attachments: [], createdAt: now(), updatedAt: now(),
}));

/* ---------------- HR: leaves / salary / payroll ---------------- */
const leaveTypes = ["annual", "sick", "casual"];
const leaveRequests = employees.slice(0, 10).map((e, i) => ({
   _id: nid(), employee: e._id, project: e.assignedProject,
   type: leaveTypes[i % 3], startDate: `2026-10-${String(10 + i).padStart(2, "0")}`,
   endDate: `2026-10-${String(11 + i).padStart(2, "0")}`, days: 2,
   reason: `Personal work day ${i + 1} — family commitment`,
   status: i % 3 === 0 ? "pending_manager" : i % 3 === 1 ? "pending_hr" : "approved",
   managerReviewedBy: i % 3 === 0 ? null : supId, hrReviewedBy: i % 3 === 2 ? hrId : null,
   createdAt: now(), updatedAt: now(),
}));
const salaryStructures = employees.slice(0, 15).map((e) => ({
   _id: nid(), employee: e._id, basicSalary: e.salary, overtimeRate: 500,
   currency: "PKR", payFrequency: "monthly", effectiveFrom: "2026-01-01",
   allowances: [{ name: "Transport", amount: 8000, type: "fixed" }],
   deductions: [{ name: "Tax", amount: 2000, type: "fixed" }],
   status: "active", createdBy: hrId, createdAt: now(), updatedAt: now(),
}));
const payrollPeriodId = nid();
const payrollPeriods = [{
   _id: payrollPeriodId, name: "October 2026 payroll",
   startDate: "2026-10-01", endDate: "2026-10-31", payDate: "2026-11-05",
   status: "draft", locked: false, employeeCount: salaryStructures.length,
   totals: { basicSalary: 900000, allowances: 120000, overtime: 45000, deductions: 30000, netSalary: 1035000 },
   createdBy: hrId, approvedBy: null, createdAt: now(), updatedAt: now(),
}];
const payrollEntries = salaryStructures.map((s) => {
   const emp = employees.find((e) => e._id === s.employee);
   return {
      _id: nid(), period: payrollPeriodId, employee: s.employee, salaryStructure: s._id,
      basicSalary: s.basicSalary, allowances: s.allowances, deductions: s.deductions,
      allowancesTotal: 8000, deductionsTotal: 2000, overtimeHours: 4, overtimeRate: 500, overtimePay: 2000,
      netSalary: s.basicSalary + 8000 - 2000 + 2000, currency: "PKR", status: "draft",
      attendanceDays: 26, createdAt: now(), updatedAt: now(),
   };
});

/* ---------------- Finance: journals / cash / bank ---------------- */
const cashAccounts = [
   { _id: nid(), name: "Head Office Till", code: "CASH-001", balance: 450000, openingBalance: 450000, description: "Petty cash", project: null, createdBy: accId, isActive: true, createdAt: now(), updatedAt: now() },
   { _id: nid(), name: "Site Petty Cash", code: "CASH-002", balance: 180000, openingBalance: 200000, description: "Site expenses", project: projects[0]._id, createdBy: accId, isActive: true, createdAt: now(), updatedAt: now() },
];
const bankAccounts = [
   { _id: nid(), name: "HBL Current", code: "BANK-001", bankName: "HBL", accountNumber: "00123456789012", branch: "DHA Lahore", balance: 12500000, openingBalance: 10000000, description: "Primary account", project: null, createdBy: accId, isActive: true, createdAt: now(), updatedAt: now() },
   { _id: nid(), name: "Meezan Project Account", code: "BANK-002", bankName: "Meezan", accountNumber: "02018765432109", branch: "Gulberg Islamabad", balance: 8300000, openingBalance: 8000000, description: "Project collections", project: projects[1]._id, createdBy: accId, isActive: true, createdAt: now(), updatedAt: now() },
];
const cashAcc = accounts.find((a) => a.code === "1001")._id;
const bankAcc = accounts.find((a) => a.code === "1002")._id;
const revAcc = accounts.find((a) => a.code === "4001")._id;
const expAcc = accounts.find((a) => a.code === "5001")._id;
const journalEntries = [], journalEntryLines = [];
projects.slice(0, 4).forEach((p, i) => {
   const jid = nid();
   const amt = 500000 + i * 250000;
   journalEntries.push({
      _id: jid, date: new Date(Date.now() - i * 5 * 864e5).toISOString(),
      reference: `JV-2026-${String(i + 1).padStart(4, "0")}`,
      description: `Project cost booking — ${p.name}`,
      project: p._id, contract: contracts[i]._id, createdBy: accId,
      totalDebit: amt, totalCredit: amt, status: "posted", createdAt: now(), updatedAt: now(),
   });
   journalEntryLines.push(
      { _id: nid(), journalEntry: jid, account: expAcc, project: p._id, debit: amt, credit: 0, description: "Cost", createdAt: now(), updatedAt: now() },
      { _id: nid(), journalEntry: jid, account: cashAcc, project: p._id, debit: 0, credit: amt, description: "Cash out", createdAt: now(), updatedAt: now() },
   );
});

/* ---------------- Notifications ---------------- */
const notifications = [
   { _id: nid(), user: storeId, title: "Low stock alert", message: "Cement below reorder level at Green Valley store", type: "warning", isRead: false, project: projects[0]._id, inventory: inventory[0]._id, createdBy: adminId, createdAt: now(), updatedAt: now() },
   { _id: nid(), user: purchId, title: "PO approval needed", message: "2 purchase orders awaiting approval", type: "info", isRead: false, project: projects[1]._id, createdBy: supId, createdAt: now(), updatedAt: now() },
   { _id: nid(), user: hrId, title: "Leave requests", message: "4 leave requests pending review", type: "info", isRead: false, leaveRequest: leaveRequests[0]._id, createdBy: supId, createdAt: now(), updatedAt: now() },
   { _id: nid(), user: accId, title: "Bills certified", message: "3 interim bills ready for payment", type: "success", isRead: false, project: projects[0]._id, interimPayment: interimPayments[0]._id, createdBy: adminId, createdAt: now(), updatedAt: now() },
   { _id: nid(), user: adminId, title: "Daily report submitted", message: "Site supervisor submitted daily report", type: "info", isRead: false, project: projects[0]._id, dailyReport: dailyReports[0]._id, createdBy: supId, createdAt: now(), updatedAt: now() },
];

/* ---------------- Write ---------------- */
Object.assign(db, {
   clients, vendors, departments, designations, projects, contracts, warehouses,
   employees, attendance, activities, budgets, progressUpdates, progressReports,
   inventory, inventoryTransactions, materialRequests, materialIssues, materialReturns,
   stockTransfers, stockAdjustments, rfqs, vendorQuotations, purchaseOrders, grns,
   expenses, interimPayments, customerPayments, vendorPayments, documents,
   dailyReports, leaveRequests, salaryStructures, payrollPeriods, payrollEntries,
   cashAccounts, bankAccounts, journalEntries, journalEntryLines, notifications,
   permissionPolicies: db.permissionPolicies || [],
});
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
const counts = Object.fromEntries(Object.entries(db).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));
console.log("Seeded OK:", JSON.stringify(counts, null, 2));
