/**
 * Helper functions for Sri Lankan phone number validation and formatting.
 * Single standard format: 07X XXX XXXX (10 digits starting with 07)
 */

/**
 * Normalizes and formats a phone number to local Sri Lankan format: 07X XXX XXXX
 * Accepts inputs like: 0771234567, 071 234 5678, +94771234567, +94 77 123 4567
 * @param {string} phone 
 * @returns {string} Formatted phone number (e.g. 077 123 4567)
 */
export function formatSriLankanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  
  let digits = phone.trim().replace(/\D/g, '');
  
  if (digits.startsWith('94') && digits.length === 11) {
    digits = '0' + digits.substring(2);
  } else if (!digits.startsWith('0') && digits.length === 9) {
    digits = '0' + digits;
  }

  // If valid 10 digits starting with 07
  if (/^07\d{8}$/.test(digits)) {
    return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
  }

  return phone.trim();
}

/**
 * Validates whether a phone number is a valid 10-digit Sri Lankan number starting with 07
 * @param {string} phone 
 * @param {boolean} allowEmpty 
 * @returns {boolean}
 */
export function isValidSriLankanPhone(phone, allowEmpty = true) {
  if (!phone || !phone.trim()) {
    return allowEmpty;
  }

  let digits = phone.trim().replace(/\D/g, '');
  
  if (digits.startsWith('94') && digits.length === 11) {
    digits = '0' + digits.substring(2);
  } else if (!digits.startsWith('0') && digits.length === 9) {
    digits = '0' + digits;
  }

  return /^07\d{8}$/.test(digits);
}
