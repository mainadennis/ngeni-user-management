const { login } = require("../../resolvers/mutation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
jest.mock("@prisma/client");
require("dotenv").config();

describe("User Login", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      prisma: {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 1,
            email: "test@example.com",
            password: bcrypt.hashSync("SecurePass123", 10),
            isVerified: true,
          }),
        },
      },
    };
  });

  it("should return a JWT token for a valid user", async () => {
    const result = await login(
      null,
      { email: "test@example.com", password: "SecurePass123" },
      mockContext
    );

    expect(result).toHaveProperty("token");
    expect(jwt.verify(result.token, process.env.JWT_SECRET)).toHaveProperty(
      "userId",
      1
    );
  });

  it("should throw an error for invalid credentials", async () => {
    await expect(
      login(
        null,
        { email: "wrong@example.com", password: "WrongPass" },
        mockContext
      )
    ).rejects.toThrow("Invalid email or password");
  });

  it("should throw an error if the user is not verified", async () => {
    mockContext.prisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123", 10),
      isVerified: false,
    });

    await expect(
      login(
        null,
        { email: "test@example.com", password: "SecurePass123" },
        mockContext
      )
    ).rejects.toThrow("Account not verified");
  });
});
