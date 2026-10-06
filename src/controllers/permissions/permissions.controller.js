const { z } = require("zod");
const PermissionPolicy = require("../../models/PermissionPolicy");
const { ROLES, ACTIONS, RESOURCES, DEFAULT_POLICIES, normalizePolicies } = require("../../config/permissions");
const { getPolicies } = require("../../middlewares/permission.middleware");

const policySchema = z.record(
   z.string(),
   z.record(z.string(), z.array(z.enum(ACTIONS))),
);

exports.getPolicies = async (req, res) => {
   try {
      res.status(200).json({
         success: true,
         data: { roles: ROLES, resources: RESOURCES, actions: ACTIONS, policies: await getPolicies() },
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.updatePolicies = async (req, res) => {
   try {
      const parsed = policySchema.parse(req.body.policies);
      const policies = normalizePolicies(parsed);
      const current = await PermissionPolicy.findOne({ key: "role-policies" });
      if (current) {
         current.policies = policies;
         current.updatedBy = req.user._id;
         current.updatedAt = new Date().toISOString();
         await current.save();
      } else {
         await PermissionPolicy.create({ key: "role-policies", policies, updatedBy: req.user._id });
      }
      res.status(200).json({ success: true, data: { roles: ROLES, resources: RESOURCES, actions: ACTIONS, policies } });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};
