const {
   getUserNotifications,
   getUnreadCount,
   markAsRead,
   markAllAsRead,
   deleteNotification,
} = require("../../services/notification.service");

/**
 * Get notifications for the current user
 */
exports.getMyNotifications = async (req, res) => {
   try {
      const { unreadOnly, limit } = req.query;
      const notifications = await getUserNotifications(req.user._id, {
         unreadOnly: unreadOnly === "true",
         limit: limit ? parseInt(limit) : 50,
      });
      res.status(200).json({ success: true, data: notifications });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Get unread notification count for the current user
 */
exports.getUnreadCount = async (req, res) => {
   try {
      const count = await getUnreadCount(req.user._id);
      res.status(200).json({ success: true, data: { count } });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
   try {
      const notification = await markAsRead(req.params.id, req.user._id);
      if (!notification) {
         return res.status(404).json({ success: false, message: "Notification not found" });
      }
      res.status(200).json({ success: true, data: notification });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
   try {
      const result = await markAllAsRead(req.user._id);
      res.status(200).json({ success: true, data: result });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Delete a notification
 */
exports.delete = async (req, res) => {
   try {
      const notification = await deleteNotification(req.params.id, req.user._id);
      if (!notification) {
         return res.status(404).json({ success: false, message: "Notification not found" });
      }
      res.status(200).json({ success: true, message: "Notification deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
