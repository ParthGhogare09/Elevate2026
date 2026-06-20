import fs from 'fs';
import path from 'path';

// Local simulated log file for WhatsApp messages
const getLogPath = () => {
  const dir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'whatsapp_messages.log');
};

/**
 * Sends a WhatsApp message (simulated/real)
 * @param {string} phone - Target phone number
 * @param {string} message - Message text
 * @param {object} settings - System settings containing templates & auth details
 */
export const sendWhatsAppMessage = async (phone, message, settings = {}) => {
  try {
    if (!settings.whatsappEnabled && settings.whatsappEnabled !== undefined) {
      console.log(`[WhatsApp Bypass] Notifications disabled. Skipped to: ${phone}`);
      return { success: false, reason: 'Disabled' };
    }

    const logEntry = `[${new Date().toISOString()}] TO: ${phone}\nMESSAGE: ${message}\n----------------------------------------\n`;
    fs.appendFileSync(getLogPath(), logEntry);

    // Dynamic console outputs for visual debugging during pair programming
    console.log('\n=================== SIMULATED WHATSAPP OUTBOX ===================');
    console.log(`To:      ${phone}`);
    console.log(`Message: ${message}`);
    console.log('=================================================================\n');

    /*
     * REAL INTEGRATION EXAMPLE (e.g. Twilio API):
     * 
     * import twilio from 'twilio';
     * const client = twilio(settings.twilioAccountSid, settings.twilioAuthToken);
     * await client.messages.create({
     *   body: message,
     *   from: `whatsapp:${settings.twilioWhatsappNumber}`,
     *   to: `whatsapp:${phone}`
     * });
     */

    return { success: true, logged: true };
  } catch (error) {
    console.error(`Error sending WhatsApp notification: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Compiles a template with student and workshop context
 * @param {string} template - The template string with placeholders
 * @param {object} context - Values to replace {name}, {id}, {workshops}, etc.
 */
export const compileTemplate = (template, context = {}) => {
  let output = template;
  for (const [key, value] of Object.entries(context)) {
    output = output.replace(new RegExp(`{${key}}`, 'g'), value ?? '');
  }
  return output;
};
