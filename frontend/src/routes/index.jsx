import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout, AuthLayout } from "../layouts";
import { Login, Register, Home, Messenger } from "../pages";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Profile from "../pages/Profile";
import Friends from "../pages/Friends";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes with auth layout (login/register) */}
      <Route element={<PublicRoute restricted />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Protected routes with main layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/messenger" element={<Messenger />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
