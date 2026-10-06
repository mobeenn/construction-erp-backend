/* Top-up seed: richer per-project detail data (appends only, no rebuild). */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "..", "..", "db.json");
const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

const nid = () => crypto.randomBytes(12).toString("hex");
const now = () => new Date().toISOString();
const isoDay = (offset) => {
   const d = new Date();
   d.setDate(d.getDate() - offset);
   return d.toISOString().slice(0, 10);
};
const idOf = (v) => String(v?._id || v || "");
const before = [];
const countBefore = {};
["dailyReports", "documents", "progressUpdates", "activities", "expenses", "materialRequests", "materialIssues"].forEach((k) => {
   countBefore[k] = db[k].length;
   before.push(k);
});

const users = db.users;
const U = (role) => users.find((u) => u.role === role)._id;
const adminId = U("admin"), supId = U("site_supervisor"), accId = U("accountant"), storeId = U("store_manager");
const projects = db.projects;
const activities = db.activities;
const employees = db.employees;
const inventory = db.inventory;

const actNo = db.activities.length;
const expNo = db.expenses.length;
const reqNo = db.materialRequests.length;
const issNo = db.materialIssues.length;

/* ---------------- Daily reports: 2 more per project ---------------- */
const weathers = ["Sunny", "Cloudy", "Hot", "Windy"];
const trades = [["Mason", 10], ["Labour", 22], ["Steel Fixer", 8], ["Carpenter", 6], ["Electrician", 4]];
projects.forEach((p, pi) => {
   for (let k = 0; k < 2; k++) {
      const off = 1 + ((pi + k) % 6);
      const withIssue = (pi + k) % 3 === 0;
      db.dailyReports.push({
         _id: nid(), project: p._id, site: p.location, reportDate: isoDay(off),
         weather: weathers[(pi + k) % weathers.length],
         workPerformed: k === 0
            ? `Column casting and curing at ${p.name}; shuttering for next lift in progress`
            : `Brick masonry, plaster prep and MEP conduit laying at ${p.name}`,
         manpower: [
            { trade: trades[(pi + k) % trades.length][0], count: trades[(pi + k) % trades.length][1] },
            { trade: trades[(pi + k + 2) % trades.length][0], count: trades[(pi + k + 2) % trades.length][1] },
         ],
         equipment: [{ name: k === 0 ? "Tower Crane" : "Transit Mixer", quantity: k === 0 ? 1 : 2, hours: 8 }],
         activities: [], materialConsumed: [], materialReceived: [],
         safetyIncidents: withIssue && k === 0 ? "Minor first-aid case at casting yard; worker treated on site" : "",
         issues: withIssue && k === 1 ? "RMC delivery delayed by 3 hours due to traffic on main route" : "",
         delays: (pi + k) % 4 === 0 ? "Curing hold extended by half day" : "",
         instructions: k === 0 ? "Maintain 7-day curing log for all pours" : "",
         remarks: withIssue ? "Recovery plan shared with site engineer" : "Work on schedule",
         status: off > 2 ? "approved" : "pending",
         siteSupervisor: supId, reviewedBy: off > 2 ? adminId : null,
         attachments: [], createdAt: now(), updatedAt: now(),
      });
   }
});

