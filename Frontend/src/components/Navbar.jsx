import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const preferredTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || preferredTheme;
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/auth";
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">✓</div>
          <span className="logo-text">Learnix</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-center">
          <Link to="/" className="nav-link">Home</Link>
          {token && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          {role === "instructor" && token && <Link to="/admin" className="nav-link">Admin Panel</Link>}
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {!token ? (
            <div className="auth-links">
              <Link to="/auth" className="btn-text">Login</Link>
              <Link to="/auth" className="btn btn-primary">Sign Up</Link>
            </div>
          ) : (
            <div className="dropdown-container">
                <button 
                  className="user-menu-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                <div className="user-avatar">
                  {role?.[0]?.toUpperCase() || '👤'}
                </div>
                <span>{role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}</span>
                <svg className={`dropdown-icon ${showDropdown ? 'open' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <span>📚</span> My Courses
                  </Link>
                  {role === "instructor" && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span>⚙️</span> Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={logout} className="dropdown-item logout">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <button 
          className={`mobile-menu-btn ${showMobileMenu ? 'active' : ''}`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>Home</Link>
          {token && <Link to="/dashboard" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>}
          {role === "instructor" && token && <Link to="/admin" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>Admin Panel</Link>}
          <div className="mobile-menu-divider"></div>
          <button className="mobile-nav-link theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          {!token ? (
            <>
              <Link to="/auth" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>Login</Link>
              <Link to="/auth" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)}>Register</Link>
            </>
          ) : (
            <button onClick={logout} className="mobile-nav-link logout" style={{width: '100%', textAlign: 'left'}}>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;