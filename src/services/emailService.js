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

exports.sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify Your Account",
    text: `Your OTP is ${otp}`,
  };

  return await transporter.sendMail(mailOptions);
};

exports.sendResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Request",
    text: `Click here to reset your password: http://localhost:4000/reset-password?token=${resetToken}`,
  };

  return await transporter.sendMail(mailOptions);
};
