import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import '../App.css';

const PRODUCTS = [
    'Coconut Milk Powder', 'Coconut Shell', 'Coconut Shell Charcol',
    'Fiber rope', 'Coconut Oil', 'Husk',
    'Coconut Shell Cups', 'Coconut Shell Spoons', 'Other Products'
];

function AddFeedback() {
    const [customerName, setName]       = useState(localStorage.getItem("userName") || "");
    const [email, setEmail]             = useState(localStorage.getItem("userEmail") || "");
    const [comment, setComment]         = useState("");
    const [isChecked, setIsChecked]     = useState(false);
    const [productItem, setProductItem] = useState('');
    const [rating, setRating]           = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        const storedName  = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("userEmail");
        if (storedName)  setName(storedName);
        if (storedEmail) setEmail(storedEmail);
    }, []);

    function sendData(e) {
        e.preventDefault();

        if (!isChecked) {
            Swal.fire({ icon: 'warning', title: 'Consent Required', text: 'Please agree to publish your review before submitting.' });
            return;
        }

        if (rating === 0) {
            Swal.fire({ icon: 'warning', title: 'Rating Required', text: 'Please select a star rating before submitting.' });
            return;
        }

        axios.post("http://localhost:8000/feedback/add", { customerName, email, comment, productItem, rating })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '✅ Feedback Submitted!',
                    text: 'Thank you for your valuable feedback.',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                setTimeout(() => { window.location.href = "/feedback"; }, 2100);
            })
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: err.response?.data?.error || err.message,
                    confirmButtonColor: '#d33',
                });
            });
    }

    const starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <div className="form-container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
            <div className="feedback-form-card">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
                    <div style={{
                        fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: 1
                    }}>✍️</div>
                    <h1 className="feedback-form-title">Share Your Experience</h1>
                    <p className="feedback-form-subtitle">Your feedback helps us improve our products and services</p>
                </div>

                <form onSubmit={sendData}>
                    {/* Name + Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                            <label htmlFor="CustomerName" className="form-label">Your Name</label>
                            <input type="text" className="form-control" id="CustomerName"
                                value={customerName} placeholder="Full name"
                                onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="CustomerEmail" className="form-label">Email</label>
                            <input type="email" className="form-control" id="CustomerEmail"
                                value={email} placeholder="you@example.com"
                                onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    {/* Product */}
                    <div className="form-group">
                        <label htmlFor="productItem" className="form-label">Product</label>
                        <select className="form-select" id="productItem"
                            value={productItem}
                            onChange={(e) => setProductItem(e.target.value)} required>
                            <option value="">🥥 Select a product...</option>
                            {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Star Rating */}
                    <div className="form-group">
                        <label className="form-label">Rating</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            cursor: 'pointer',
                                            color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
                                            fontSize: '2rem',
                                            transition: 'transform 0.15s ease, color 0.15s ease',
                                            transform: star <= (hoverRating || rating) ? 'scale(1.2)' : 'scale(1)',
                                            display: 'inline-block',
                                        }}
                                    >★</span>
                                ))}
                            </div>
                            {(hoverRating || rating) > 0 && (
                                <span style={{ fontSize: '0.88rem', color: '#f59e0b', fontWeight: 600 }}>
                                    {starLabel[hoverRating || rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="form-group">
                        <label htmlFor="Comment" className="form-label">Your Comment</label>
                        <textarea
                            className="form-control" id="Comment"
                            placeholder="Tell us about your experience with this product..."
                            rows="4"
                            onChange={(e) => setComment(e.target.value)}
                            required
                            style={{ resize: 'vertical', lineHeight: 1.6 }}
                        />
                    </div>

                    {/* Consent */}
                    <div className="form-check" style={{ marginBottom: '1.5rem' }}>
                        <input type="checkbox" className="form-check-input" id="AgreeCheck"
                            onChange={(e) => setIsChecked(e.target.checked)} />
                        <label className="form-check-label" htmlFor="AgreeCheck">
                            I agree that my review can be published on the website
                        </label>
                    </div>

                    <button type="submit" className="signup-button" style={{ width: '100%', maxWidth: '100%' }}>
                        🚀 Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddFeedback;