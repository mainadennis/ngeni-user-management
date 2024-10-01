const request = require("supertest");
const { ApolloServer } = require("apollo-server");
const typeDefs = require("../../graphql/schema");
const resolvers = require("../../resolvers");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ prisma }),
});

describe("User Flow Integration Tests", () => {
  let testServer;

  beforeAll(() => {
    testServer = request(server.listen());
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a user", async () => {
    const response = await testServer.post("/").send({
      query: `
          mutation {
            register(email: "integration@example.com", password: "IntegrationPass123")
          }
        `,
    });

    expect(response.body.data.register).toBe(
      "Registration successful, verify your email"
    );
  });

  it("should verify the user account", async () => {
    // Get the OTP from the Prisma DB
    const user = await prisma.user.findUnique({
      where: { email: "integration@example.com" },
    });

    const response = await testServer.post("/").send({
      query: `
          mutation {
            verifyAccount(email: "integration@example.com", otp: "${user.otp}")
          }
        `,
    });

    expect(response.body.data.verifyAccount).toBe(
      "Account successfully verified"
    );
  });

  it("should log in the user and return a JWT token", async () => {
    const response = await testServer.post("/").send({
      query: `
          mutation {
            login(email: "integration@example.com", password: "IntegrationPass123") {
              token
            }
          }
        `,
    });

    expect(response.body.data.login).toHaveProperty("token");
  });
});
