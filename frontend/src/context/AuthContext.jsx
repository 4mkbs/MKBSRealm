import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem("auth_token");
    const profile = localStorage.getItem("user_profile");

    if (token && profile) {
      setUser(JSON.parse(profile));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - replace with real API call
    const mockUser = { name: "User", email };
    localStorage.setItem("auth_token", "mock_token");
    localStorage.setItem("user_profile", JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const register = (userData) => {
    // Mock register - replace with real API call
    const newUser = {
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
    };
    localStorage.setItem("auth_token", "mock_token");
    localStorage.setItem("user_profile", JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
