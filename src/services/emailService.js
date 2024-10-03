const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends an email containing a One-Time Password (OTP) to the specified email address.
 *
 * @param {string} email - The email address to send the OTP to.
 * @param {string} otp - The One-Time Password to be included in the email.
 * @returns {Promise} A Promise that resolves when the email is successfully sent.
 */
exports.sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify Your Account",
    text: `Your OTP is ${otp}`,
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Sends a password reset email to the specified email address.
 *
 * @param {string} email - The email address to send the reset email to.
 * @param {string} resetToken - The token used for resetting the password.
 * @returns {Promise} A promise that resolves when the email is sent successfully.
 */
exports.sendResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Request",
    text: `Click here to reset your password: http://localhost:4000/reset-password?token=${resetToken}`,
  };

  return await transporter.sendMail(mailOptions);
};
