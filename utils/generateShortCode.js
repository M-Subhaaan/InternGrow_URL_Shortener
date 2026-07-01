const nanoId = require("nanoid");

const generateShortCode = () => {
  const shortCode = nanoId.nanoid(6);
  return shortCode;
};

module.exports = generateShortCode;
