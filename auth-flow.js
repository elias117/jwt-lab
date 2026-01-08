const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TOKEN_SECRET = "access-secret-change-me";
const REFRESH_TOKEN_SECRET = "refresh-secret-change-me";

const db = {
  users: [
    // imagine this came from Postgres
    // { id: 1, email: "a@a.com", passwordHash: "..." }
  ],
  refreshTokens: [
    // { userId: 1, tokenHash: "..." }
  ],
};

function hashToken(token){
	return crypto.createHash("sha256").update(token).digest("hex"); // this will hash a token
}

async function register(email, password) {
	const passwordHash = await bcrypt.hash(password, 12); // create a password hash with bcrypt
	const user = { id: db.users.length + 1, email, passwordHash };
	db.users.push(user);
	return user
}

async function login(email, password) {
	let foundUser = 0;
	for(let i = 0; i<db.users.length; i++){
		if(email == db.users[i].email){
			founduser = db.users[i];	
		}
	}
	const passwordCheck = await bcrypt.compare(password, founduser.passwordHash); // compare passwword to make sure they match with bcrypt
	if(!passwordCheck){
		throw new Error("Invalid credentials");
	}
	
	const payload = {sub: founduser.id, role: "user"};
	const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: "15m"}) // create a jwt token
	
	const refreshToken = crypto.randomBytes(32).toString("hex"); // create a refresh token with a random string
	const hashedRefreshToken = hashToken(refreshToken);
	
	const refreshTokenObject = {userId: founduser.id, tokenHash: hashedRefreshToken}
	db.refreshTokens.push(refreshTokenObject);

	return {accessToken, refreshToken};
	
}

function verifyAccessToken(token) {
	return jwt.verify(token, ACCESS_TOKEN_SECRET); // verify the JWT tokens and retrieve the payload from the token as an Object
}

function refresh(refreshToken) {

	const tokenHash = hashToken(refreshToken);
	
	const record = db.refreshTokens.find((rt) => rt.tokenHash === tokenHash);
	if(!record){
		throw new Error("Refresh token revoked/invalid please log in again");	
	}
	const payload = { sub: record.userId, role: "user"};
	const newAccessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: "15m"}); //  create a jwt token
	
	return { accessToken: newAccessToken };
}

function logout(refreshToken){
	const tokenHash = hashToken(refreshToken);
	db.refreshtokens = db.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
}


(async function demo() {
  console.log("\n--- Register ---");
  const user = await register("eli@demo.com", "P@ssw0rd123");
  console.log("User in DB:", { id: user.id, email: user.email });

  console.log("\n--- Login ---");
  const tokens = await login("eli@demo.com", "P@ssw0rd123");
  console.log("Access token:", tokens.accessToken);
  console.log("Refresh token:", tokens.refreshToken);

  console.log("\n--- Use access token ---");
  const claims = verifyAccessToken(tokens.accessToken);
  console.log("Claims:", claims);

  console.log("\n--- Refresh (get new access token) ---");
  const newTokens = refresh(tokens.refreshToken);
  console.log("New access token:", newTokens.accessToken);

  console.log("\n--- Logout (revoke refresh token) ---");
  logout(tokens.refreshToken);

  console.log("\n--- Try refresh again (should fail) ---");
  try {
    refresh(tokens.refreshToken);
  } catch (e) {
    console.log("Expected failure:", e.message);
  }
})();
