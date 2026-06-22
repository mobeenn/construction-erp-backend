const User = require("../../models/User");

const bcrypt = require("bcryptjs");

const generateToken = require("../../utils/generateToken");

const {
   registerSchema,
   loginSchema,
} = require("../../validators/auth.validation");

const { updateUserSchema } = require("../../validators/user.validation");

// Register

exports.register = async (req, res) => {
   try {
      const data = registerSchema.parse(req.body);

      const existingUser = await User.findOne({
         email: data.email,
      });

      if (existingUser) {
         return res.status(400).json({
            success: false,

            message: "Email already exists",
         });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await User.create({
         ...data,

         password: hashedPassword,
      });

      res.status(201).json({
         success: true,

         message: "User created",

         data: user,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
// Login
exports.login = async (req, res) => {
   try {
      const data = loginSchema.parse(req.body);

      const user = await User.findOne({
         email: data.email,
      });

      if (!user) {
         return res.status(404).json({
            success: false,

            message: "User not found",
         });
      }

      const isMatch = await bcrypt.compare(
         data.password,

         user.password,
      );

      if (!isMatch) {
         return res.status(401).json({
            success: false,

            message: "Invalid credentials",
         });
      }

      const token = generateToken(user._id);

      res.status(200).json({
         success: true,

         token,

         user: {
            id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
exports.me = async (req, res) => {
   try {
      res.status(200).json({
         success: true,

         user: req.user,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
exports.createUser = async (req, res) => {
   try {
      const data = registerSchema.parse(req.body);

      const existingUser = await User.findOne({
         email: data.email,
      });

      if (existingUser) {
         return res.status(400).json({
            success: false,

            message: "Email already exists",
         });
      }

      const hashedPassword = await bcrypt.hash(
         data.password,

         10,
      );

      const user = await User.create({
         ...data,

         password: hashedPassword,
      });

      res.status(201).json({
         success: true,

         message: "User created",

         data: user,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
