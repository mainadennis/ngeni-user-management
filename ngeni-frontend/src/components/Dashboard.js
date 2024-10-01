// src/components/Dashboard.js
import React from "react";
import { Typography, Button } from "@mui/material";
import { removeToken } from "../utils/token";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div>
      <Typography variant="h4">Dashboard</Typography>
      <Typography variant="body1">Welcome to your dashboard!</Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
