// src/components/ResetPasswordPage.js
import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "../graphql/mutations";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [resetPassword] = useMutation(RESET_PASSWORD);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ variables: { email } });
      alert("Reset link sent! Check your email.");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Typography variant="h4">Reset Password</Typography>
      <form onSubmit={handleRequestReset}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Request Reset
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
