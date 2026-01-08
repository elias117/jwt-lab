const crypto = require("crypto");

const SECRET = "super-secret-key";

function sign(data) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");
}

const message = "userId=999";

const signature = sign(message);

console.log("Message  :", message);
console.log("Signature:", signature);

