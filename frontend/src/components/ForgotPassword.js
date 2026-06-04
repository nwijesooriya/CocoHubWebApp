import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import '../App.css';

function ForgotPassword() {
    const [email, setEmail]               = useState("");
    const [newPassword, setNewPassword]   = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = (e) => {
        e.preventDefault();

        axios.put("http://localhost:8000/user/forgot-password", { email, newPassword })
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Password Reset! 🔒",
                    text: "You can now login with your new password.",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setTimeout(() => navigate("/login"), 2200);
            })
            .catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "Reset Failed",
                    text: err.response?.data?.message || "Something went wrong. Please try again.",
                });
            });
    };

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
                        fontSize: '1.5rem', color: '#fff'
                    }}>
                        <FaLock />
                    </div>
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">Enter your email and choose a new password</p>
                </div>

                <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                        <label htmlFor="Email" className="form-label">Registered Email Address</label>
                        <input
                            type="email" className="form-control" id="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="NewPassword" className="form-label">New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="form-control" id="NewPassword"
                                placeholder="Min. 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <span className="eye-icon2" onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <div className="signup-button-container" style={{ marginTop: '1.5rem' }}>
                        <button type="submit" className="signup-button" style={{ width: '100%', maxWidth: '100%' }}>
                            🔒 Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;