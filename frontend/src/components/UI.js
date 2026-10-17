import React from "react";
import { FaEye, FaEyeSlash, FaLeaf, FaStar } from "react-icons/fa";
import farm from "../images/cocofarm.jpg";

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export function Notice({ children, type = "error" }) {
  return children ? (
    <div
      className={`notice notice-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  ) : null;
}

export function Loading({ text = "Loading…" }) {
  return (
    <div className="empty-state" role="status">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

export function PasswordInput({
  id,
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  guidance,
  minLength,
}) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="password-wrapper">
        <input
          className="form-control"
          type={visible ? "text" : "password"}
          id={id}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          aria-describedby={guidance ? `${id}-help` : undefined}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {guidance && (
        <p className="form-text" id={`${id}-help`}>
          {guidance}
        </p>
      )}
    </div>
  );
}

export function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <div className="page-container auth-layout">
      <aside
        className="auth-story"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(16,49,36,.12), rgba(16,49,36,.94)), url(${farm})`,
        }}
      >
        <span className="story-label">
          <FaLeaf /> Rooted in nature. Connected by CocoHub.
        </span>
        <div>
          <p className="eyebrow">A little closer to nature</p>
          <h2>
            Good things
            <br /> grow together.
          </h2>
          <p>
            Discover coconut products, connect with our community, and help
            shape a better CocoHub.
          </p>
          <span className="story-caption">
            Coconut products · People · Possibilities
          </span>
        </div>
      </aside>
      <section className="auth-card">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
        {children}
      </section>
    </div>
  );
}

export function Stars({ value = 0, onChange, id = "rating" }) {
  if (!onChange)
    return (
      <span className="stars" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <FaStar
            key={n}
            className={n <= value ? "filled" : ""}
            aria-hidden="true"
          />
        ))}
      </span>
    );
  return (
    <fieldset className="rating-field">
      <legend className="form-label">Rating</legend>
      <div className="rating-options">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= value ? "filled" : ""}>
            <input
              type="radio"
              name={id}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              required
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            />
            <FaStar aria-hidden="true" />
          </label>
        ))}
        <span>
          {
            [
              "Choose a rating",
              "Poor",
              "Fair",
              "Good",
              "Very good",
              "Excellent",
            ][value]
          }
        </span>
      </div>
    </fieldset>
  );
}

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
export const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  return domain
    ? `${name.slice(0, Math.min(3, Math.max(1, name.length - 1)))}***@${domain}`
    : "Email hidden";
};
export const formatDate = (value) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
