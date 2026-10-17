import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { apiError } from "../api";
import { AuthLayout, Notice, PasswordInput } from "./UI";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password))
      return setError(
        "Use at least 8 characters, including letters and numbers.",
      );
    setBusy(true);
    try {
      await api.put("/user/forgot-password", {
        email: email.trim(),
        newPassword: password,
      });
      navigate("/login", {
        state: {
          message: "Your password was updated. Sign in with your new password.",
        },
      });
    } catch (err) {
      setError(
        apiError(err, "We could not reset your password. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      eyebrow="Account support"
      title="A fresh start."
      description="Enter your registered email and choose a new password."
    >
      <Notice>{error}</Notice>
      <form onSubmit={submit} aria-busy={busy}>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-email">
            Registered email address
          </label>
          <input
            className="form-control"
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput
          id="reset-password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          guidance="At least 8 characters, including letters and numbers."
        />
        <button className="btn btn-primary btn-full" disabled={busy}>
          {busy ? "Updating password…" : "Reset password"}
        </button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
