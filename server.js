const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
// ✅ Middleware #1: parse JSON request bodies
app.use(express.json());
// ✅ Middleware #2: parse Cookie header into req.cookies
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex"); // this will hash a token
}

function makeAccessToken(user) {
    const payload = { sub: user.id, role: user.role };
    // sub = subject (standard JWT claim)
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
}

function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}

function requireAuth(req, res, next) {
    const auth = req.headers.authorization; // Bearer <token>
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Bearer token" });
    }
    const token = auth.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

app.post("/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, passwordHash },
        select: { id: true, email: true },
    });

    res.status(201).json({ id: user.id, email: user.email });
});

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordCheck = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCheck) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = makeAccessToken(user);

    const refreshToken = makeRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashedRefreshToken,
            expiresAt: expiresAt,
        },
    });

    // create a cookie
    res.cookie(process.env.REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        path: "/",
    });
    // send back jwt
    res.json({ accessToken });
});

app.post("/refresh", async (req, res) => {
    const refreshToken = req.cookies[process.env.REFRESH_COOKIE_NAME];

    const tokenHash = hashToken(refreshToken);
    const record = await prisma.refreshToken.findUnique({where: {tokenHash}});
    const user = await prisma.user.findUnique({where: {id: record.userId}});

    if (record.expiresAt <= new Date()) {
        await prisma.refreshToken.deleteMany({
            where: { tokenHash },
        });
        res.status(401).json({"message": "Please login again."})
    }
    const accessToken = makeAccessToken(user);
    res.json({ accessToken });
});

app.post("/logout", async (req, res) => {
    const refreshToken = req.cookies[process.env.REFRESH_COOKIE_NAME];
    if (refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await prisma.refreshToken.deleteMany({
            where: { tokenHash },
        });
    }

    res.clearCookie(process.env.REFRESH_COOKIE_NAME, { path: "/" });
    res.json({ ok: true });
});

app.get("/me", requireAuth, (req, res) => {
    res.json({ youAre: req.user });
});
// A simple route
app.get("/health", (req, res) => {
    res.json({
        ok: true,
        message: "Server is running",
        cookies: `All of the cookies are here: ${JSON.stringify(req.cookies)}`,
    });
});

app.listen(3000, () => {
    console.log("API listening on http://localhost:3000");
});
