import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaRegCommentDots,
  FaShieldAlt,
  FaRegClock,
} from "react-icons/fa";
import api, { apiError } from "../api";
import { PageHeader, Notice, Stars } from "./UI";

// These values match the existing Feedback schema, including its original spelling.
export const PRODUCTS = [
  "Coconut Milk Powder",
  "Coconut Shell",
  "Coconut Shell Charcol",
  "Fiber rope",
  "Coconut Oil",
  "Husk",
  "Coconut Shell Cups",
  "Coconut Shell Spoons",
  "Other Products",
];
export const productLabel = (value) =>
  value === "Coconut Shell Charcol" ? "Coconut Shell Charcoal" : value;

export default function AddFeedback() {
  const [form, setForm] = useState({
    customerName: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    comment: "",
    productItem: "",
    rating: 0,
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.customerName.trim() || !form.comment.trim())
      return setError("Please enter your name and a comment.");
    if (!form.rating)
      return setError("Choose a rating to share your experience.");
    if (!consent) return setError("Please agree to publish your review.");
    setBusy(true);
    try {
      await api.post("/feedback/add", {
        ...form,
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        comment: form.comment.trim(),
      });
      navigate("/feedback", {
        state: { message: "Thank you! Your feedback has been published." },
      });
    } catch (err) {
      setError(
        apiError(err, "We could not publish your feedback. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-container page-space">
      <PageHeader
        eyebrow="Customer connections"
        title="Your experience matters."
        description="Tell us what worked, what you loved, and where we can grow."
      />
      <div className="feedback-form-layout">
        <section className="surface form-surface">
          <div className="card-heading">
            <span className="round-icon">
              <FaRegCommentDots />
            </span>
            <div>
              <h2>Share your feedback</h2>
              <p>A few words can make a difference.</p>
            </div>
          </div>
          <Notice>{error}</Notice>
          <form onSubmit={submit} aria-busy={busy}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="feedback-name">
                  Your name
                </label>
                <input
                  className="form-control"
                  id="feedback-name"
                  name="customerName"
                  value={form.customerName}
                  onChange={change}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="feedback-email">
                  Email address
                </label>
                <input
                  className="form-control"
                  id="feedback-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="feedback-product">
                Which product is your feedback about?
              </label>
              <select
                className="form-select"
                id="feedback-product"
                name="productItem"
                value={form.productItem}
                onChange={change}
                required
              >
                <option value="">Choose a product</option>
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>
                    {productLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            <Stars
              value={form.rating}
              onChange={(rating) => setForm({ ...form, rating })}
            />
            <div className="form-group">
              <label className="form-label" htmlFor="feedback-comment">
                Your feedback
              </label>
              <textarea
                id="feedback-comment"
                name="comment"
                className="form-control"
                value={form.comment}
                onChange={change}
                rows={5}
                placeholder="Share your experience with this product…"
                required
              />
              <p className="form-text">
                Please keep your feedback helpful and avoid sharing sensitive
                information.
              </p>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              I agree to have my name, rating, and feedback published on
              CocoHub.
            </label>
            <div className="form-footer">
              <Link to="/feedback" className="text-link">
                Back to feedback
              </Link>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? (
                  "Publishing…"
                ) : (
                  <>
                    Publish feedback <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
        <aside className="feedback-guidance">
          <p className="eyebrow">A little good to know</p>
          <h2>
            Honest feedback.
            <br />
            Better connections.
          </h2>
          <div>
            <FaShieldAlt />
            <h3>Your email stays masked</h3>
            <p>
              Public review cards only show a partially hidden email address.
            </p>
          </div>
          <div>
            <FaRegCommentDots />
            <h3>You're in control</h3>
            <p>
              Use the same email to confirm an update or deletion of your
              review.
            </p>
          </div>
          <div>
            <FaRegClock />
            <h3>We'll handle the date</h3>
            <p>Your feedback is dated automatically when you publish it.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
