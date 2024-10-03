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
          findUnique: jest.fn(),
          update: jest.fn(),
        },
      },
    };
  });

  it("should return a JWT token for a valid user", async () => {
    // Mock the user to simulate a successful login
    mockContext.prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: true,
      failedAttempts: 0,
      lockUntil: null,
    });

    const result = await login(
      null,
      { email: "test@example.com", password: "SecurePass123@" },
      mockContext
    );

    expect(result).toHaveProperty("token");
    expect(jwt.verify(result.token, process.env.JWT_SECRET)).toHaveProperty(
      "userId",
      1
    );

    // Ensure failed attempts are reset
    expect(mockContext.prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: { failedAttempts: 0, lockUntil: null },
    });
  });

  it("should throw an error for invalid credentials", async () => {
    mockContext.prisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: true,
      failedAttempts: 4,
      lockUntil: null,
    });

    mockContext.prisma.user.update.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: true,
      failedAttempts: 4,
      lockUntil: null,
    });

    await expect(
      login(
        null,
        { email: "test@example.com", password: "WrongPass" },
        mockContext
      )
    ).rejects.toThrow("Invalid email or password");

    // Ensure failed attempts are incremented
    expect(mockContext.prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: { failedAttempts: { increment: 1 } },
    });
  });

  it("should throw an error if the user is not verified", async () => {
    mockContext.prisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: false,
      failedAttempts: 0,
      lockUntil: null,
    });

    await expect(
      login(
        null,
        { email: "test@example.com", password: "SecurePass123@" },
        mockContext
      )
    ).rejects.toThrow(
      "Your account has not been verified. Please check your email."
    );
  });

  it("should lock the account after too many failed login attempts", async () => {
    // Mock user with failed attempts that triggers locking
    mockContext.prisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: true,
      failedAttempts: 4, // Start at 4 so the next attempt locks it
      lockUntil: null,
    });

    // Mock the update to simulate incrementing failed attempts
    mockContext.prisma.user.update.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: true,
      failedAttempts: 5, // This simulates the failedAttempts being incremented to 5
      lockUntil: null,
    });

    await expect(
      login(
        null,
        { email: "test@example.com", password: "WrongPass" },
        mockContext
      )
    ).rejects.toThrow(
      "Account locked due to too many failed login attempts. Please try again in 15 minutes."
    );

    // Ensure the user is updated to lock the account
    expect(mockContext.prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: {
        lockUntil: expect.any(Date),
        failedAttempts: 0, // Reset failed attempts after locking
      },
    });
  });
});
