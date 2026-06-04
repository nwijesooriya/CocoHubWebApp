import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import '../App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
    "#059669","#10b981","#34d399","#f59e0b","#8b5cf6",
    "#3b82f6","#ef4444","#ec4899","#f97316","#14b8a6"
];

function FeedbackAnalytics() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8000/feedback/")
            .then((res) => { setFeedbacks(res.data); setLoading(false); })
            .catch((err) => { console.error(err); setLoading(false); });
    }, []);

    const productCounts = {};
    feedbacks.forEach((fb) => {
        if (fb.productItem) productCounts[fb.productItem] = (productCounts[fb.productItem] || 0) + 1;
    });

    const avgRating = feedbacks.length
        ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length).toFixed(1)
        : 0;

    const data = {
        labels: Object.keys(productCounts),
        datasets: [{
            label: "Feedbacks",
            data: Object.values(productCounts),
            backgroundColor: COLORS,
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverOffset: 12,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: { boxWidth: 14, padding: 18, font: { family: 'Inter, sans-serif', size: 13 } }
            },
            tooltip: { enabled: true },
        },
        animation: { animateRotate: true, animateScale: true },
    };

    const stats = [
        { label: 'Total Reviews', value: feedbacks.length, icon: '💬', color: '#059669' },
        { label: 'Avg Rating',    value: `${avgRating} ★`, icon: '⭐', color: '#f59e0b' },
        { label: 'Products',      value: Object.keys(productCounts).length, icon: '🥥', color: '#8b5cf6' },
    ];

    return (
        <div className="analytics-container">
            <h1 className="feedback-title" style={{ marginBottom: '0.3rem' }}>📈 Feedback Analytics</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Distribution of customer reviews across product categories
            </p>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {stats.map(s => (
                    <div key={s.label} style={{
                        background: 'rgba(255,255,255,0.88)',
                        backdropFilter: 'blur(12px)',
                        border: `1.5px solid ${s.color}25`,
                        borderRadius: 14, padding: '1.2rem 2rem',
                        textAlign: 'center', minWidth: 120,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        flex: 1, maxWidth: 180
                    }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="analytics-wrapper">
                <p className="analytics-description">
                    The chart below shows the number of feedbacks received for each product category.
                </p>

                {loading ? (
                    <div style={{ padding: '3rem', color: '#9ca3af' }}>⏳ Loading analytics…</div>
                ) : Object.keys(productCounts).length > 0 ? (
                    <div className="chart-area">
                        <div style={{ width: '100%', maxWidth: 520, height: 380 }}>
                            <Pie data={data} options={options} />
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '2rem', color: '#9ca3af', fontStyle: 'italic' }}>
                        No feedback data available yet.
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={() => window.history.back()}
                    style={{ marginTop: '0.5rem' }}
                >
                    ← Go Back
                </button>
            </div>
        </div>
    );
}

export default FeedbackAnalytics;
