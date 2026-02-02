const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// Store online users and their socket IDs
const onlineUsers = new Map();
// Store active calls
const activeCalls = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.firstName} (${userId})`);

    // Add user to online users
    onlineUsers.set(userId, socket.id);

    // Broadcast online status to friends
    broadcastOnlineStatus(io, userId, true);

    // Join user's personal room
    socket.join(userId);

    // Send current online users to the connected user
    socket.emit("online-users", Array.from(onlineUsers.keys()));

    // Handle joining a conversation room
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation: ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle sending a message
    socket.on("send-message", async (data) => {
      try {
        const { conversationId, content, messageType = "text" } = data;

        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          messageType,
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
          createdAt: message.createdAt,
          conversationId: conversationId,
        };

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit(
          "new-message",
          formattedMessage
        );

        // Notify other participants who aren't in the conversation room
        conversation.participants.forEach((participantId) => {
          if (participantId.toString() !== userId) {
            io.to(participantId.toString()).emit(
              "message-notification",
              formattedMessage
            );
          }
        });
      } catch (error) {
        console.error("Socket send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation:${conversationId}`).emit("user-typing", {
        userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        isTyping,
      });
    });

    // Handle marking messages as read
    socket.on("mark-read", async (conversationId) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (conversation) {
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

          conversation.unreadCount.set(userId, 0);
          await conversation.save();

          // Notify sender that messages were read
          socket.to(`conversation:${conversationId}`).emit("messages-read", {
            conversationId,
            readBy: userId,
          });
        }
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    // ========== WEBRTC CALL SIGNALING ==========

    // Handle initiating a call
    socket.on("call-user", async (data) => {
      const { recipientId, callType, signal } = data;

      const recipientSocketId = onlineUsers.get(recipientId);

      if (!recipientSocketId) {
        socket.emit("call-error", { message: "User is offline" });
        return;
      }

      // Store call info
      const callId = `${userId}-${recipientId}-${Date.now()}`;
      activeCalls.set(callId, {
        caller: userId,
        recipient: recipientId,
        callType,
        startTime: null,
        status: "ringing",
      });

      // Send call request to recipient
      io.to(recipientSocketId).emit("incoming-call", {
        callId,
        callType,
        signal,
        caller: {
          id: userId,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          avatar: socket.user.avatar,
        },
      });

      socket.emit("call-initiated", { callId });
    });

    // Handle accepting a call
    socket.on("accept-call", (data) => {
      const { callId, signal, callerId } = data;

      const callerSocketId = onlineUsers.get(callerId);

      if (callerSocketId) {
        const call = activeCalls.get(callId);
        if (call) {
          call.status = "ongoing";
          call.startTime = Date.now();
        }

        io.to(callerSocketId).emit("call-accepted", {
          callId,
          signal,
          accepter: {
            id: userId,
            name: `${socket.user.firstName} ${socket.user.lastName}`,
            avatar: socket.user.avatar,
          },
        });
      }
    });

    // Handle rejecting/declining a call
    socket.on("reject-call", async (data) => {
      const { callId, callerId, reason = "declined" } = data;

      const callerSocketId = onlineUsers.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-rejected", {
          callId,
          reason,
        });
      }

      // Save call record as missed/declined
      const call = activeCalls.get(callId);
      if (call) {
        await saveCallRecord(call, reason);
        activeCalls.delete(callId);
      }
    });

    // Handle ending a call
    socket.on("end-call", async (data) => {
      const { callId, recipientId } = data;

      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call-ended", { callId });
      }

      // Save call record
      const call = activeCalls.get(callId);
      if (call) {
        await saveCallRecord(call, "answered");
        activeCalls.delete(callId);
      }
    });

    // Handle ICE candidates
    socket.on("ice-candidate", (data) => {
      const { recipientId, candidate } = data;

      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("ice-candidate", {
          candidate,
          senderId: userId,
        });
      }
    });

    // Handle call timeout (no answer)
    socket.on("call-timeout", async (data) => {
      const { callId, recipientId } = data;

      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call-missed", { callId });
      }

      // Save call record as missed
      const call = activeCalls.get(callId);
      if (call) {
        await saveCallRecord(call, "missed");
        activeCalls.delete(callId);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.firstName} (${userId})`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Broadcast offline status
      broadcastOnlineStatus(io, userId, false);

      // Handle any active calls
      activeCalls.forEach(async (call, callId) => {
        if (call.caller === userId || call.recipient === userId) {
          const otherUserId =
            call.caller === userId ? call.recipient : call.caller;
          const otherSocketId = onlineUsers.get(otherUserId);

          if (otherSocketId) {
            io.to(otherSocketId).emit("call-ended", {
              callId,
              reason: "disconnected",
            });
          }

          if (call.status === "ongoing") {
            await saveCallRecord(call, "answered");
          }
          activeCalls.delete(callId);
        }
      });
    });
  });

  return io;
};

// Helper function to broadcast online status
const broadcastOnlineStatus = async (io, userId, isOnline) => {
  try {
    const user = await User.findById(userId).populate("friends", "_id");

    if (user && user.friends) {
      user.friends.forEach((friend) => {
        const friendSocketId = onlineUsers.get(friend._id.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit("user-status-change", {
            userId,
            isOnline,
          });
        }
      });
    }
  } catch (error) {
    console.error("Broadcast online status error:", error);
  }
};

// Helper function to save call records
const saveCallRecord = async (call, status) => {
  try {
    let conversation = await Conversation.findOrCreateConversation(
      call.caller,
      call.recipient
    );

    const duration =
      call.startTime && status === "answered"
        ? Math.floor((Date.now() - call.startTime) / 1000)
        : 0;

    const message = await Message.create({
      conversation: conversation._id,
      sender: call.caller,
      content: `${
        call.callType === "video" ? "Video" : "Audio"
      } call - ${status}`,
      messageType: "call",
      callInfo: {
        type: call.callType,
        duration,
        status,
      },
      readBy: [{ user: call.caller }],
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();
  } catch (error) {
    console.error("Save call record error:", error);
  }
};

module.exports = { initializeSocket, onlineUsers };
