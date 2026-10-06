const authorize = (...roles) => {
   return (req, res, next) => {
      const { getPermissionForRequest, hasPermission } = require("./permission.middleware");
      const required = getPermissionForRequest(req);
      if (required) {
         return hasPermission(req.user, required.resource, required.action)
            .then((allowed) => allowed
               ? next()
               : res.status(403).json({ success: false, message: `Permission denied: ${required.action} ${required.resource}` }))
            .catch(next);
      }
      if (!roles.includes(req.user.role)) {
         return res.status(403).json({
            success: false,

            message: "Access denied",
         });
      }

      next();
   };
};

module.exports = authorize;
