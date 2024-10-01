// src/components/VerifyPage.js
import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { VERIFY_ACCOUNT } from "../graphql/mutations";

const VerifyPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyAccount] = useMutation(VERIFY_ACCOUNT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyAccount({ variables: { email, otp } });
      alert("Account successfully verified!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Typography variant="h4">Verify Account</Typography>
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
          label="OTP"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Verify
        </Button>
      </form>
    </div>
  );
};

export default VerifyPage;
