const { calculateProfitLoss } = require("../../services/profitLoss.service");

exports.getReport = async (
   req,

   res,
) => {
   try {
      const data = await calculateProfitLoss();

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