/* ---------------- Documents: 2 more per project ---------------- */
const extraDocs = [["Structural Column Layout", "drawing"], ["BOQ Revision 2", "contract"]];
projects.forEach((p, pi) => {
   const contract = db.contracts.find((c) => idOf(c.project) === p._id);
   extraDocs.forEach((d, k) => {
      db.documents.push({
         _id: nid(), project: p._id, contract: contract?._id || null, client: p.client,
         name: `${d[0]} — ${p.name}`, category: d[1],
         entityType: "project", entityId: p._id,
         fileType: "pdf", size: 310000 + pi * 12000 + k * 8000,
         url: "https://example.com/docs/sample.pdf",
         description: `${d[0]} for ${p.name}`,
         uploadedBy: adminId, isActive: true, createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Progress updates: 2 more per project ---------------- */
projects.forEach((p, pi) => {
   const acts = activities.filter((a) => idOf(a.project) === p._id).slice(3, 5);
   acts.forEach((a, k) => {
      const prev = Math.max(0, Number(a.actualPercentage || 0) - 8);
      db.progressUpdates.push({
         _id: nid(), project: p._id, activity: a._id,
         previousProgress: prev, newProgress: Number(a.actualPercentage || 0),
         quantityCompleted: Math.round(Number(a.plannedQuantity || 0) * Number(a.actualPercentage || 0) / 100),
         remarks: k === 0 ? "Client representative inspected and accepted" : "Curing and edge protection in progress",
         status: k === 0 ? "approved" : "pending",
         updatedBy: supId, approvedBy: k === 0 ? adminId : null,
         updateDate: now(), createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Finishing-phase activities for active projects ---------------- */
const finishing = [
   ["Testing & Commissioning", "WBS-6.1", "MEP", "lot"],
   ["Handover & Snag List", "WBS-6.2", "Finishes", "lot"],
];
projects.filter((p) => ["in_progress", "mobilization"].includes(p.status)).forEach((p, pi) => {
   finishing.forEach((f, k) => {
      const idx = actNo + pi * 2 + k + 1;
      db.activities.push({
         _id: nid(), project: p._id, name: f[0], title: f[0],
         activityCode: `ACT-${String(idx + 100).padStart(4, "0")}`,
         wbsCode: f[1], category: f[2],
         plannedStart: "2026-11-20", plannedEnd: "2026-12-15",
         actualStart: null, actualEnd: null,
         plannedQuantity: 1, completedQuantity: 0, unit: f[3],
         plannedPercentage: 0, actualPercentage: 0, progress: 0,
         status: "not_started", weight: 3, phase: "Handover",
         createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Recent expenses: 2 per project ---------------- */
const expCats = [["equipment", "Tower crane hire — weekly charges"], ["transport", "Material haulage and site transport"]];
projects.forEach((p, pi) => {
   expCats.forEach((c, k) => {
      db.expenses.push({
         _id: nid(), expenseNo: `EXP-${String(expNo + pi * 2 + k + 1).padStart(4, "0")}`,
         project: p._id, category: c[0], amount: 85000 + ((pi * 17 + k * 31) % 25) * 10000,
         description: `${c[1]} for ${p.name}`,
         paymentMethod: (pi + k) % 2 ? "bank" : "cash",
         expenseDate: new Date(Date.now() - (k + 1) * 864e5).toISOString(),
         createdBy: accId, createdAt: now(), updatedAt: now(),
      });
   });
});

/* ---------------- Material request + issue per project ---------------- */
const matPool = ["Cement", "Steel Rebar", "Sand", "Bricks"];
projects.forEach((p, pi) => {
   const m = matPool[pi % matPool.length];
   const inv = inventory.find((x) => idOf(x.project) === p._id && x.materialName === m)
      || inventory.find((x) => idOf(x.project) === p._id);
   const rid = nid();
   const n = reqNo + pi + 1;
   db.materialRequests.push({
      _id: rid, requestNo: `MR-${String(n).padStart(4, "0")}`,
      project: p._id, materialName: inv ? inv.materialName : m,
      quantity: 80, unit: inv ? inv.unit : "bags",
      status: "issued", requestedBy: supId, approvedBy: adminId,
      createdAt: now(), updatedAt: now(),
   });
   const team = employees.filter((e) => idOf(e.assignedProject) === p._id);
   const projActs = activities.filter((a) => idOf(a.project) === p._id);
   db.materialIssues.push({
      _id: nid(), issueNo: `MI-${String(issNo + pi + 1).padStart(4, "0")}`,
      request: rid, project: p._id,
      materialName: inv ? inv.materialName : m, quantity: 80, unit: inv ? inv.unit : "bags",
      issuedBy: storeId, employee: team.length ? team[0]._id : employees[0]._id,
      activity: projActs.length ? projActs[0]._id : null,
      createdAt: now(), updatedAt: now(),
   });
});

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
console.log("Top-up OK:");
before.forEach((k) => console.log(` ${k}: ${countBefore[k]} -> ${db[k].length}`));
