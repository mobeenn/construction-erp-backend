const MaterialIssue = require("../models/MaterialIssue");

const generateIssueNo = async () => {
   const count = await MaterialIssue.countDocuments();

   return `MI-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateIssueNo;
