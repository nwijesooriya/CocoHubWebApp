import React, { useState, useEffect } from 'react';
import axios from "axios";
import '../App.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

function ViewFeedback() {
    const [feedbacks, setFeedback]       = useState([]);
    const [editingId, setEditingId]      = useState(null);
    const [deletingId, setDeletingId]    = useState(null);
    const [actionEmail, setActionEmail]  = useState('');
    const [editComment, setEditComment]  = useState('');
    const [editRating, setEditRating]    = useState(0);
    const [hoverRating, setHoverRating]  = useState(0);
    const [error, setError]              = useState('');
    const [searchTerm, setSearchTerm]    = useState('');
    const [viewMode, setViewMode]        = useState('card'); // 'card' | 'table'

    const userRole = localStorage.getItem("userRole");

    useEffect(() => { fetchFeedbacks(); }, []);

    const fetchFeedbacks = () => {
        axios.get("http://localhost:8000/feedback/")
            .then((res) => {
                const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setFeedback(sorted);
            })
            .catch((err) => console.error(err));
    };

    const handleActionClick = (feedback, actionType) => {
        setEditingId(actionType === 'edit' ? feedback._id : null);
        setDeletingId(actionType === 'delete' ? feedback._id : null);
        setEditComment(actionType === 'edit' ? feedback.comment : '');
        setEditRating(actionType === 'edit' ? feedback.rating : 0);
        setActionEmail('');
        setError('');
    };

    const verifyEmail = (feedbackId) => {
        const fb = feedbacks.find(f => f._id === feedbackId);
        if (!fb) { setError("Feedback not found."); return false; }
        if (actionEmail !== fb.email) {
            setError("Email does not match. Please enter the email used for this feedback.");
            return false;
        }
        return true;
    };

    const handleSave = async (feedbackId) => {
        if (!verifyEmail(feedbackId)) return;
        try {
            const res = await axios.put(
                `http://localhost:8000/feedback/update/${feedbackId}`,
                { email: actionEmail, comment: editComment, rating: editRating }
            );
            if (res.status === 200) {
                setFeedback(feedbacks.map(fb =>
                    fb._id === feedbackId ? { ...fb, comment: editComment, rating: editRating } : fb
                ));
                cancelActions();
            }
        } catch { setError("Error updating feedback. Please try again."); }
    };

    const handleDelete = async (feedbackId) => {
        if (!verifyEmail(feedbackId)) return;
        try {
            const res = await axios.delete(`http://localhost:8000/feedback/delete/${feedbackId}`);
            if (res.status === 200) { fetchFeedbacks(); cancelActions(); }
        } catch { setError("Error deleting feedback. Please try again."); }
    };

    const cancelActions = () => {
        setEditingId(null); setDeletingId(null);
        setActionEmail(''); setError('');
    };

    const maskEmail = (email) => {
        const [name, domain] = email.split("@");
        return `${name.slice(0, 3)}***@${domain}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Customer Feedback Report', 14, 22);
        const cols = ["Name", "Email", "Date", "Rating", "Comment"];
        const rows = feedbacks.map(fb => [
            fb.customerName || "Anonymous",
            fb.email || "N/A",
            new Date(fb.date).toLocaleDateString(),
            fb.rating || "-",
            fb.comment
        ]);
        autoTable(doc, { head: [cols], body: rows, startY: 30, styles: { fontSize: 10 } });
        doc.save('Feedback_Report.pdf');
    };

    const displayList = searchTerm
        ? [...feedbacks].filter(fb =>
            (fb.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (fb.productItem?.toLowerCase().includes(searchTerm.toLowerCase()))
          ).sort((a, b) => new Date(b.date) - new Date(a.date))
        : feedbacks;

    /* ── Star helper ── */
    const Stars = ({ count, interactive = false, onRate, onHover, onLeave, hover }) => (
        <span style={{ fontSize: interactive ? '1.4rem' : '1.05rem', letterSpacing: 1 }}>
            {[1,2,3,4,5].map(s => (
                <span
                    key={s}
                    style={{
                        cursor: interactive ? 'pointer' : 'default',
                        color: s <= (hover || count) ? '#f59e0b' : '#d1d5db',
                        transition: 'transform 0.12s ease',
                        display: 'inline-block',
                        transform: interactive && s <= (hover || count) ? 'scale(1.2)' : 'scale(1)',
                    }}
                    onClick={() => interactive && onRate && onRate(s)}
                    onMouseEnter={() => interactive && onHover && onHover(s)}
                    onMouseLeave={() => interactive && onLeave && onLeave(0)}
                >★</span>
            ))}
        </span>
    );

    /* ── Action Block (shared card/table) ── */
    const ActionBlock = ({ feedback }) => (
        <div style={{
            marginTop: '0.75rem',
            padding: '0.85rem',
            background: 'rgba(5,150,105,0.05)',
            borderRadius: 8,
            border: '1px solid rgba(5,150,105,0.12)',
        }}>
            {error && editingId === feedback._id || error && deletingId === feedback._id
                ? <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{error}</p>
                : null
            }
            <input
                type="email"
                placeholder="Enter your email to confirm"
                className="email-input"
                value={actionEmail}
                onChange={(e) => setActionEmail(e.target.value)}
                style={{ marginBottom: '0.6rem' }}
            />
            {editingId === feedback._id && (
                <>
                    <textarea
                        className="comment-edit"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        style={{ marginBottom: '0.6rem' }}
                    />
                    <div style={{ marginBottom: '0.6rem' }}>
                        <Stars
                            count={editRating} interactive
                            onRate={setEditRating}
                            onHover={setHoverRating}
                            onLeave={setHoverRating}
                            hover={hoverRating}
                        />
                    </div>
                </>
            )}
            <div className="action-buttons">
                {editingId === feedback._id
                    ? <button className="save-button" onClick={() => handleSave(feedback._id)}>✔ Save</button>
                    : <button className="delete-button" onClick={() => handleDelete(feedback._id)}>🗑 Confirm Delete</button>
                }
                <button className="cancel-button" onClick={cancelActions}>✕ Cancel</button>
            </div>
        </div>
    );

    return (
        <div className="feedback-container">
            <h1 className="feedback-title">🥥 Customer Feedbacks</h1>

            {/* Top Controls */}
            <div className="feedback-topbar">
                {/* View Toggle */}
                <div className="view-toggle">
                    <button
                        id="card-view-btn"
                        className={`view-toggle-btn${viewMode === 'card' ? ' active' : ''}`}
                        onClick={() => setViewMode('card')}
                    >
                        ⊞ Cards
                    </button>
                    <button
                        id="table-view-btn"
                        className={`view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        ≡ Table
                    </button>
                </div>

                {/* Search */}
                <div className="search-bar1">
                    <input
                        type="text"
                        placeholder="Search by name or product…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Global error */}
            {error && !editingId && !deletingId && (
                <div className="error-message">{error}</div>
            )}

            {/* ═══════════ CARD VIEW ═══════════ */}
            {viewMode === 'card' && (
                <div className="feedback-grid">
                    {displayList.length === 0 && (
                        <div className="no-feedback" style={{ gridColumn: '1 / -1' }}>
                            {feedbacks.length === 0 ? '📭 No feedbacks yet.' : '🔍 No results match your search.'}
                        </div>
                    )}

                    {displayList.map((feedback) => (
                        <div className="feedback-card" key={feedback._id}>
                            {/* Card Header */}
                            <div className="feedback-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                                    <div className="customer-avatar">{getInitials(feedback.customerName)}</div>
                                    <div>
                                        <div className="customer-name">{feedback.customerName || 'Anonymous'}</div>
                                        {feedback.email && (
                                            <div className="email">{maskEmail(feedback.email)}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="feedback-right">
                                    <span className="feedback-date">{formatDate(feedback.date)}</span>
                                    {feedback.rating > 0 && (
                                        <Stars count={feedback.rating} />
                                    )}
                                </div>
                            </div>

                            {/* Action form (edit/delete) */}
                            {(editingId === feedback._id || deletingId === feedback._id) ? (
                                <ActionBlock feedback={feedback} />
                            ) : (
                                <>
                                    {feedback.productItem && (
                                        <div className="product-item">🥥 {feedback.productItem}</div>
                                    )}
                                    <div className="feedback-comment">{feedback.comment}</div>
                                    <div className="action-controls">
                                        <button className="update-button" onClick={() => handleActionClick(feedback, 'edit')}>
                                            ✏️ Edit
                                        </button>
                                        <button className="delete-button" onClick={() => handleActionClick(feedback, 'delete')}>
                                            🗑 Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ═══════════ TABLE VIEW ═══════════ */}
            {viewMode === 'table' && (
                <div className="feedback-table-wrapper">
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th style={{ width: '14%' }}>Customer</th>
                                <th style={{ width: '14%' }}>Email</th>
                                <th style={{ width: '14%' }}>Product</th>
                                <th style={{ width: '10%' }}>Rating</th>
                                <th style={{ width: '28%' }}>Comment</th>
                                <th style={{ width: '10%' }}>Date</th>
                                <th style={{ width: '10%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayList.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-feedback">
                                        {feedbacks.length === 0 ? '📭 No feedbacks yet.' : '🔍 No results match your search.'}
                                    </td>
                                </tr>
                            ) : displayList.map((feedback) => (
                                <React.Fragment key={feedback._id}>
                                    <tr>
                                        <td className="table-cell-customer">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg,#047857,#10b981)',
                                                    color: '#fff', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '0.7rem',
                                                    fontWeight: 700, flexShrink: 0
                                                }}>{getInitials(feedback.customerName)}</div>
                                                {feedback.customerName || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td className="table-cell-email">
                                            {feedback.email ? maskEmail(feedback.email) : '-'}
                                        </td>
                                        <td className="table-cell-product">
                                            {feedback.productItem
                                                ? <span className="product-item" style={{ fontSize: '0.78rem' }}>🥥 {feedback.productItem}</span>
                                                : '-'
                                            }
                                        </td>
                                        <td className="table-cell-rating">
                                            {feedback.rating > 0
                                                ? <Stars count={feedback.rating} />
                                                : '-'
                                            }
                                        </td>
                                        <td className="table-cell-comment">
                                            {editingId === feedback._id
                                                ? <textarea
                                                    className="comment-edit-table"
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                  />
                                                : feedback.comment
                                            }
                                        </td>
                                        <td className="table-cell-date">{formatDate(feedback.date)}</td>
                                        <td className="table-cell-actions">
                                            {(editingId === feedback._id || deletingId === feedback._id) ? (
                                                <div className="table-action-buttons">
                                                    <input
                                                        type="email"
                                                        placeholder="Email…"
                                                        className="email-input-table"
                                                        value={actionEmail}
                                                        onChange={(e) => setActionEmail(e.target.value)}
                                                        style={{ marginBottom: 4 }}
                                                    />
                                                    {editingId === feedback._id && (
                                                        <Stars
                                                            count={editRating} interactive
                                                            onRate={setEditRating}
                                                            onHover={setHoverRating}
                                                            onLeave={setHoverRating}
                                                            hover={hoverRating}
                                                        />
                                                    )}
                                                    {editingId === feedback._id
                                                        ? <button className="save-button" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => handleSave(feedback._id)}>✔ Save</button>
                                                        : <button className="delete-button" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => handleDelete(feedback._id)}>🗑 Delete</button>
                                                    }
                                                    <button className="cancel-button" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={cancelActions}>✕</button>
                                                    {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', width: '100%' }}>{error}</p>}
                                                </div>
                                            ) : (
                                                <div className="table-action-buttons">
                                                    <button className="update-button" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => handleActionClick(feedback, 'edit')}>✏️ Edit</button>
                                                    <button className="delete-button" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => handleActionClick(feedback, 'delete')}>🗑</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Admin/Manager buttons */}
            {(userRole === "Admin" || userRole === "Manager") && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
                    <button className="report-button" onClick={generatePDF}>
                        📄 Generate PDF Report
                    </button>
                    <button className="analyticsbtn" onClick={() => window.location.href = "/feedback-analytics"}>
                        📊 View Analytics
                    </button>
                </div>
            )}
        </div>
    );
}

export default ViewFeedback;