const { getAnalytics } = require("../../services/dashboardAnalytics.service");

exports.analytics = async (req, res) => {
   try {
      const data = await getAnalytics();

      res.status(200).json({
         success: true,
         data,
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};
