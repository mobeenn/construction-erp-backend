const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
   getMyNotifications,
   getUnreadCount,
   markAsRead,
   markAllAsRead,
   delete: deleteNotification,
} = require("../controllers/notifications/notification.controller");

router.get("/", protect, getMyNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/:id/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
