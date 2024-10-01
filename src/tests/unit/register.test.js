const { register } = require("../../resolvers/mutation");
const bcrypt = require("bcryptjs");
const prisma = require("@prisma/client");
jest.mock("../../services/emailService"); // Mock email service
jest.mock("@prisma/client");

describe("User Registration", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      prisma: {
        user: {
          create: jest.fn().mockResolvedValue({
            id: 1,
            email: "test@example.com",
            isVerified: false,
          }),
          update: jest.fn().mockResolvedValue({}),
        },
      },
    };
  });

  it("should create a user with a hashed password", async () => {
    const email = "test@example.com";
    const password = "SecurePass123";

    await register(null, { email, password }, mockContext);

    expect(mockContext.prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        password: expect.any(String),
      },
    });

    const hashedPassword =
      mockContext.prisma.user.create.mock.calls[0][0].data.password;
    expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
  });

  it("should send a verification email with an OTP", async () => {
    const { sendOTPEmail } = require("../../services/emailService");

    await register(
      null,
      { email: "test@example.com", password: "SecurePass123" },
      mockContext
    );

    expect(sendOTPEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(String)
    );
  });
});
