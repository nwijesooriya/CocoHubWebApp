import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FaLeaf,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "./AuthContext";

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="CocoHub home">
      <span className="brand-mark">
        <FaLeaf />
      </span>
      <span>
        Coco<span className="brand-accent">Hub</span>
        <small>ROOTED IN POSSIBILITY</small>
      </span>
    </Link>
  );
}

export default function Header({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  return (
    <header className="site-header">
      <div className="nav-container">
        <Brand />
        <button
          type="button"
          className="icon-button menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
        <nav
          id="main-navigation"
          className={`main-navigation ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="nav-links">
            <NavLink to="/" end>
              Home & about
            </NavLink>
            <NavLink to="/feedback">Customer feedback</NavLink>
            <NavLink to="/add">Write a review</NavLink>
          </div>
          <div className="nav-actions">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
            {user ? (
              <NavLink className="btn btn-primary btn-small" to="/profile">
                <FaUser /> My account
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className="nav-signin">
                  Sign in
                </NavLink>
                <Link to="/signup" className="btn btn-primary btn-small">
                  Get started <FaArrowRight />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
