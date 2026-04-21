const nodemailer = require('nodemailer');
const { logger } = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a verification code email
 */
const sendVerificationEmail = async (to, nickname, code) => {
  const mailOptions = {
    from: '"SignConnect Verification" <verify@signconnect.com>',
    to: to,
    subject: `SignConnect: Your Verification Code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #14B8A6; text-align: center;">Welcome to SignConnect, ${nickname}!</h2>
        <p>Please use the verification code below to confirm your account and start using the app:</p>
        <div style="background-color: #F1F5F9; padding: 20px; text-align: center; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3B82F6;">
          ${code}
        </div>
        <p style="text-align: center; color: #666; margin-top: 20px;">This code will expire in 1 hour.</p>
        <br>
        <p>Best Regards,</p>
        <p><strong>The SignConnect Team</strong></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
    if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST.includes('ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    logger.error(`Error sending verification email to ${to}:`, error);
    return false;
  }
};

module.exports = { sendVerificationEmail };
