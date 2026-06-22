const { getDashboard } = require("../../services/dashboard.service");

exports.dashboard = async (
   req,

   res,
) => {
   try {
      const data = await getDashboard();

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
