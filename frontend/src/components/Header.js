import React from "react";
import { Link } from "react-router-dom";
import '../App.css'; 
import logo from '../../src/images/logo.png'
import { FaSun, FaMoon } from 'react-icons/fa';

function Header({ theme, toggleTheme }) {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Coco Hub Logo" className="logo" />
          <span className="logo-text">Coco Hub</span>
        </Link>

        <div className="d-flex align-items-center order-lg-last">
          {/* Theme Toggle Button */}
          <button className="theme-toggle-btn me-3" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </div>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
              <Link to="/" className="nav-link">
                <b>About Us</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/feedback" className="nav-link">
                <b>View Feedback</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/add" className="nav-link">
                <b>Add Feedback</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                <b>User Profile</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/signup" className="nav-link">
                <b>Registration</b>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;