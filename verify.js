const bcrypt = require("bcryptjs");

async function main() {
  const password = "P@ssw0rd123";

  const hash1 = await bcrypt.hash(password, 12);
  const hash2 = await bcrypt.hash(password, 12);

  console.log("hash1 === hash2 ?", hash1 === hash2);

  const ok1 = await bcrypt.compare(password, hash1);
  const ok2 = await bcrypt.compare(password, hash2);

  console.log("password matches hash1?", ok1);
  console.log("password matches hash2?", ok2);
}

main();

