import { useEffect, useState } from "react";
import api, {
  login,
  logout,
  refreshAccessToken,
  getAccessToken,
} from "./authClient";

export default function App() {
  const [email, setEmail] = useState("eli@demo.com");
  const [password, setPassword] = useState("P@ssw0rd123");
  const [status, setStatus] = useState("");
  const [me, setMe] = useState(null);

  // On page load, try to refresh so user stays logged in after reload
  useEffect(() => {
    (async () => {
      try {
        await refreshAccessToken();
        setStatus("Refreshed session on load ✅");
      } catch {
        setStatus("Not logged in (no refresh cookie yet)");
      }
    })();
  }, []);

  async function handleLogin() {
    setStatus("Logging in...");
    try {
      await login(email, password);
      setStatus(
        "Logged in ✅ (access token in memory, refresh cookie in browser)"
      );
      setMe(null);
    } catch (e) {
      setStatus(e?.message || "Login failed");
    }
  }

  async function handleMe() {
    setStatus("Calling /me ...");
    try {
      const res = await api.get("/me"); // interceptors attach JWT + refresh on 401
      setMe(res.data);
      setStatus("Fetched /me ✅");
    } catch (e) {
      setMe(null);
      setStatus(e?.message || "Failed calling /me");
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setMe(null);
      setStatus("Logged out ✅ (refresh revoked + cookie cleared)");
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h2>JWT + Refresh Token Demo</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleMe}>Call /me (protected)</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Access token in memory?</strong>{" "}
        {getAccessToken() ? "Yes" : "No"}
      </div>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 12,
          borderRadius: 8,
        }}
      >
        {me ? JSON.stringify(me, null, 2) : "Click 'Call /me' to see data"}
      </pre>
    </div>
  );
}
