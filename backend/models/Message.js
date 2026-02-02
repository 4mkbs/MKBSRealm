const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return !this.attachments || this.attachments.length === 0;
      },
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video", "call"],
      default: "text",
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file", "audio", "video"],
        },
        url: String,
        name: String,
        size: Number,
      },
    ],
    callInfo: {
      type: {
        type: String,
        enum: ["audio", "video"],
      },
      duration: Number, // in seconds
      status: {
        type: String,
        enum: ["missed", "answered", "declined", "ongoing"],
      },
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model("Message", messageSchema);
