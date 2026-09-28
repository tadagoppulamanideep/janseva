import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await api.post("/auth/register", {
                name,
                email,
                phone,
                password
            });

            if (response.data.success) {
                setMessage("Registration successful!");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* Left Side */}
            <div className="auth-info">

                <div className="auth-logo">
                    🏛️ <span>JanaSeva</span>
                </div>

                <h1>
                    Join your community
                    <span> and make a difference.</span>
                </h1>

                <p>
                    Create your JanaSeva account to report
                    civic problems, track complaints and
                    contribute to a better community.
                </p>

                <div className="auth-features">

                    <div>
                        <span>📝</span>
                        <p>Report civic problems easily</p>
                    </div>

                    <div>
                        <span>📍</span>
                        <p>Share the problem location</p>
                    </div>

                    <div>
                        <span>🔍</span>
                        <p>Track your reports anytime</p>
                    </div>

                </div>

            </div>


            {/* Register Card */}
            <div className="auth-card">

                <div className="auth-card-header">

                    <div className="auth-icon">
                        👤
                    </div>

                    <h2>Create Account</h2>

                    <p>
                        Register to start using JanaSeva
                    </p>

                </div>


                <form
                    onSubmit={handleRegister}
                    className="auth-form"
                >

                    {/* Name */}
                    <div className="auth-input-group">

                        <label>Full Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Enter your name"
                            required
                        />

                    </div>


                    {/* Email */}
                    <div className="auth-input-group">

                        <label>Email Address</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            required
                        />

                    </div>


                    {/* Phone */}
                    <div className="auth-input-group">

                        <label>Phone Number</label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                            placeholder="Enter your phone number"
                        />

                    </div>


                    {/* Password */}
                    <div className="auth-input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Create a password"
                            required
                        />

                    </div>


                    {/* Message */}
                    {message && (
                        <div
                            className={
                                message === "Registration successful!"
                                    ? "auth-message success"
                                    : "auth-message error"
                            }
                        >
                            {message}
                        </div>
                    )}


                    {/* Submit */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account →"}
                    </button>

                </form>


                {/* Login */}
                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <div className="auth-register">

                    <p>
                        Already have an account?
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="register-link"
                    >
                        Login to JanaSeva
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;