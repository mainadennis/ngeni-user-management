const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Account",
    text: `Your OTP is ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendResetEmail = (email, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `Click here to reset your password: http://localhost:3000/reset-password?token=${resetToken}`,
  };

  return transporter.sendMail(mailOptions);
};
