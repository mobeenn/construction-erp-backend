const Budget = require("../models/Budget");

const generateBudgetCode = async () => {
   const count = await Budget.countDocuments();
   return `BUD-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateBudgetCode;
