import { gql } from "@apollo/client";

export const REGISTER_USER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password)
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const VERIFY_ACCOUNT = gql`
  mutation VerifyAccount($email: String!, $otp: String!) {
    verifyAccount(email: $email, otp: $otp)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($email: String!) {
    requestPasswordReset(email: $email)
  }
`;
