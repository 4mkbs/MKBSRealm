import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // Return default values when not in provider or user not authenticated
    return {
      socket: null,
      isConnected: false,
      onlineUsers: [],
      unreadMessages: {},
      joinConversation: () => {},
      leaveConversation: () => {},
      sendMessage: () => {},
      sendTypingStatus: () => {},
      markAsRead: () => {},
      clearUnread: () => {},
      isUserOnline: () => false,
    };
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Connect to socket server
      const socketURL =
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000";

      const newSocket = io(socketURL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("online-users", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("user-status-change", ({ userId, isOnline }) => {
        setOnlineUsers((prev) => {
          if (isOnline) {
            return [...new Set([...prev, userId])];
          }
          return prev.filter((id) => id !== userId);
        });
      });

      newSocket.on("message-notification", (message) => {
        setUnreadMessages((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1,
        }));
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.close();
        socketRef.current = null;
      };
    }
  }, [user, token]);

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit("join-conversation", conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit("leave-conversation", conversationId);
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId, content, messageType = "text") => {
      if (socketRef.current) {
        socketRef.current.emit("send-message", {
          conversationId,
          content,
          messageType,
        });
      }
    },
    []
  );

  const sendTypingStatus = useCallback((conversationId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit("typing", { conversationId, isTyping });
    }
  }, []);

  const markAsRead = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit("mark-read", conversationId);
      setUnreadMessages((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
    }
  }, []);

  const clearUnread = useCallback((conversationId) => {
    setUnreadMessages((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));
  }, []);

  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.includes(userId);
    },
    [onlineUsers]
  );

  const value = {
    socket,
    isConnected,
    onlineUsers,
    unreadMessages,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingStatus,
    markAsRead,
    clearUnread,
    isUserOnline,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
