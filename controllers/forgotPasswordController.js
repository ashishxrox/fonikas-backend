const crypto = require('crypto');
const User = require('../models/Users');
const sendEmail = require('../utils/sendEmail');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = user.getResetPassToken();
    await user.save({ validateBeforeSave: false });

    // Determine environment-based URL
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.PROD_FRONTEND_URL
      : process.env.FRONTEND_URL;

    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Email template
    const html = `
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail(user.email, 'Password Reset Request', html);

    res.status(200).json({ message: "Password reset email sent successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
