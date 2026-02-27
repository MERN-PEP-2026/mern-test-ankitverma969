import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../services/api";
import "../styles/auth.css";

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (!password) {
    return { label: "", level: "none", width: "0%" };
  }
  if (score <= 1) {
    return { label: "Weak", level: "weak", width: "33%" };
  }
  if (score <= 3) {
    return { label: "Medium", level: "medium", width: "66%" };
  }
  return { label: "Strong", level: "strong", width: "100%" };
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept Terms of Service and Privacy Policy");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      const response = await registerStudent(payload);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
      setMessage(response.data.message || "Registration successful");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <h2>Start your academic journey today.</h2>
          <p>
            Join thousands of students managing courses, schedules, and performance in one place.
          </p>
          <div className="auth-hero-footnote">Join 5,000+ students already enrolled</div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card modern">
          <div className="auth-heading">
            <h1>Create Account</h1>
            <p>Sign up to get started with your student dashboard.</p>
          </div>

          {message && <div className="auth-alert success">{message}</div>}
          {error && <div className="auth-alert error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon" aria-hidden="true">
                U
              </span>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

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
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon" aria-hidden="true">
                #
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <div className="strength-meter-wrap">
              <div className="strength-meter-track">
                <span
                  className={`strength-meter-fill ${passwordStrength.level}`}
                  style={{ width: passwordStrength.width }}
                />
              </div>
              <small className={`strength-label ${passwordStrength.level}`}>
                {passwordStrength.label && `Strength: ${passwordStrength.label}`}
              </small>
            </div>

            <label className="auth-terms" htmlFor="terms">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
              />
              <span>
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Back to Login</Link>
          </p>

          <div className="auth-social">
            <div className="auth-separator">
              <span>Or register with</span>
            </div>
            <div className="auth-social-grid">
              <button type="button" className="auth-social-btn">
                Google
              </button>
              <button type="button" className="auth-social-btn">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;