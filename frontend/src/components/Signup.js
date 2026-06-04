import React, { useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import '../App.css';
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import Swal from 'sweetalert2';

function Signup() {
    const [name, setName]               = useState("");
    const [email, setEmail]             = useState("");
    const [password, setPassword]       = useState("");
    const [dob, setDob]                 = useState("");
    const [gender, setGender]           = useState("");
    const [expectedRole, setExpectedRole] = useState("");
    const [mobile, setMobile]           = useState("");
    const [isChecked, setIsChecked]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function sendData(e) {
        e.preventDefault();

        if (!isChecked) {
            Swal.fire({ icon: 'warning', title: 'Terms Required', text: 'You must agree to the Terms & Conditions.' });
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Password must be at least 8 characters long and include both letters and numbers.' });
            return;
        }

        const newUser = { name, email, password, dob, gender, expectedRole, mobile };

        axios.post("http://localhost:8000/user/add", newUser)
            .then((response) => {
                localStorage.setItem("userId", response.data.data);
                Swal.fire({
                    icon: 'success',
                    title: '🎉 Registration Successful!',
                    text: 'Welcome to CocoHub! You can now login.',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                setTimeout(() => { window.location.href = "/login"; }, 2100);
            })
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: err.response?.data?.message || err.message,
                    confirmButtonColor: '#d33',
                });
            });
    }

    return (
        <div className="form-container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
            <div className="auth-card" style={{ maxWidth: 540 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #047857, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(5,150,105,0.3)',
                        fontSize: '1.5rem', color: '#fff'
                    }}>🤵</div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join CocoHub — your coconut marketplace</p>
                </div>

                <form onSubmit={sendData}>
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="UserName" className="form-label">Full Name</label>
                        <input type="text" className="form-control" id="UserName"
                            placeholder="Enter your full name"
                            onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="UserEmail" className="form-label">Email Address</label>
                        <input type="email" className="form-control" id="UserEmail"
                            placeholder="you@example.com"
                            onChange={(e) => setEmail(e.target.value)} required />
                        <p className="form-text">We'll never share your email with anyone.</p>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="Password" className="form-label">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control" id="Password"
                                placeholder="Min. 8 chars with letters & numbers"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    {/* Mobile */}
                    <div className="form-group">
                        <label htmlFor="UserMobile" className="form-label">Mobile Number</label>
                        <input type="text" className="form-control" id="UserMobile"
                            placeholder="07XXXXXXXX" value={mobile}
                            onChange={(e) => {
                                const input = e.target.value;
                                if (/^\d{0,10}$/.test(input)) setMobile(input);
                            }} required />
                    </div>

                    {/* DOB + Gender side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                            <label htmlFor="dob" className="form-label">Date of Birth</label>
                            <input type="date" className="form-control" id="dob"
                                onChange={(e) => setDob(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender" className="form-label">Gender</label>
                            <select className="form-select" id="gender"
                                onChange={(e) => setGender(e.target.value)} required>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <label htmlFor="expectedRole" className="form-label">Expected Role</label>
                        <select className="form-select" id="expectedRole"
                            onChange={(e) => setExpectedRole(e.target.value)} required>
                            <option value="">Select a role</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Supplier">Supplier</option>
                            <option value="Delivery_person">Delivery Person</option>
                            <option value="Customer">Customer</option>
                        </select>
                    </div>

                    {/* Terms */}
                    <div className="form-check" style={{ marginBottom: '1.2rem' }}>
                        <input type="checkbox" className="form-check-input" id="TermsCheck"
                            onChange={(e) => setIsChecked(e.target.checked)} />
                        <label className="form-check-label" htmlFor="TermsCheck">
                            I agree to the <a href="/">Terms &amp; Conditions</a>
                        </label>
                    </div>

                    <div className="signup-button-container" style={{ marginTop: '0' }}>
                        <button type="submit" className="signup-button" style={{ width: '100%', maxWidth: '100%' }}>
                            <FaUserPlus /> Create Account
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.4rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Already have an account? <Link to="/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;