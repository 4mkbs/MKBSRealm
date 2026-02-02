const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const mongoose = require("mongoose");

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "firstName lastName avatar email")
      .populate({
        path: "lastMessage",
        select: "content messageType sender createdAt",
      })
      .sort({ lastMessageAt: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId
      );
      const unreadCount = conv.unreadCount.get(userId) || 0;

      return {
        id: conv._id,
        participant: {
          id: otherParticipant._id,
          name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
          avatar: otherParticipant.avatar,
          email: otherParticipant.email,
        },
        lastMessage: conv.lastMessage
          ? {
              content: conv.lastMessage.content,
              type: conv.lastMessage.messageType,
              senderId: conv.lastMessage.sender,
              createdAt: conv.lastMessage.createdAt,
            }
          : null,
        unreadCount,
        updatedAt: conv.lastMessageAt,
      };
    });

    res.json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching conversations",
    });
  }
};

// Get or create a conversation with a user
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant ID",
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const conversation = await Conversation.findOrCreateConversation(
      userId,
      participantId
    );

    await conversation.populate(
      "participants",
      "firstName lastName avatar email"
    );

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== userId
    );

    res.json({
      success: true,
      data: {
        id: conversation._id,
        participant: {
          id: otherParticipant._id,
          name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
          avatar: otherParticipant.avatar,
          email: otherParticipant.email,
        },
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    console.error("Get/create conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: userId },
    })
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: userId },
    });

    // Format messages
    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg._id,
      content: msg.content,
      type: msg.messageType,
      sender: {
        id: msg.sender._id,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        avatar: msg.sender.avatar,
      },
      attachments: msg.attachments,
      callInfo: msg.callInfo,
      isOwn: msg.sender._id.toString() === userId,
      createdAt: msg.createdAt,
      readBy: msg.readBy,
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content, messageType = "text", attachments } = req.body;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      messageType,
      attachments: attachments || [],
      readBy: [{ user: userId }],
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Increment unread count for other participants
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== userId) {
        const currentCount =
          conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(
          participantId.toString(),
          currentCount + 1
        );
      }
    });

    await conversation.save();

    // Populate sender info
    await message.populate("sender", "firstName lastName avatar");

    const formattedMessage = {
      id: message._id,
      content: message.content,
      type: message.messageType,
      sender: {
        id: message.sender._id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatar: message.sender.avatar,
      },
      attachments: message.attachments,
      isOwn: true,
      createdAt: message.createdAt,
      conversationId: conversationId,
    };

    res.status(201).json({
      success: true,
      data: formattedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending message",
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        "readBy.user": { $ne: userId },
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    // Reset unread count
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender
    if (message.sender.toString() === userId) {
      // Delete for everyone
      message.isDeleted = true;
      message.content = "This message was deleted";
    } else {
      // Delete for this user only
      message.deletedFor.push(userId);
    }

    await message.save();

    res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Search users to start a conversation
exports.searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("firstName lastName avatar email")
      .limit(10);

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      email: user.email,
    }));

    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
