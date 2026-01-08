const crypto = require("crypto");

const SECRET = "super-secret-key";

// paste your JWT here
const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6InVzZXIiLCJleHAiOjE3Njc3MjQzODF9.zxwKYGuDnJgTGu3Q7arPkQavmcmzyFsFs6pOhe5P3fg";

function verify(jwt) {
  const [header, payload, signature] = jwt.split(".");

  const data = `${header}.${payload}`;

  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  const decodedPayload = JSON.parse(
    Buffer.from(payload, "base64").toString()
  );

  if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return decodedPayload;
}

try {
  const user = verify(jwt);
  console.log("Token valid:", user);
} catch (err) {
  console.error("Token rejected:", err.message);
}

