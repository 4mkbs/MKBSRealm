import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../../context/SocketContext";
import { useCall } from "../../context/CallContext";

const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  loading,
  typingUser,
  isOnline,
}) => {
  const { sendTypingStatus } = useSocket();
  const { initiateCall } = useCall();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on conversation change
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(conversation.id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(conversation.id, false);
    }, 2000);
  }, [conversation.id, isTyping, sendTypingStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    onSendMessage(messageText.trim());
    setMessageText("");
    setIsTyping(false);
    sendTypingStatus(conversation.id, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const handleAudioCall = () => {
    initiateCall(conversation.participant.id, "audio");
  };

  const handleVideoCall = () => {
    initiateCall(conversation.participant.id, "video");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={conversation.participant.avatar}
              alt={conversation.participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {conversation.participant.name}
            </h3>
            <p className="text-xs text-gray-500">
              {isOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        {/* Call Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAudioCall}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
            title="Audio call"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            onClick={handleVideoCall}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
            title="Video call"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <img
              src={conversation.participant.avatar}
              alt={conversation.participant.name}
              className="w-20 h-20 rounded-full object-cover mb-4"
            />
            <p className="font-medium">{conversation.participant.name}</p>
            <p className="text-sm">Start a conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {formatDate(dateMessages[0].createdAt)}
                  </span>
                </div>

                {/* Messages */}
                {dateMessages.map((message, index) => {
                  const isOwn = message.isOwn;
                  const showAvatar =
                    !isOwn &&
                    (index === 0 ||
                      dateMessages[index - 1]?.isOwn ||
                      new Date(message.createdAt) -
                        new Date(dateMessages[index - 1]?.createdAt) >
                        60000);

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-2 mb-1 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && (
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && (
                            <img
                              src={message.sender.avatar}
                              alt={message.sender.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] ${
                          isOwn ? "order-1" : "order-2"
                        }`}
                      >
                        {message.type === "call" ? (
                          <div
                            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl ${
                              isOwn
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {message.callInfo?.type === "video" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              )}
                            </svg>
                            <span className="text-sm">{message.content}</span>
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        )}
                        <p
                          className={`text-xs text-gray-400 mt-1 ${
                            isOwn ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUser && (
              <div className="flex items-center space-x-2">
                <div className="w-8">
                  <img
                    src={conversation.participant.avatar}
                    alt={conversation.participant.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex items-center space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Aa"
              className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {/* Send Button */}
          {messageText.trim() ? (
            <button
              type="submit"
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
