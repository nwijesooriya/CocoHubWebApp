import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import api, { apiError } from "../api";
import { AuthLayout, Notice, PasswordInput } from "./UI";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    expectedRole: "",
    mobile: "",
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const strong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password);
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!strong)
      return setError(
        "Use at least 8 characters, including letters and numbers.",
      );
    if (!consent)
      return setError("Please confirm your account details before continuing.");
    setBusy(true);
    try {
      await api.post("/user/add", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      navigate("/login", {
        state: { message: "Your account is ready. Sign in to get started." },
      });
    } catch (err) {
      setError(
        apiError(err, "We could not create your account. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Join the CocoHub community"
      title="Let's grow together."
      description="Create your account. A world of coconut possibilities awaits."
    >
      <Notice>{error}</Notice>
      <form onSubmit={submit} aria-busy={busy}>
        <div className="form-group">
          <label htmlFor="signup-name" className="form-label">
            Full name
          </label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            className="form-control"
            value={form.name}
            onChange={change}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            id="signup-email"
            name="email"
            autoComplete="email"
            className="form-control"
            value={form.email}
            onChange={change}
            placeholder="you@example.com"
            required
          />
        </div>
        <PasswordInput
          id="signup-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          minLength={8}
          guidance="At least 8 characters, including letters and numbers."
        />
        {form.password && (
          <p
            className={`password-guidance ${strong ? "is-valid" : ""}`}
            aria-live="polite"
          >
            {strong ? (
              <>
                <FaCheck /> Password meets the requirements
              </>
            ) : (
              "Add letters and numbers to make your password stronger."
            )}
          </p>
        )}
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="signup-mobile" className="form-label">
              Mobile number
            </label>
            <input
              type="tel"
              id="signup-mobile"
              name="mobile"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              className="form-control"
              value={form.mobile}
              onChange={change}
              placeholder="07XXXXXXXX"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signup-dob" className="form-label">
              Date of birth
            </label>
            <input
              type="date"
              id="signup-dob"
              name="dob"
              autoComplete="bday"
              max={maxDate}
              className="form-control"
              value={form.dob}
              onChange={change}
              required
            />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="signup-gender" className="form-label">
              Gender
            </label>
            <select
              id="signup-gender"
              name="gender"
              className="form-select"
              value={form.gender}
              onChange={change}
              required
            >
              <option value="">Select gender</option>
              {["Male", "Female", "Other"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="signup-role" className="form-label">
              Account role
            </label>
            <select
              id="signup-role"
              name="expectedRole"
              className="form-select"
              value={form.expectedRole}
              onChange={change}
              required
            >
              <option value="">Select your role</option>
              {[
                "Admin",
                "Manager",
                "Supplier",
                "Delivery_person",
                "Customer",
              ].map((x) => (
                <option key={x} value={x}>
                  {x.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          I confirm these details are correct and want to create a CocoHub
          account.
        </label>
        <button className="btn btn-primary btn-full" disabled={busy}>
          {busy ? (
            "Creating your account…"
          ) : (
            <>
              Create account <FaArrowRight />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
