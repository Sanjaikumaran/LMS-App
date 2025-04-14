import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  if (!userData?.userType) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(userData.userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
