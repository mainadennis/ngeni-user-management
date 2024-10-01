// src/components/LoginPage.js
import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../graphql/mutations";
import { setToken } from "../utils/token";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      setSuccessMessage("Login successful");
      const token = data.login.token;
      setToken(token);
    },
    onError: (err) => {
      alert(err.message);
    },
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ variables: { email, password } });
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Typography variant="h4">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          color="primary"
        >
          Login
        </Button>

        {successMessage && <div>{successMessage}</div>}
        {error && <div>{error.message}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
