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
    if (!parentMobile || parentMobile.trim() === '' || parentMobile.trim().toUpperCase() === 'N/A') {
      console.warn(`[WhatsApp Service] No valid parent mobile number provided for student: ${studentName}`);
      return false;
    }

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_VERSION || 'v23.0';

    const TIMEZONE = process.env.TIMEZONE || 'Asia/Colombo';
    const formattedPhone = formatWhatsAppPhone(parentMobile);
    const timeStr = arrivalTime || new Date().toLocaleTimeString('en-US', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const todayStr = new Date().toLocaleDateString('en-GB', {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const messageText = `🏫 *AcademiX Institute - Attendance Alert*\n\nDear Parent,\n\nThis is to inform you that your child *${studentName}* has successfully checked in today.\n\n📅 *Date:* ${todayStr}\n⏰ *Time:* ${timeStr}\n✅ *Status:* Present\n\nThank you,\n*AcademiX Administration*`;

    // Check if Meta credentials exist in .env
    if (!token || !phoneNumberId || token === 'YOUR_ACCESS_TOKEN' || phoneNumberId === 'YOUR_PHONE_NUMBER_ID') {
      console.log(`\n======================================================`);
      console.log(`[WHATSAPP SIMULATION LOG] (Set WHATSAPP credentials in .env to send real WhatsApp msg)`);
      console.log(`TO: +${formattedPhone} (Original: ${parentMobile})`);
      console.log(`MESSAGE:\n${messageText}`);
      console.log(`======================================================\n`);
      return true; // Simulation success
    }

    // Call Meta WhatsApp Cloud API to send the custom attendance alert
    try {
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

      console.log(`[WhatsApp Service] Attendance notification delivered to +${formattedPhone}. ID:`, response.data?.messages?.[0]?.id || 'OK');
      return true;
    } catch (apiError) {
      const errorMsg = apiError.response?.data?.error?.message || apiError.message;
      const errorCode = apiError.response?.data?.error?.code;

      console.warn(`\n[WhatsApp Service Warning] Meta API call returned error (Code ${errorCode}: ${errorMsg}).`);
      if (errorCode === 190) {
        console.warn(`[WhatsApp Service Hint] Your Meta Access Token in backend/.env has expired. Please refresh WHATSAPP_TOKEN from developers.facebook.com.`);
      }

      // Log notification content in server console as graceful fallback so attendance is marked and notification logged
      console.log(`\n======================================================`);
      console.log(`[WHATSAPP NOTIFICATION LOG - FALLBACK SIMULATION]`);
      console.log(`STUDENT: ${studentName}`);
      console.log(`TO: +${formattedPhone} (Original: ${parentMobile})`);
      console.log(`MESSAGE:\n${messageText}`);
      console.log(`======================================================\n`);

      return false;
    }
  } catch (error) {
    console.error(`[WhatsApp Service Error] Failed processing notification for ${studentName}:`, error.message);
    return false;
  }
};

module.exports = {
  sendAttendanceWhatsApp,
  formatWhatsAppPhone
};
