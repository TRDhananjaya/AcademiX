let twilio = null;
try {
  twilio = require('twilio');
} catch (e) {
  // twilio package not installed yet, fallback to simulation mode
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client if credentials exist in .env and module is installed
let client = null;
if (twilio && accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
  } catch (err) {
    console.warn('Twilio initialization failed:', err.message);
  }
}

/**
 * Format Sri Lankan phone number to E.164 (+94XXXXXXXXX)
 * @param {string} phone 
 * @returns {string}
 */
const formatE164Phone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.trim().replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length === 11) {
    return '+' + digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '+94' + digits.substring(1);
  }
  if (digits.length === 9) {
    return '+94' + digits;
  }
  return digits.startsWith('+') ? digits : '+' + digits;
};

/**
 * Send an SMS to a parent phone number
 * @param {string} parentMobile - Parent's phone number
 * @param {string} studentName - Student's full name
 * @param {string} classTime - Arrival time string (e.g., "08:30 AM")
 * @returns {Promise<boolean>} success
 */
const sendAttendanceSMS = async (parentMobile, studentName, classTime) => {
  try {
    if (!parentMobile) {
      console.warn(`[SMS Service] No parent mobile number provided for ${studentName}`);
      return false;
    }

    const formattedPhone = formatE164Phone(parentMobile);
    const timeStr = classTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageText = `AcademiX Notice: Dear Parent, your child ${studentName} has arrived at class today at ${timeStr}.`;

    if (!client) {
      console.log(`\n======================================================`);
      console.log(`[SMS SIMULATION LOG] (Set TWILIO credentials in .env to send real SMS)`);
      console.log(`TO: ${formattedPhone} (${parentMobile})`);
      console.log(`MESSAGE: "${messageText}"`);
      console.log(`======================================================\n`);
      return true; // Simulation success
    }

    const response = await client.messages.create({
      body: messageText,
      from: fromPhone,
      to: formattedPhone,
    });

    console.log(`[SMS Service] SMS sent successfully to ${formattedPhone}. Message SID: ${response.sid}`);
    return true;
  } catch (error) {
    console.error(`[SMS Service] Failed to send SMS to ${parentMobile}:`, error.message);
    return false;
  }
};

module.exports = {
  sendAttendanceSMS,
  formatE164Phone
};
