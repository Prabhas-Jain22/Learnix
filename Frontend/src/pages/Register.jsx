import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam === "student" || roleParam === "instructor")) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      alert("✓ Registration successful! Please login to continue.");
      navigate(`/login?role=${formData.role}`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    return formData.role === "instructor" ? "Instructor" : "Student";
  };

  const getRoleIcon = () => {
    return formData.role === "instructor" ? "👨‍🏫" : "🎓";
  };

  const getRoleDescription = () => {
    return formData.role === "instructor"
      ? "Create courses, upload content, and manage students"
      : "Enroll in courses, watch lessons, and track your progress";
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-card">
          {/* Role Header */}
          <div className="auth-header">
            <span className="auth-header-icon">{getRoleIcon()}</span>
            <h2>Create {getRoleDisplay()} Account</h2>
            <p>{getRoleDescription()}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">👤 Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">📧 Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">🔐 Password</label>
              <input
                id="password"
                type="password"
                name="password"
                onChange={handleChange}
                required
                placeholder="Create a strong password"
              />
            </div>

            {/* Hidden role field - pre-selected */}
            <input type="hidden" name="role" value={formData.role} />

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
              style={{ background: formData.role === "instructor" ? "var(--success)" : "var(--primary)" }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                `✓ Create ${getRoleDisplay()} Account`
              )}
            </button>
          </form>

          <div className="auth-footer space-y-2">
            <p>
              Already have an account?{" "}
              <Link to={`/login?role=${formData.role}`}>
                Sign in as {getRoleDisplay()}
              </Link>
            </p>
            <Link to="/auth">← Back to role selection</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
