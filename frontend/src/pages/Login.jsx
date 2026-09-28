import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/login", {
                email: email,
                password: password
            });

            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                setMessage("Login successful!");

                const role = response.data.user.role;

                if (role === "citizen") {
                    navigate("/dashboard");
                } else if (role === "department") {
                    navigate("/department");
                } else if (role === "admin") {
                    navigate("/admin");
                }
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div>
            <h1>JanSeva</h1>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <div>
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    Login
                </button>

            </form>

            <p>{message}</p>
            <br />

            <button onClick={() => navigate("/register")}>
                New User? Create a new account
            </button>
        </div>
    );
}

export default Login;