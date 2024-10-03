const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendResetEmail } = require("../services/emailService");
const { generateOTP } = require("../utils/otpGenerator");
const { checkPasswordStrength, validateEmail } = require("../utils/helpers");
const crypto = require("crypto");

const register = async (parent, { email, password }, context) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error(
        "Invalid email format. Please enter a valid email address."
      );
    }

    const passwordStrength = checkPasswordStrength(password);

    // Require a password strength score of at least 3
    if (passwordStrength < 5) {
      throw new Error(
        "Password is too weak. Ensure it's at least 8 characters long and includes uppercase letters, numbers, and special characters."
      );
    }

    // Check if the email already exists in the database
    const existingUser = await context.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error(
        "User with this email already exists. Please use a different email."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await context.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const otp = generateOTP();
    await context.prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });

    await sendOTPEmail(email, otp);

    return "Registration successful, verify your email";
  } catch (error) {
    // Handle known and unexpected errors
    console.error("Error during registration:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(error.message || "Registration failed. Please try again.");
  }
};

const login = async (parent, { email, password }, context) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error(
        "Invalid email format. Please enter a valid email address."
      );
    }

    const user = await context.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid email or password");
    }
    if (!user.isVerified) {
      throw new Error("Account not verified");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { token };
  } catch (error) {
    // Handle known and unexpected errors
    console.error("Error during Login:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(error.message || "Login failed. Please try again.");
  }
};

const verifyAccount = async (parent, { email, otp }, context) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error(
        "Invalid email format. Please enter a valid email address."
      );
    }

    const user = await context.prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    await context.prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    });

    return "Account successfully verified";
  } catch (error) {
    // Handle known and unexpected errors
    console.error("Error during verifyAccount:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(error.message || "verifyAccount failed. Please try again.");
  }
};

const requestPasswordReset = async (parent, { email }, context) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error(
        "Invalid email format. Please enter a valid email address."
      );
    }

    const user = await context.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await context.prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetExpires: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    await sendResetEmail(email, resetToken);
    return "Password reset email sent";
  } catch (error) {
    // Handle known and unexpected errors
    console.error("Error during requestPasswordReset:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(
      error.message || "requestPasswordReset failed. Please try again."
    );
  }
};

const resetPassword = async (parent, { token, newPassword }, context) => {
  try {
    const passwordStrength = checkPasswordStrength(newPassword);

    // Require a password strength score of at least 3
    if (passwordStrength < 3) {
      throw new Error(
        "Password is too weak. Ensure it's at least 8 characters long and includes uppercase letters, numbers, and special characters."
      );
    }

    const user = await context.prisma.user.findFirst({
      where: { resetToken: token, resetExpires: { gte: new Date() } },
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await context.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetExpires: null },
    });

    return "Password successfully reset";
  } catch (error) {
    // Handle known and unexpected errors
    console.error("Error during resetPassword:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(error.message || "resetPassword failed. Please try again.");
  }
};

module.exports = {
  register,
  login,
  verifyAccount,
  requestPasswordReset,
  resetPassword,
};
