import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Local simulated log file for email dispatches
const getLogPath = () => {
  const dir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'emails.log');
};

/**
 * Sends an email
 * @param {string} to - Destination email address
 * @param {string} subject - Email subject line
 * @param {string} htmlBody - HTML body content
 */
export const sendEmail = async (to, subject, htmlBody) => {
  try {
    // Check if SMTP details are configured in env
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (hasSmtp) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Elevate 2026'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@sknieee.org'}>`,
        to,
        subject,
        html: htmlBody
      });

      console.log(`[SMTP Email Sent] Message ID: ${info.messageId} to ${to}`);
      return { success: true, messageId: info.messageId };
    } else {
      // Mock / Log fallback
      const logEntry = `[${new Date().toISOString()}] TO: ${to}\nSUBJECT: ${subject}\nHTML: ${htmlBody}\n----------------------------------------\n`;
      fs.appendFileSync(getLogPath(), logEntry);

      console.log('\n==================== SIMULATED EMAIL OUTBOX ====================');
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:    (Logged to backend/logs/emails.log)`);
      console.log('=================================================================\n');

      return { success: true, logged: true };
    }
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return { success: false, error: error.message };
  }
};
