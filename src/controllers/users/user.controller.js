const User = require("../../models/User");

const { updateUserSchema } = require("../../validators/user.validation");

// Get All Users

exports.getUsers = async (req, res) => {
   try {
      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const search = req.query.search || "";

      const skip = (page - 1) * limit;

      const query = {
         name: {
            $regex: search,

            $options: "i",
         },
      };

      const users = await User.find(query)

         .select("-password")

         .skip(skip)

         .limit(limit)

         .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.status(200).json({
         success: true,

         total,

         page,

         pages: Math.ceil(total / limit),

         data: users,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Update User

exports.updateUser = async (req, res) => {
   try {
      const data = updateUserSchema.parse(req.body);

      const user = await User.findByIdAndUpdate(
         req.params.id,

         data,

         {
            new: true,
         },
      ).select("-password");

      res.status(200).json({
         success: true,

         data: user,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Delete User

exports.deleteUser = async (req, res) => {
   try {
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
         success: true,

         message: "User deleted",
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// User Stats

exports.userStats = async (req, res) => {
   try {
      const totalUsers = await User.countDocuments();

      const activeUsers = await User.countDocuments({
         isActive: true,
      });

      const inactiveUsers = await User.countDocuments({
         isActive: false,
      });

      res.status(200).json({
         success: true,

         data: {
            totalUsers,

            activeUsers,

            inactiveUsers,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
