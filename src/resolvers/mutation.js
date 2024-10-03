const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendResetEmail } = require("../services/emailService");
const { generateOTP } = require("../utils/otpGenerator");
const { checkPasswordStrength, validateEmail } = require("../utils/helpers");
const crypto = require("crypto");

/**
 * Register a new user with the provided email and password.
 *
 * @param {Object} parent - The parent object in the resolver chain.
 * @param {Object} args - The arguments passed to the resolver containing email and password.
 * @param {Object} context - The context object containing Prisma client and other utilities.
 * @returns {String} A message indicating the registration status.
 * @throws {Error} If the email format is invalid, password is weak, email already exists, or registration fails.
 */
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
    // console.error("Error during registration:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(error.message || "Registration failed. Please try again.");
  }
};

/**
 * Asynchronous function to handle user login.
 * Validates the email format, checks if the user exists, and verifies the password.
 * Handles account locking after multiple failed attempts and account verification status.
 * Resets failed attempts upon successful login and generates a JWT token for authentication.
 *
 * @param {Object} parent - The parent object in the resolver chain.
 * @param {Object} args - The arguments passed to the resolver, including email and password.
 * @param {Object} context - The context object containing Prisma client and other data.
 * @returns {Object} - An object containing a JWT token upon successful login.
 * @throws {Error} - Throws an error if login fails due to various reasons.
 */
const login = async (parent, { email, password }, context) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error("Invalid email or password");
    }

    const user = await context.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if the account is locked
    if (user.lockUntil && new Date() < user.lockUntil) {
      const lockTimeLeft = Math.ceil((user.lockUntil - new Date()) / 60000); // in minutes
      throw new Error(
        `Account is locked. Try again in ${lockTimeLeft} minutes.`
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Increment failed login attempts
      const updatedUser = await context.prisma.user.update({
        where: { email },
        data: { failedAttempts: { increment: 1 } },
      });

      // Lock the account if attempts exceed 5
      if (updatedUser.failedAttempts >= 5) {
        await context.prisma.user.update({
          where: { email },
          data: {
            lockUntil: new Date(Date.now() + 15 * 60 * 1000), // Lock account for 15 minutes
            failedAttempts: 0, // Reset failed attempts after locking
          },
        });
        throw new Error(
          "Account locked due to too many failed login attempts. Please try again in 15 minutes."
        );
      }

      throw new Error("Invalid email or password");
    }

    // Check if the account is verified
    if (!user.isVerified) {
      throw new Error(
        "Your account has not been verified. Please check your email."
      );
    }

    // Reset failed attempts upon successful login
    await context.prisma.user.update({
      where: { email },
      data: { failedAttempts: 0, lockUntil: null }, // Reset failedAttempts and lockUntil
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token };
  } catch (error) {
    // console.error("Error during Login:", error.message);
    throw new Error(error.message || "Login failed. Please try again.");
  }
};

/**
 * Verify the user account by validating the provided email and OTP.
 *
 * @param {Object} parent - The parent object in the resolver chain.
 * @param {Object} args - The arguments passed to the resolver containing the email and OTP.
 * @param {Object} context - The context object containing the Prisma client and other data.
 * @returns {String} A message indicating the result of the account verification process.
 * @throws {Error} If the email format is invalid, OTP is incorrect or expired, or an unexpected error occurs.
 */
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
    // console.error("Error during verifyAccount:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(error.message || "verifyAccount failed. Please try again.");
  }
};

/**
 * Request a password reset for the user with the provided email.
 * Validates the email format, generates a reset token, updates the user's resetToken and resetExpires fields,
 * sends a reset email with the token, and returns a success message.
 * If any errors occur during the process, they are caught, logged, and rethrown with a generic message.
 *
 * @param {Object} parent - The parent object (not used in this function).
 * @param {Object} args - The arguments object containing the email for password reset.
 * @param {Object} context - The context object containing Prisma client and other utilities.
 * @returns {String} A message indicating the status of the password reset email sending.
 */
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
    // console.error("Error during requestPasswordReset:", error.message);

    // Re-throw the error to propagate it up the chain (e.g., to the GraphQL layer)
    throw new Error(
      error.message || "requestPasswordReset failed. Please try again."
    );
  }
};

/**
 * Resets the user's password after validating the strength of the new password.
 *
 * @param {Object} parent - The parent object in the resolver chain.
 * @param {Object} args - The arguments passed to the resolver containing the token and new password.
 * @param {Object} context - The context object containing the Prisma client and other contextual data.
 * @returns {String} A message indicating the success or failure of the password reset.
 * @throws {Error} If the new password does not meet the required strength criteria.
 * @throws {Error} If the token is invalid or expired.
 */
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
    // console.error("Error during resetPassword:", error.message);

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
