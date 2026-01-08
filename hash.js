const bcrypt = require("bcryptjs");

async function main() {
  const plainPassword = "P@ssw0rd123";        // pretend user typed this
  const saltRounds = 12;                      // work factor

  const hash = await bcrypt.hash(plainPassword, saltRounds);

  console.log("Plain:", plainPassword);
  console.log("Hash :", hash);
}

main();

