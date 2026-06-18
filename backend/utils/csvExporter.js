const { Parser } = require('json2csv');

/**
 * Generate CSV from JSON data
 * @param {Array} data - Array of objects to be converted
 * @param {Array} fields - Array of objects mapping object keys to CSV headers e.g. [{ label: 'Name', value: 'name' }]
 * @returns {String} CSV string
 */
const generateCsv = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (err) {
    console.error('Error parsing JSON to CSV:', err);
    throw new Error('Failed to generate CSV');
  }
};

module.exports = {
  generateCsv
};
