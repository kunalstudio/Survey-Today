const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a generic email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };
  return await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Survey Today - Password Reset Request',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#666;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send survey invitation email
 */
const sendSurveyInvitation = async (email, survey, inviteToken) => {
  const surveyUrl = `${process.env.CLIENT_URL}/surveys/${survey.slug}/respond?token=${inviteToken}`;
  await sendEmail({
    to: email,
    subject: `You're invited to complete: ${survey.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>${survey.title}</h2>
        <p>${survey.description || 'You have been invited to complete a survey.'}</p>
        <a href="${surveyUrl}" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">
          Take Survey
        </a>
        <p style="color:#666;font-size:12px">This invitation is personal to you. Please do not share this link.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendSurveyInvitation };
