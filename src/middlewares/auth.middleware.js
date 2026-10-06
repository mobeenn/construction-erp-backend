const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { getPolicies, enforceRequestPermission } = require("./permission.middleware");

const protect = async (req, res, next) => {
   let decoded;
   try {
      let token;

      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
         token = authHeader.split(" ")[1];
      }

      if (!token) {
         return res.status(401).json({
            success: false,

            message: "Unauthorized",
         });
      }

      decoded = jwt.verify(
         token,
         process.env.JWT_SECRET,
      );
   } catch (error) {
      return res.status(401).json({
         success: false,
         message: "Invalid token",
      });
   }

   try {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      const policies = await getPolicies();
      req.user = {
         ...user,
         permissions: user.role === "admin"
            ? Object.fromEntries(Object.entries(policies.admin).map(([resource, actions]) => [resource, actions]))
            : user.permissions || policies[user.role] || {},
      };
   } catch (error) {
      return next(error);
   }

   return enforceRequestPermission(req, res, next);
};

module.exports = protect;
