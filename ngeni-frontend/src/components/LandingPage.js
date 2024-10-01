// src/components/LandingPage.js
import React from "react";
import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Typography variant="h3">Welcome to Ngeni!</Typography>
      <Button variant="contained" onClick={() => navigate("/register")}>
        Register
      </Button>
      <Button variant="contained" onClick={() => navigate("/login")}>
        Login
      </Button>
    </div>
  );
};

export default LandingPage;
