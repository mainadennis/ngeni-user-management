// src/components/RegisterPage.js
import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../graphql/mutations";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registerUser, { loading, error }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      setSuccessMessage("Registration successful");
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ variables: { email, password } });
      alert("Registration successful! Please verify your email.");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Typography variant="h4">Register</Typography>
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
          variant="contained"
          disabled={loading}
          color="primary"
        >
          Register
        </Button>

        {successMessage && <div>{successMessage}</div>}
        {error && <div>{error.message}</div>}
      </form>
    </div>
  );
};

export default RegisterPage;
