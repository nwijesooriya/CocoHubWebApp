import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  FaArrowRight,
  FaSearch,
  FaThLarge,
  FaList,
  FaPen,
  FaTrashAlt,
  FaDownload,
  FaChartBar,
  FaComments,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api, { apiError } from "../api";
import {
  PageHeader,
  Notice,
  Loading,
  Stars,
  initials,
  maskEmail,
  formatDate,
} from "./UI";
import { productLabel } from "./AddFeedback";

// Defined outside ViewFeedback so typing never remounts the form or loses focus.
function FeedbackAction({ feedback, action, onCancel, onSaved, onDeleted }) {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [comment, setComment] = useState(feedback.comment);
  const [rating, setRating] = useState(feedback.rating);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function verify(e) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== feedback.email?.trim().toLowerCase()) {
      setError(
        "That email does not match this review. Use the email you originally submitted.",
      );
      return;
    }
    setError("");
    setVerified(true);
  }
  async function confirm(e) {
    e.preventDefault();
    setError("");
    if (action === "edit" && !comment.trim())
      return setError("Please add a comment before saving.");
    setBusy(true);
    try {
      if (action === "edit") {
        await api.put(`/feedback/update/${feedback._id}`, {
          email: email.trim(),
          comment: comment.trim(),
          rating,
        });
        onSaved({
          ...feedback,
          comment: comment.trim(),
          rating,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await api.delete(`/feedback/delete/${feedback._id}`, {
          data: { email: email.trim() },
        });
        onDeleted(feedback._id);
      }
    } catch (err) {
      setError(
        apiError(
          err,
          `We could not ${action === "edit" ? "update" : "delete"} this feedback. Please try again.`,
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  const id = `action-${feedback._id}`;
  return (
    <section
      className={`feedback-action ${action === "delete" ? "danger-panel" : ""}`}
      aria-label={`${action === "edit" ? "Update" : "Delete"} feedback by ${feedback.customerName}`}
    >
      <h3>
        {verified
          ? action === "edit"
            ? "Make it yours, again."
            : "Delete this feedback?"
          : "First, confirm your email"}
      </h3>
      <p>
        {verified
          ? action === "edit"
            ? "Update your comment and rating below."
            : "This permanently removes your review. This action cannot be undone."
          : "Enter the email you used to publish this review."}
      </p>
      <Notice>{error}</Notice>
      {!verified ? (
        <form onSubmit={verify}>
          <label className="form-label" htmlFor={`${id}-email`}>
            Original email address
          </label>
          <input
            autoFocus
            type="email"
            id={`${id}-email`}
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="button-row">
            <button className="btn btn-primary btn-small">
              Confirm email <FaArrowRight />
            </button>
            <button
              className="btn btn-secondary btn-small"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={confirm} aria-busy={busy}>
          {action === "edit" && (
            <>
              <label className="form-label" htmlFor={`${id}-comment`}>
                Your feedback
              </label>
              <textarea
                autoFocus
                id={`${id}-comment`}
                className="form-control"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <Stars value={rating} onChange={setRating} id={id} />
            </>
          )}
          <div className="button-row">
            <button
              className={`btn ${action === "delete" ? "btn-danger" : "btn-primary"} btn-small`}
              disabled={busy}
            >
              {busy
                ? "Working…"
                : action === "edit"
                  ? "Save changes"
                  : "Yes, delete feedback"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function ViewFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("card");
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const product = params.get("product") || "";
  const role = localStorage.getItem("userRole");
  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/feedback/");
      setFeedbacks(
        [...response.data].sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
    } catch (err) {
      setError(
        apiError(
          err,
          "Feedback could not be loaded. Please check the server and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);
  const filtered = feedbacks.filter(
    (f) =>
      (!product || f.productItem === product) &&
      (!search.trim() ||
        `${f.customerName || ""} ${f.productItem || ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())),
  );
  const average = feedbacks.length
    ? (
        feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) /
        feedbacks.length
      ).toFixed(1)
    : "—";

  function saved(updated) {
    setFeedbacks((previous) =>
      previous.map((f) => (f._id === updated._id ? updated : f)),
    );
    setSelected(null);
    setMessage("Your feedback has been updated.");
  }
  function deleted(id) {
    setFeedbacks((previous) => previous.filter((f) => f._id !== id));
    setSelected(null);
    setMessage("Your feedback has been deleted.");
  }
  const actions = (feedback) => (
    <div className="card-actions">
      <button
        className="action-link"
        onClick={() => {
          setMessage("");
          setSelected({ id: feedback._id, type: "edit" });
        }}
        aria-label={`Update feedback by ${feedback.customerName}`}
      >
        <FaPen /> Update
      </button>
      <button
        className="action-link danger-text"
        onClick={() => {
          setMessage("");
          setSelected({ id: feedback._id, type: "delete" });
        }}
        aria-label={`Delete feedback by ${feedback.customerName}`}
      >
        <FaTrashAlt /> Delete
      </button>
    </div>
  );
  const editor = (feedback) =>
    selected?.id === feedback._id ? (
      <FeedbackAction
        key={`${feedback._id}-${selected.type}`}
        feedback={feedback}
        action={selected.type}
        onCancel={() => setSelected(null)}
        onSaved={saved}
        onDeleted={deleted}
      />
    ) : null;
  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("CocoHub | Customer Feedback", 14, 22);
    autoTable(doc, {
      head: [["Name", "Email", "Product", "Date", "Rating", "Comment"]],
      body: filtered.map((f) => [
        f.customerName,
        maskEmail(f.email),
        productLabel(f.productItem),
        formatDate(f.date),
        `${f.rating}/5`,
        f.comment,
      ]),
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 76, 56] },
    });
    doc.save("Feedback_Report.pdf");
  }

  return (
    <div className="page-container page-space">
      <PageHeader
        eyebrow="The CocoHub community"
        title="Every voice helps us grow."
        description="Real experiences with our products, shared by people like you."
      >
        <Link to="/add" className="btn btn-primary">
          Write a review <FaArrowRight />
        </Link>
      </PageHeader>
      <Notice type="success">{message || location.state?.message}</Notice>
      {loading ? (
        <Loading text="Gathering community feedback…" />
      ) : error ? (
        <div className="surface empty-state">
          <Notice>{error}</Notice>
          <button className="btn btn-secondary" onClick={fetchFeedback}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="feedback-summary">
            <div>
              <strong>{feedbacks.length}</strong>
              <span>
                Community {feedbacks.length === 1 ? "review" : "reviews"}
              </span>
            </div>
            <div>
              <strong>
                {average}
                <small> / 5</small>
              </strong>
              <Stars value={Math.round(Number(average) || 0)} />
              <span>Average rating</span>
            </div>
            <div className="summary-note">
              <FaComments />
              <p>
                A better CocoHub
                <br />
                starts with your feedback.
              </p>
            </div>
          </div>
          <div className="feedback-toolbar">
            <div className="search-field">
              <FaSearch aria-hidden="true" />
              <label className="visually-hidden" htmlFor="feedback-search">
                Search feedback by customer name or product
              </label>
              <input
                id="feedback-search"
                type="search"
                placeholder="Search by name or product…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelected(null);
                }}
              />
            </div>
            <div className="view-toggle" aria-label="Feedback display">
              <button
                aria-label="Card view"
                aria-pressed={view === "card"}
                className={view === "card" ? "active" : ""}
                onClick={() => setView("card")}
              >
                <FaThLarge /> Cards
              </button>
              <button
                aria-label="Table view"
                aria-pressed={view === "table"}
                className={view === "table" ? "active" : ""}
                onClick={() => setView("table")}
              >
                <FaList /> Table
              </button>
            </div>
          </div>
          <div className="results-line">
            <span aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "review" : "reviews"}
              {product ? ` for ${productLabel(product)}` : ""}
            </span>
            {(search || product) && (
              <button
                className="action-link"
                onClick={() => {
                  setSearch("");
                  setParams({});
                  setSelected(null);
                }}
              >
                Clear filters
              </button>
            )}
            <span>Newest first</span>
          </div>
          {!filtered.length ? (
            <div className="surface empty-state">
              <FaComments />
              <h2>
                {feedbacks.length
                  ? "No matching reviews."
                  : "The conversation starts with you."}
              </h2>
              <p>
                {feedbacks.length
                  ? "Try a different name or product, or clear your filters."
                  : "Be the first to share your experience with CocoHub."}
              </p>
              {!feedbacks.length && (
                <Link to="/add" className="btn btn-primary">
                  Write the first review
                </Link>
              )}
            </div>
          ) : view === "card" ? (
            <div className="feedback-grid">
              {filtered.map((feedback) => (
                <article className="feedback-card" key={feedback._id}>
                  <div className="feedback-card-top">
                    <span className="product-tag">
                      {productLabel(feedback.productItem)}
                    </span>
                    <Stars value={feedback.rating} />
                  </div>
                  <p className="review-comment">{feedback.comment}</p>
                  <div className="customer-line">
                    <span className="customer-avatar">
                      {initials(feedback.customerName)}
                    </span>
                    <div>
                      <h2>{feedback.customerName}</h2>
                      <span>{maskEmail(feedback.email)}</span>
                    </div>
                  </div>
                  <div className="feedback-card-footer">
                    <time>
                      {formatDate(feedback.date)}
                      {feedback.updatedAt && <small> · Edited</small>}
                    </time>
                    {actions(feedback)}
                  </div>
                  {editor(feedback)}
                </article>
              ))}
            </div>
          ) : (
            <div className="table-scroll">
              <table className="feedback-table">
                <caption className="visually-hidden">
                  Customer feedback, newest first
                </caption>
                <thead>
                  <tr>
                    {[
                      "Customer",
                      "Product",
                      "Rating",
                      "Feedback",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th scope="col" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((feedback) => (
                    <React.Fragment key={feedback._id}>
                      <tr>
                        <td>
                          <strong>{feedback.customerName}</strong>
                          <small>{maskEmail(feedback.email)}</small>
                        </td>
                        <td>{productLabel(feedback.productItem)}</td>
                        <td>
                          <Stars value={feedback.rating} />
                        </td>
                        <td className="table-comment">{feedback.comment}</td>
                        <td>{formatDate(feedback.date)}</td>
                        <td>{actions(feedback)}</td>
                      </tr>
                      {selected?.id === feedback._id && (
                        <tr>
                          <td colSpan={6}>{editor(feedback)}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(role === "Admin" || role === "Manager") && (
            <div className="button-row report-actions">
              <button
                className="btn btn-secondary"
                onClick={exportPDF}
                disabled={!filtered.length}
              >
                <FaDownload /> Export PDF report
              </button>
              <Link className="btn btn-secondary" to="/feedback-analytics">
                <FaChartBar /> Feedback analytics
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
