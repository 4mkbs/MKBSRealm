import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Logo from "./Logo";
import { Button } from "../ui";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { unreadMessages, isConnected } = useSocket();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate total unread messages
  const totalUnread = Object.values(unreadMessages).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <Logo size="md" />
      <nav className="flex items-center gap-4">
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-[#1877f2] font-semibold hover:bg-gray-100 rounded-lg transition"
            >
              Login
            </Link>
            <Link to="/register">
              <Button variant="success">Sign Up</Button>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/home"
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Home
            </Link>
            <Link
              to="/friends"
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
            >
              Friends
            </Link>
            <Link
              to="/messenger"
              className="relative px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition flex items-center"
            >
              <svg
                className="w-6 h-6 mr-1"
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
              Messenger
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Link>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
