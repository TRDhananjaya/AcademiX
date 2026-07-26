const axios = require('axios');

/**
 * Format phone number for WhatsApp Cloud API (e.g. 94771234567)
 * Must be international format digits without '+' or leading '0'
 * @param {string} number 
 * @returns {string}
 */
const formatWhatsAppPhone = (number) => {
  if (!number || typeof number !== 'string') return '';
  let phone = number.trim().replace(/\D/g, '');
  if (phone.startsWith('0') && phone.length === 10) {
    phone = '94' + phone.substring(1);
  }
  if (phone.startsWith('94') && phone.length === 11) {
    return phone;
  }
  return phone;
};

/**
 * Send WhatsApp attendance arrival notification to parent via Meta Graph API
 * @param {string} parentMobile - Parent's mobile number
 * @param {string} studentName - Student's name
 * @param {string} arrivalTime - Arrival timestamp string (e.g. "08:35 AM")
 * @returns {Promise<boolean>} success
 */
const sendAttendanceWhatsApp = async (parentMobile, studentName, arrivalTime) => {
  try {
    if (!parentMobile) {
      console.warn(`[WhatsApp Service] No parent mobile number provided for ${studentName}`);
      return false;
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_VERSION || 'v23.0';

    const formattedPhone = formatWhatsAppPhone(parentMobile);
    const timeStr = arrivalTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageText = `📚 *AcademiX Attendance Alert*\n\nDear Parent,\n\nYour child *${studentName}* has arrived at class today at *${timeStr}*.\n\nThank you,\n*AcademiX Team*`;

    // Check if Meta credentials exist in .env
    if (!token || !phoneNumberId || token === 'YOUR_ACCESS_TOKEN' || phoneNumberId === 'YOUR_PHONE_NUMBER_ID') {
      console.log(`\n======================================================`);
      console.log(`[WHATSAPP SIMULATION LOG] (Set WHATSAPP credentials in .env to send real WhatsApp msg)`);
      console.log(`TO: +${formattedPhone} (Original: ${parentMobile})`);
      console.log(`MESSAGE:\n${messageText}`);
      console.log(`======================================================\n`);
      return true; // Simulation success
    }

    // Call Meta WhatsApp Cloud API
    const response = await axios.post(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: messageText
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[WhatsApp Service] Message sent successfully to +${formattedPhone}. Response ID:`, response.data?.messages?.[0]?.id || 'OK');
    return true;
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error(`[WhatsApp Service] Failed to send WhatsApp to ${parentMobile}:`, errorDetails);
    return false;
  }
};

module.exports = {
  sendAttendanceWhatsApp,
  formatWhatsAppPhone
};
