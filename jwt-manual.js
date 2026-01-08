const crypto = require("crypto");

const SECRET = "super-secret-key";

// helper: base64url encode
function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
}

// 1️⃣ Header
const header = {
  alg: "HS256",
  typ: "JWT",
};

// 2️⃣ Payload
const payload = {
  userId: 123,
  role: "user",
  exp: Math.floor(Date.now() / 1000) + 60, // expires in 60s
};

// encode
const encodedHeader = base64url(header);
const encodedPayload = base64url(payload);

// 3️⃣ Signature
const dataToSign = `${encodedHeader}.${encodedPayload}`;
const signature = sign(dataToSign);

// Final JWT
const jwt = `${dataToSign}.${signature}`;

console.log("JWT:\n", jwt);

