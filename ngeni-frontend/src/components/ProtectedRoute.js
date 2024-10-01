import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, isTokenExpired } from "../utils/token";

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
