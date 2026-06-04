import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import { FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";
import Swal from 'sweetalert2';

function Login() {
    const [email, setEmail]             = useState("");
    const [password, setPassword]       = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    function sendData(e) {
        e.preventDefault();

        const userData = { email, password };

        axios.post("http://localhost:8000/api/auth", userData)
            .then((response) => {
                const { token, userId, name, email: userEmail, expectedRole } = response.data.data;

                localStorage.setItem("token", token);
                localStorage.setItem("userId", userId);
                localStorage.setItem("userName", name);
                localStorage.setItem("userEmail", userEmail);
                localStorage.setItem("userRole", expectedRole);

                Swal.fire({
                    icon: 'success',
                    title: `Welcome back, ${name}! 🎉`,
                    text: 'You have logged in successfully.',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });

                setTimeout(() => navigate("/profile"), 1600);
            })
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: err.response?.status === 401 ? 'Invalid Credentials' : 'Login Failed',
                    text: err.response?.data?.message || 'Invalid email or password. Please try again.',
                });
            });
    }

    return (
        <div className="form-container">
            <div className="auth-card">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #047857, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(5,150,105,0.3)',
                        fontSize: '1.6rem', color: '#fff'
                    }}>🔑</div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your CocoHub account</p>
                </div>

                <form onSubmit={sendData}>
                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="UserEmail" className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="UserEmail"
                            placeholder="you@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="Password" className="form-label">Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                id="Password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    {/* Forgot */}
                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.82rem' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit */}
                    <div className="signup-button-container" style={{ marginTop: '0.5rem' }}>
                        <button type="submit" className="signup-button" style={{ width: '100%', maxWidth: '100%' }}>
                            <FaSignInAlt /> Sign In
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.4rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Don't have an account?{' '}
                    <Link to="/signup">Create one here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
