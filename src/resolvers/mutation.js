const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendResetEmail } = require("../services/emailService");
const { generateOTP } = require("../utils/otpGenerator");
const crypto = require("crypto");

const register = async (parent, { email, password }, context) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await context.prisma.user.create({
    data: { email, password: hashedPassword },
  });

  const otp = generateOTP();
  await context.prisma.user.update({
    where: { email },
    data: { otp, otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  });

  await sendOTPEmail(email, otp);

  return "Registration successful, verify your email";
};

const login = async (parent, { email, password }, context) => {
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
};

const verifyAccount = async (parent, { email, otp }, context) => {
  const user = await context.prisma.user.findUnique({ where: { email } });

  if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
    throw new Error("Invalid or expired OTP");
  }

  await context.prisma.user.update({
    where: { email },
    data: { isVerified: true, otp: null, otpExpiresAt: null },
  });

  return "Account successfully verified";
};

const requestPasswordReset = async (parent, { email }, context) => {
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
};

const resetPassword = async (parent, { token, newPassword }, context) => {
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
};

module.exports = {
  register,
  login,
  verifyAccount,
  requestPasswordReset,
  resetPassword,
};
