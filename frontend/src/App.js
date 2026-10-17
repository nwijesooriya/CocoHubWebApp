import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Header from "./components/Header";
import AddFeedback from "./components/AddFeedback";
import ViewFeedback from "./components/ViewFeedback";
import AboutUs from "./components/AboutUs";
import Signup from "./components/Signup";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import ManageUsers from "./components/ManageUsers";
import ForgotPassword from "./components/ForgotPassword";
import FeedbackAnalytics from "./components/FeedbackAnalytics";
import Footer from "./components/Footer";
import { PageHeader } from "./components/UI";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      <div className="App" id="top">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <ScrollToTop />
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main id="main-content" tabIndex="-1">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<AboutUs />} />
            <Route path="/add" element={<AddFeedback />} />
            <Route path="/feedback" element={<ViewFeedback />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
            <Route
              path="*"
              element={
                <div className="page-container empty-state">
                  <PageHeader
                    eyebrow="404"
                    title="This page hasn't taken root."
                    description="Head back to CocoHub to find what you need."
                  />
                  <Link to="/" className="btn btn-primary">
                    Back to home
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
