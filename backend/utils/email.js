import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.SMTP_EMAIL,
      pass: config.SMTP_PASSWORD,
    },
  });
};

export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  if (options.html) {
    message.html = options.html;
  }

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

// Template-based email sending
export const sendTemplateEmail = async (templateName, data, recipient) => {
  const templates = {
    welcome: {
      subject: 'Welcome to Real Estate Platform',
      html: `
        <h1>Welcome ${data.name}!</h1>
        <p>Thank you for joining our real estate platform.</p>
        <p>You can now start browsing properties or list your own.</p>
      `
    },
    passwordReset: {
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Hi ${data.name},</p>
        <p>You requested a password reset. Use the following token:</p>
        <p><strong>${data.token}</strong></p>
        <p>This token will expire in 10 minutes.</p>
      `
    },
    propertyApproved: {
      subject: 'Property Approved',
      html: `
        <h1>Property Approved</h1>
        <p>Hi ${data.ownerName},</p>
        <p>Your property "${data.propertyTitle}" has been approved and is now live.</p>
      `
    },
    propertyRejected: {
      subject: 'Property Rejected',
      html: `
        <h1>Property Rejected</h1>
        <p>Hi ${data.ownerName},</p>
        <p>Your property "${data.propertyTitle}" has been rejected.</p>
        <p>Reason: ${data.reason}</p>
      `
    }
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  await sendEmail({
    email: recipient,
    subject: template.subject,
    html: template.html
  });
};