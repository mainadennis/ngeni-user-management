const { ApolloServer } = require("apollo-server");
const typeDefs = require("../../graphql/schema");
const resolvers = require("../../resolvers");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Initialize the Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ prisma }),
});

describe("User Flow Integration Tests", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("should register a user", async () => {
    const response = await server.executeOperation({
      query: `
        mutation {
          register(email: "integration@example.com", password: "IntegrationPass123")
        }
      `,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data.register).toBe(
      "Registration successful, verify your email"
    );
  });

  it("should verify the user account", async () => {
    // Get the OTP from the Prisma DB
    const user = await prisma.user.findUnique({
      where: { email: "integration@example.com" },
    });

    const response = await server.executeOperation({
      query: `
        mutation {
          verifyAccount(email: "integration@example.com", otp: "${user.otp}")
        }
      `,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data.verifyAccount).toBe("Account successfully verified");
  });

  it("should log in the user and return a JWT token", async () => {
    const response = await server.executeOperation({
      query: `
        mutation {
          login(email: "integration@example.com", password: "IntegrationPass123") {
            token
          }
        }
      `,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data.login).toHaveProperty("token");
  });
});
