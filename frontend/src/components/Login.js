import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import api, { apiError } from "../api";
import { useAuth } from "./AuthContext";
import { AuthLayout, Notice, PasswordInput } from "./UI";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await api.post("/api/auth", {
        email: email.trim(),
        password,
      });
      signIn(response.data.data);
      navigate("/profile", {
        replace: true,
        state: { message: "Welcome back. You are signed in." },
      });
    } catch (err) {
      setError(
        apiError(
          err,
          "We could not sign you in. Check your email and password, then try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Your CocoHub account"
      title="Welcome back."
      description="A familiar place for fresh possibilities. Sign in to continue."
    >
      <Notice type="success">{location.state?.message}</Notice>
      <Notice>{error}</Notice>
      <form onSubmit={submit} aria-busy={busy}>
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            id="login-email"
            autoComplete="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="form-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
        <button className="btn btn-primary btn-full" disabled={busy}>
          {busy ? (
            "Signing in…"
          ) : (
            <>
              Sign in <FaArrowRight />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        New to CocoHub? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
