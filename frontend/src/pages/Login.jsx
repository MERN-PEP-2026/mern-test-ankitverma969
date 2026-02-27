import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginStudent } from "../services/api";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginStudent(formData);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-hero" aria-hidden="true">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <div className="auth-brand">
            <span className="auth-brand-mark">E</span>
            <strong>EduManage</strong>
          </div>
          <h2>Welcome back to your student hub.</h2>
          <p>
            Manage courses, track deadlines, and keep your academic progress in one clean dashboard.
          </p>
          <div className="auth-hero-footnote">Trusted by 5,000+ active students</div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card modern">
          <div className="auth-heading">
            <h1>Login</h1>
            <p>Sign in to continue to your dashboard.</p>
          </div>

          {error && <div className="auth-alert error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon" aria-hidden="true">
                @
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon" aria-hidden="true">
                *
              </span>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch-text">
            New here? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;