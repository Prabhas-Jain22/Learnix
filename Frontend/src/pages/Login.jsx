import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "student";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // Redirect based on role
      if (res.data.role === "instructor") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    return role === "instructor" ? "Instructor" : "Student";
  };

  const getRoleIcon = () => {
    return role === "instructor" ? "👨‍🏫" : "🎓";
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-card">
          {/* Role Header */}
          <div className="auth-header">
            <span className="auth-header-icon">{getRoleIcon()}</span>
            <h2>Login as {getRoleDisplay()}</h2>
            <p>Welcome back! Please sign in to continue.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">📧 Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">🔐 Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                `✓ Sign in as ${getRoleDisplay()}`
              )}
            </button>
          </form>

          <div className="auth-footer space-y-2">
            <p>
              Don't have an account?{" "}
              <Link to={`/register?role=${role}`}>
                Create {getRoleDisplay()} Account
              </Link>
            </p>
            <Link to="/auth">← Back to role selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;