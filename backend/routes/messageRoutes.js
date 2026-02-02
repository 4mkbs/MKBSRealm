const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// Conversations
router.get("/conversations", messageController.getConversations);
router.get(
  "/conversations/:participantId",
  messageController.getOrCreateConversation
);

// Messages
router.get("/:conversationId/messages", messageController.getMessages);
router.post("/:conversationId/messages", messageController.sendMessage);
router.put("/:conversationId/read", messageController.markAsRead);
router.delete("/messages/:messageId", messageController.deleteMessage);

// Search users
router.get("/users/search", messageController.searchUsers);

module.exports = router;
