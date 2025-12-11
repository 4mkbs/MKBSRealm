import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";
import { Button } from "../ui";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
