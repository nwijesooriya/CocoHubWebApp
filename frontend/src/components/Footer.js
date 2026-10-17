import React from "react";
import { Link } from "react-router-dom";
import { FaArrowUp, FaLeaf } from "react-icons/fa";
import { Brand } from "./Header";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-grid">
        <div>
          <Brand />
          <p>
            Bringing coconut products,
            <br />
            people, and possibilities together.
          </p>
        </div>
        <div>
          <h2>Explore CocoHub</h2>
          <Link to="/">Our story</Link>
          <a href="/#products">Product range</a>
          <Link to="/feedback">Customer feedback</Link>
        </div>
        <div>
          <h2>Be part of it</h2>
          <Link to="/signup">Create an account</Link>
          <Link to="/profile">Your profile</Link>
          <Link to="/add">Share your experience</Link>
        </div>
        <div className="footer-note">
          <FaLeaf />
          <p>
            Small connections.
            <br />
            <strong>Room to grow.</strong>
          </p>
        </div>
      </div>
      <div className="page-container footer-bottom">
        <span>
          © {new Date().getFullYear()} CocoHub. Coconut & coconut-based
          products.
        </span>
        <a href="#top">
          Back to top <FaArrowUp />
        </a>
      </div>
    </footer>
  );
}
