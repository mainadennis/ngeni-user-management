const {
  register,
  login,
  verifyAccount,
  requestPasswordReset,
  resetPassword,
} = require("./mutation");

const resolvers = {
  Query: {
    hello: () => "Hello, world!",
  },
  Mutation: {
    register,
    login,
    verifyAccount,
    requestPasswordReset,
    resetPassword,
  },
};

module.exports = resolvers;
