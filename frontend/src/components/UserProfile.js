import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaCamera,
  FaUser,
  FaLock,
  FaUsers,
  FaSignOutAlt,
  FaPen,
  FaArrowRight,
  FaCalendarAlt,
  FaHistory,
  FaComments,
} from "react-icons/fa";
import api, { API_URL, apiError } from "../api";
import { useAuth } from "./AuthContext";
import {
  PageHeader,
  Notice,
  Loading,
  PasswordInput,
  initials,
  formatDate,
} from "./UI";

export default function UserProfile() {
  const { user, signOut, updateIdentity } = useAuth();
  const userId = user?.userId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("personal");
  const [edit, setEdit] = useState("");
  const [draft, setDraft] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const fileRef = useRef(null);
  const cancelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fullImage = (value) =>
    !value ? "" : value.startsWith("http") ? value : `${API_URL}${value}`;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    api
      .get(`/user/get/${userId}`)
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (active)
          setError(
            apiError(err, "We could not load your profile. Please try again."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);
  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  useEffect(() => {
    if (!image) return;
    const previous = document.activeElement;
    cancelRef.current?.focus();
    const keydown = (e) => {
      if (e.key === "Escape" && !busy) setImage(null);
      if (e.key === "Tab") {
        const buttons = Array.from(
          document.querySelectorAll(".upload-modal button:not(:disabled)"),
        );
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [image, busy]);

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!draft.trim()) return setError("Please enter a value before saving.");
    setBusy(true);
    try {
      await api.put(`/user/update/${userId}`, {
        field: edit,
        value: draft.trim(),
      });
      setData((previous) => ({ ...previous, [edit]: draft.trim() }));
      updateIdentity(edit, draft.trim());
      setEdit("");
      setMessage("Your profile has been updated.");
    } catch (err) {
      setError(apiError(err, "Your changes could not be saved."));
    } finally {
      setBusy(false);
    }
  }
  function selectImage(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return setError("Choose an image smaller than 5 MB.");
    setError("");
    setImage(file);
  }
  async function upload() {
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("profileImage", image);
    form.append("userId", userId);
    try {
      const res = await api.post("/user/upload-image", form);
      setData((previous) => ({ ...previous, profileImage: res.data.imageUrl }));
      setImageFailed(false);
      setImage(null);
      setMessage("Your profile photo has been updated.");
    } catch (err) {
      setError(
        apiError(err, "We could not upload your image. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }
  function logout() {
    signOut();
    navigate("/login", { replace: true });
  }
  async function deleteAccount(e) {
    e.preventDefault();
    setError("");
    const result = await Swal.fire({
      title: "Delete your account?",
      text: "Your account will be permanently removed. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete my account",
      confirmButtonColor: "#ae3b32",
      cancelButtonText: "Keep my account",
    });
    if (!result.isConfirmed) return;
    setBusy(true);
    try {
      await api.delete(`/user/delete/${userId}`, {
        data: { currentPassword: password, requesterId: userId },
      });
      signOut();
      navigate("/login", {
        state: { message: "Your account has been deleted." },
      });
    } catch (err) {
      setError(apiError(err, "Your account could not be deleted."));
    } finally {
      setBusy(false);
    }
  }

  if (!userId)
    return (
      <div className="page-container page-space">
        <div className="surface empty-state">
          <FaUser />
          <h1>A space of your own.</h1>
          <p>Sign in to view your profile and manage your account.</p>
          <Link className="btn btn-primary" to="/login">
            Sign in <FaArrowRight />
          </Link>
        </div>
      </div>
    );
  if (loading) return <Loading text="Loading your account…" />;
  if (!data)
    return (
      <div className="page-container page-space">
        <Notice>{error}</Notice>
        <button
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  const fields = [
    { key: "name", label: "Full name", type: "text" },
    { key: "email", label: "Email address", type: "email" },
    { key: "mobile", label: "Mobile number", type: "tel" },
  ];

  return (
    <div className="page-container page-space">
      <PageHeader
        eyebrow="Your CocoHub"
        title={`Hello, ${data.name.split(" ")[0]}.`}
        description="Your details, your connections, your corner of CocoHub."
      />
      <Notice type="success">{message || location.state?.message}</Notice>
      {!image && <Notice>{error}</Notice>}
      <div className="profile-grid">
        <aside className="surface profile-sidebar">
          <div className="profile-avatar-wrapper">
            {data.profileImage && !imageFailed ? (
              <img
                className="profile-avatar-main"
                src={fullImage(data.profileImage)}
                alt={`${data.name}'s profile`}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="profile-avatar-main avatar-initials">
                {initials(data.name)}
              </span>
            )}
            <button
              className="avatar-edit-badge"
              aria-label="Change profile photo"
              onClick={() => fileRef.current?.click()}
            >
              <FaCamera />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={selectImage}
            />
          </div>
          <h2>{data.name}</h2>
          <span className="product-tag">
            {data.expectedRole?.replace("_", " ")}
          </span>
          <nav className="profile-nav" aria-label="Account sections">
            <button
              className={tab === "personal" ? "active" : ""}
              onClick={() => {
                setTab("personal");
                setError("");
              }}
            >
              <FaUser /> Personal details
            </button>
            <button
              className={tab === "security" ? "active" : ""}
              onClick={() => {
                setTab("security");
                setError("");
              }}
            >
              <FaLock /> Account security
            </button>
            {["Admin", "Manager"].includes(data.expectedRole) && (
              <Link to="/manage-users">
                <FaUsers /> Manage users
              </Link>
            )}
            <Link to="/feedback">
              <FaComments /> Customer feedback
            </Link>
          </nav>
          <button className="btn btn-secondary btn-full" onClick={logout}>
            <FaSignOutAlt /> Sign out
          </button>
        </aside>
        <div className="profile-main-content">
          <div className="stats-row">
            <div className="surface stat-card">
              <FaCalendarAlt />
              <div>
                <span>Member since</span>
                <strong>{formatDate(data.createdAt)}</strong>
              </div>
            </div>
            <div className="surface stat-card">
              <FaHistory />
              <div>
                <span>Last signed in</span>
                <strong>{formatDate(data.lastLogin)}</strong>
              </div>
            </div>
          </div>
          {tab === "personal" ? (
            <section className="surface profile-section-card">
              <div className="card-heading">
                <div>
                  <h2>Personal details</h2>
                  <p>Keep your account information up to date.</p>
                </div>
              </div>
              <div className="info-grid">
                {fields.map((field) => (
                  <div className="info-item" key={field.key}>
                    <span className="detail-label">{field.label}</span>
                    {edit === field.key ? (
                      <form onSubmit={save}>
                        <label
                          className="visually-hidden"
                          htmlFor={`edit-${field.key}`}
                        >
                          {field.label}
                        </label>
                        <input
                          className="form-control"
                          id={`edit-${field.key}`}
                          autoFocus
                          type={field.type}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          pattern={
                            field.key === "mobile" ? "[0-9]{10}" : undefined
                          }
                          maxLength={field.key === "mobile" ? 10 : undefined}
                          required
                        />
                        <div className="button-row">
                          <button
                            className="btn btn-primary btn-small"
                            disabled={busy}
                          >
                            {busy ? "Saving…" : "Save"}
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            type="button"
                            disabled={busy}
                            onClick={() => setEdit("")}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="value-wrapper">
                        <span>{data[field.key] || "Not provided"}</span>
                        <button
                          className="icon-button"
                          aria-label={`Edit ${field.label.toLowerCase()}`}
                          onClick={() => {
                            setEdit(field.key);
                            setDraft(data[field.key] || "");
                            setError("");
                          }}
                        >
                          <FaPen />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="info-item">
                  <span className="detail-label">Date of birth</span>
                  <div className="value-wrapper">{formatDate(data.dob)}</div>
                </div>
                <div className="info-item">
                  <span className="detail-label">Gender</span>
                  <div className="value-wrapper">{data.gender}</div>
                </div>
                <div className="info-item">
                  <span className="detail-label">Account role</span>
                  <div className="value-wrapper">
                    {data.expectedRole?.replace("_", " ")}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="surface profile-section-card">
              <div className="card-heading">
                <div>
                  <h2>Account security</h2>
                  <p>Manage your password and account.</p>
                </div>
              </div>
              <div className="security-password">
                <div>
                  <h3>Change your password</h3>
                  <p>Choose a new password for your next sign in.</p>
                </div>
                <Link
                  to="/forgot-password"
                  className="btn btn-secondary btn-small"
                >
                  Reset password
                </Link>
              </div>
              <div className="danger-panel account-danger">
                <h3>Delete account</h3>
                <p>
                  This permanently removes your CocoHub account. Enter your
                  current password, then confirm your decision.
                </p>
                <form onSubmit={deleteAccount}>
                  <PasswordInput
                    id="delete-password"
                    label="Current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="btn btn-danger" disabled={busy}>
                    {busy ? "Deleting…" : "Delete my account"}
                  </button>
                </form>
              </div>
            </section>
          )}
          <div className="profile-feedback-cta">
            <span className="round-icon">
              <FaComments />
            </span>
            <div>
              <h3>Have something to share?</h3>
              <p>Your experience helps our community grow.</p>
            </div>
            <Link to="/add" className="text-link">
              Write a review <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
      {image && (
        <div className="upload-overlay">
          <section
            className="upload-modal surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
          >
            <h2 id="upload-title">A fresh profile photo.</h2>
            <p>Preview your image before uploading.</p>
            <Notice>{error}</Notice>
            <img
              className="upload-preview-circle"
              src={preview}
              alt="New profile preview"
            />
            <div className="button-row">
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={upload}
              >
                {busy ? "Uploading…" : "Upload photo"}
              </button>
              <button
                ref={cancelRef}
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => setImage(null)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
