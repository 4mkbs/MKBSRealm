const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Static method to find or create a conversation between two users
conversationSchema.statics.findOrCreateConversation = async function (
  userId1,
  userId2
) {
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2], $size: 2 },
  });

  if (!conversation) {
    conversation = await this.create({
      participants: [userId1, userId2],
      unreadCount: new Map([
        [userId1.toString(), 0],
        [userId2.toString(), 0],
      ]),
    });
  }

  return conversation;
};

module.exports = mongoose.model("Conversation", conversationSchema);
