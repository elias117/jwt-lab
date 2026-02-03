import { useState, useEffect } from "react";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accessToken, setAccessToken] = useState(null);
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        async function fetchMe() {
            if (accessToken) {
                const response = await fetch("http://localhost:3000/me", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: "include",
                });
                const data = await response.json();
                setUserData(data.youAre);
            }
        }
        fetchMe();
    }, [accessToken]);

    return (
        <div className="h-screen flex flex-col justify-center items-center gap-8">
            {!accessToken ? (
                <form
                    className="flex flex-col justify-center items-center gap-4"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const response = await fetch(
                            "http://localhost:3000/login",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ email, password }),
                                credentials: "include",
                            },
                        );
                        const data = await response.json();
                        setAccessToken(data.accessToken);
                    }}
                >
                    <input
                        className="border-2 px-2 border-black rounded"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <input
                        type="password"
                        className="border-2 px-2 border-black rounded"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        type="submit"
                    >
                        Login
                    </button>
                </form>
            ) : (
                <>
                    <p>You are logged in. Access Token is set to {accessToken}</p>
                    {userData && (
                        <p>User ID: {userData.sub}, Role: {userData.role}</p>
                    )}
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={async () => {
                            const response = await fetch(
                                "http://localhost:3000/logout",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    credentials: "include",
                                },
                            );
                            const data = await response.json();
                            console.log(data);
                            setAccessToken(null);
                            setUserData(null);
                        }}
                    >
                        Logout
                    </button>
                </>
            )}
        </div>
    );
}

export default App;
