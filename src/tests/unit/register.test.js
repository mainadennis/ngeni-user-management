const { register } = require("../../resolvers/mutation");
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../../services/emailService"); // Ensure the email service is imported
jest.mock("../../services/emailService"); // Mock email service
jest.mock("@prisma/client");

describe("User Registration", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      prisma: {
        user: {
          findUnique: jest.fn(), // Mock findUnique function
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
    const password = "SecurePass123@";

    // Mock findUnique to simulate that the user does not exist
    mockContext.prisma.user.findUnique.mockResolvedValue(null);

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
    const email = "test@example.com";
    const password = "SecurePass123@";

    // Mock findUnique to simulate that the user does not exist
    mockContext.prisma.user.findUnique.mockResolvedValue(null);

    await register(null, { email, password }, mockContext);

    expect(sendOTPEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(String)
    );
  });

  it("should throw an error if the email is already in use", async () => {
    // Mock findUnique to simulate that the user already exists
    mockContext.prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      password: bcrypt.hashSync("SecurePass123@", 10),
      isVerified: false,
    });

    await expect(
      register(
        null,
        { email: "test@example.com", password: "SecurePass123@" },
        mockContext
      )
    ).rejects.toThrow(
      "User with this email already exists. Please use a different email."
    );
  });
});
