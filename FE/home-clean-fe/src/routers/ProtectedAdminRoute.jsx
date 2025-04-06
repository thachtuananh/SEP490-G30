import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { message } from "antd";

const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!role || role !== "Admin") {
      message.error(
        "Bạn cần đăng nhập với quyền quản trị viên để truy cập trang này"
      );
    }
  }, [role]);

  // Check if user is authenticated and has admin role
  if (!token || role !== "Admin") {
    // Redirect to admin login page, storing the current location
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // If user has Admin role, allow access to the route
  return children;
};

export default ProtectedAdminRoute;
