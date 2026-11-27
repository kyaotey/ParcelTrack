const crypto = require('crypto');

function generateTrackingNumber() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const rand = crypto.randomInt(0, 10000).toString().padStart(4, '0');
  return `PT-${year}${month}${day}-${rand}`;
}

function generateDeliveryPin() {
  return crypto.randomInt(0, 10000).toString().padStart(4, '0');
}

module.exports = {
  generateTrackingNumber,
  generateDeliveryPin,
};
