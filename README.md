# Ngeni User Management System

## Overview

This project is a user management system built with GraphQL, Prisma, and JWT. It includes user registration, login, email verification via OTP, and password reset functionalities.

## Features

- User registration with email validation and password strength check
- User login with JWT authentication
- Email-based OTP verification for user account activation
- Password reset via email with a secure token
- Protected dashboard route based on JWT authentication

## Technologies

- **Backend**: GraphQL, Prisma, Apollo Server, JWT, Nodemailer
- **Database**: Postgres (default) or MySQL (can be configured)
- **Frontend**: React, Apollo Client, React Router
- **Testing**: Jest, @testing-library/react

---

## Project Structure

```bash
ngeni-user-management/
├── prisma/                  # Prisma database schema
│   └── schema.prisma
├── src/
│   ├── graphql/             # GraphQL schema, queries, and mutations
│   ├── resolvers/           # GraphQL resolvers (business logic)
│   ├── services/            # Business services (e.g., email)
│   ├── utils/               # Utility functions (e.g., token generation)
│   ├── index.js             # Server entry point
├── tests/                   # Jest tests
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
├── .env                     # Environment variables
├── package.json             # Project dependencies and scripts
├── ngeni-frontend/
│   ├──src/components/       # React frontend components
│       ├── LoginPage.js     # Login page component
│       ├── RegisterPage.js  # Registration page component
│       ├── Dashboard.js     # Protected dashboard page component
│   ├──src/graphql/          # GraphQL schema, queries, and mutations
└── README.md                # Project documentation (this file)
```

# Setup Instructions
## Backend setup

1. Clone the repository

```bash
git clone https://github.com/mainadennis/ngeni-user-management.git
cd ngeni-user-management
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables\
   Create a `.env` file at the root of the project with the following contents:

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=465
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_password"
```

If you are using a different database, update the DATABASE_URL accordingly.

4. Set up the database\
   Run the Prisma migration to set up the database:

```bash
npx prisma migrate dev --name init
```

5. Start the development server

```bash
npm run dev
```

The server will be available at `http://localhost:4000`

6. Run tests\
   To run unit and integration tests:

```bash
npm test
```

## Simple Frontend setup
1. Naviagate to the frontend DIR

```bash
cd ngeni-frontend
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm start
```

The server will be available at `http://localhost:3000`

4. Run tests\
   To run unit and integration tests:

```bash
npm test
```

# API Documentation
## GraphQL Endpoints
### All GraphQL API requests should be sent to `/graphql`. Here are the available mutations and queries.

1. User Registration\
   Mutation: register

Registers a new user with an email and password.

```graphql
mutation Register($email: String!, $password: String!) {
  register(email: $email, password: $password)
}
```

Request Example:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response Example:

```json
{
  "data": {
    "register": "Registration successful, verify your email"
  }
}
```

2. User Login\
   Mutation: login

Logs in a user and returns a JWT token.

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}
```

Request Example:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response Example:

```json
{
  "data": {
    "login": {
      "token": "your_jwt_token"
    }
  }
}
```

3. Email Verification\
   Mutation: verifyEmail

Verifies the user's email using an OTP sent to the registered email.

```graphql
mutation VerifyEmail($email: String!, $otp: String!) {
  verifyEmail(email: $email, otp: $otp)
}
```

Request Example:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response Example:

```json
{
  "data": {
    "verifyEmail": "Account verified successfully"
  }
}
```

4.  Request Password Reset\
    Mutation: requestPasswordReset

Requests a password reset, and an email is sent with a token.

```graphql
mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email)
}
```

Request Example:

```json
{
  "email": "user@example.com"
}
```

Response Example:

```json
{
  "data": {
    "requestPasswordReset": "Password reset email sent"
  }
}
```

5.  Reset Password\
    Mutation: resetPassword

Resets the user's password using the token sent to the email.

```graphql
mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword)
}
```

Request Example:

```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

Response Example:

```json
{
  "data": {
    "resetPassword": "Password has been reset"
  }
}
```

## Frontend Usage
- Users must register and verify their email to access the dashboard.
- JWT tokens are stored in localStorage or sessionStorage and are used to authenticate subsequent requests.
- The dashboard is a protected route and can only be accessed when the user is logged in.
