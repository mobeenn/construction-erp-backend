const { getProgressDashboard } = require("../../services/progressDashboard.service");

exports.dashboard = async (req, res) => {
   try {
      const data = await getProgressDashboard(req.params.id);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
