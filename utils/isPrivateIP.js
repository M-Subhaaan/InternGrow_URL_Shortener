const dns = require("dns").promises;

const privateRanges = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

const isPrivateIP = (ip) => privateRanges.some((r) => r.test(ip));

const resolvesToPrivateIP = async (hostname) => {
  if (hostname === "localhost") return true;
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    return addresses.some((a) => isPrivateIP(a.address));
  } catch {
    return true; // fail closed — if we can't resolve it, don't trust it
  }
};

module.exports = resolvesToPrivateIP;
