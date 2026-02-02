import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useCall } from "../context/CallContext";
import { messagesAPI } from "../services/api";
import ConversationList from "../components/messenger/ConversationList";
import ChatWindow from "../components/messenger/ChatWindow";
import VideoCallModal from "../components/messenger/VideoCallModal";
import IncomingCallModal from "../components/messenger/IncomingCallModal";

const Messenger = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    socket,
    joinConversation,
    leaveConversation,
    isUserOnline,
    markAsRead,
  } = useSocket();
  const { callState } = useCall();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const previousConversationRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getConversations();
        setConversations(response.data || []);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Handle URL params for direct conversation
  useEffect(() => {
    const participantId = searchParams.get("user");
    if (participantId && !loading) {
      handleStartConversation(participantId);
    }
  }, [searchParams, loading]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (activeConversation) {
      // Leave previous conversation
      if (
        previousConversationRef.current &&
        previousConversationRef.current !== activeConversation.id
      ) {
        leaveConversation(previousConversationRef.current);
      }

      // Join new conversation
      joinConversation(activeConversation.id);
      previousConversationRef.current = activeConversation.id;

      // Mark as read
      markAsRead(activeConversation.id);
    }

    return () => {
      if (previousConversationRef.current) {
        leaveConversation(previousConversationRef.current);
      }
    };
  }, [activeConversation, joinConversation, leaveConversation, markAsRead]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Update messages if in the same conversation
      if (
        activeConversation &&
        message.conversationId === activeConversation.id
      ) {
        setMessages((prev) => [
          ...prev,
          { ...message, isOwn: message.sender.id === user.id },
        ]);
        markAsRead(activeConversation.id);
      }

      // Update conversation list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: message.content,
                type: message.type,
                senderId: message.sender.id,
                createdAt: message.createdAt,
              },
              updatedAt: message.createdAt,
              unreadCount:
                activeConversation?.id === conv.id ? 0 : conv.unreadCount + 1,
            };
          }
          return conv;
        });
        // Sort by most recent
        return updated.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    const handleTyping = ({ userId, userName, isTyping }) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        setTypingUser(userName);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        setTypingUser(null);
      }
    };

    const handleMessagesRead = ({ conversationId, readBy }) => {
      if (activeConversation && conversationId === activeConversation.id) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            readBy: [...(msg.readBy || []), { user: readBy }],
          }))
        );
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleTyping);
    socket.on("messages-read", handleMessagesRead);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleTyping);
      socket.off("messages-read", handleMessagesRead);
    };
  }, [socket, activeConversation, user, markAsRead]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data?.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
    setSearchParams({});
  };

  // Handle starting a new conversation
  const handleStartConversation = async (participantId) => {
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(
        (c) => c.participant.id === participantId
      );
      if (existingConv) {
        handleSelectConversation(existingConv);
        return;
      }

      // Create new conversation
      const response = await messagesAPI.getOrCreateConversation(participantId);
      const newConversation = {
        ...response.data,
        lastMessage: null,
        unreadCount: 0,
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages([]);
      setSearchParams({});
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;

    try {
      const response = await messagesAPI.sendMessage(
        activeConversation.id,
        content
      );
      // Message will be added via socket event
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {/* Conversation List - Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onStartConversation={handleStartConversation}
          isUserOnline={isUserOnline}
          loading={loading}
        />
      </div>

      {/* Chat Window - Main Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={messagesLoading}
            typingUser={typingUser}
            isOnline={isUserOnline(activeConversation.participant.id)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Your Messages
              </h3>
              <p className="text-gray-500">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {(callState.isCalling || callState.isInCall) && <VideoCallModal />}

      {/* Incoming Call Modal */}
      {callState.isReceivingCall && <IncomingCallModal />}
    </div>
  );
};

export default Messenger;
