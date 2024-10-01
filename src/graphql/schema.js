const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    isVerified: Boolean!
  }

  type AuthPayload {
    token: String
  }

  type Mutation {
    register(email: String!, password: String!): String
    login(email: String!, password: String!): AuthPayload
    verifyAccount(email: String!, otp: String!): String
    requestPasswordReset(email: String!): String
    resetPassword(token: String!, newPassword: String!): String
  }

  type Query {
    hello: String
  }
`;

module.exports = typeDefs;
