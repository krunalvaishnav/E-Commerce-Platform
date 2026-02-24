const https = require("https");

const normalizeIp = (rawIp) => {
  if (!rawIp) {
    return null;
  }
  const first = String(rawIp).split(",")[0].trim();
  if (first.startsWith("::ffff:")) {
    return first.replace("::ffff:", "");
  }
  return first;
};

const fetchIpDetails = (rawIp) => {
  const ip = normalizeIp(rawIp);
  if (!ip) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const url = `https://ipinfo.io/${ip}/json`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            console.log(parsed);
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error("IP lookup failed"));
            }
            return resolve(parsed);
          } catch (error) {
            return reject(error);
          }
        });
      })
      .on("error", reject);
  });
};

module.exports = {
  normalizeIp,
  fetchIpDetails,
};
