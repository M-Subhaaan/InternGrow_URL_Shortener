const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const collectAnalytics = (req) => {
  // Get IP Address
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    req.ip;

  // Detect Browser & Device
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  // Detect Location
  const geo = geoip.lookup(ip);

  return {
    ipAddress: ip,

    browser: result.browser.name || "Unknown",

    operatingSystem: result.os.name || "Unknown",

    device: result.device.type || "Desktop",

    country: geo?.country || "Unknown",

    city: geo?.city || "Unknown",
  };
};

module.exports = collectAnalytics;
