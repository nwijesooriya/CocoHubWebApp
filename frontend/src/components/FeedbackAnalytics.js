import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api, { apiError } from "../api";
import { PageHeader, Notice, Loading } from "./UI";
import { productLabel } from "./AddFeedback";

ChartJS.register(ArcElement, Tooltip, Legend);
const COLORS = [
  "#245c43",
  "#8eac78",
  "#b6894a",
  "#577b73",
  "#c8bb8a",
  "#785c46",
  "#a8b59e",
  "#758e54",
  "#bf956f",
];

export default function FeedbackAnalytics() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/feedback/");
      setFeedbacks(res.data);
    } catch (err) {
      setError(apiError(err, "We could not load analytics. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const counts = {};
  feedbacks.forEach((f) => {
    if (f.productItem) counts[f.productItem] = (counts[f.productItem] || 0) + 1;
  });
  const average = feedbacks.length
    ? (
        feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) /
        feedbacks.length
      ).toFixed(1)
    : "—";
  const data = {
    labels: Object.keys(counts).map(productLabel),
    datasets: [
      {
        label: "Reviews",
        data: Object.values(counts),
        backgroundColor: COLORS,
        borderColor: "#f8f7f2",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#788875",
          boxWidth: 12,
          padding: 16,
          font: { family: "Inter, sans-serif", size: 11 },
        },
      },
    },
  };
  return (
    <div className="analytics-container">
      <PageHeader
        eyebrow="Listen. Learn. Grow."
        title="A closer look at feedback."
        description="See how customer reviews are distributed across the product range."
      >
        <Link className="btn btn-secondary" to="/feedback">
          Back to feedback
        </Link>
      </PageHeader>
      {loading ? (
        <Loading text="Preparing feedback insights…" />
      ) : error ? (
        <>
          <Notice>{error}</Notice>
          <button className="btn btn-secondary" onClick={load}>
            Try again
          </button>
        </>
      ) : (
        <>
          <div className="analytics-stats">
            {[
              { label: "Total reviews", value: feedbacks.length },
              { label: "Average rating / 5", value: average },
              { label: "Products reviewed", value: Object.keys(counts).length },
            ].map((stat) => (
              <div className="surface stat-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <section className="surface analytics-wrapper">
            <div className="card-heading">
              <div>
                <h2>Reviews by product</h2>
                <p>
                  Each segment represents the number of reviews for a product.
                </p>
              </div>
            </div>
            {feedbacks.length ? (
              <>
                <div className="chart-area">
                  <Pie
                    data={data}
                    options={options}
                    role="img"
                    aria-label="Pie chart showing review counts by product; the values are listed in the table below."
                  />
                </div>
                <div className="table-scroll">
                  <table className="analytics-table">
                    <caption className="visually-hidden">
                      Review counts by product
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(counts).map(([product, count]) => (
                        <tr key={product}>
                          <td>{productLabel(product)}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h2>Insights start with a conversation.</h2>
                <p>Charts will appear once customers have shared feedback.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
