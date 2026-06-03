import { useState } from "react";
import { registerUser } from "../utils/auth";

import {
  LeafIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  GoogleIcon,
  GithubIcon
} from "../components/Icons";

export default function RegisterPage({ onLogin, onGoLogin }) {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = registerUser({ name, email, password });

    if (result.error) {
      setError(result.error);
      return;
    }

    setError("");
    onLogin?.(result.user);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">

        {/* LOGO */}
        <div className="auth-logo">
          <LeafIcon size={22} />
          <span className="auth-logo-text">Waste Assistant</span>
        </div>

        <h1 className="auth-title">Create Account</h1>

        {/* FULL NAME */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div className="input-wrap">
            <span className="input-icon">
              <UserIcon />
            </span>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrap">
            <span className="input-icon">
              <MailIcon />
            </span>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrap">
            <span className="input-icon">
              <LockIcon />
            </span>
            <input
              className="form-input"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="eye-btn"
              type="button"
              onClick={() => setShowPw((v) => !v)}
            >
              <EyeIcon off={showPw} />
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="input-wrap">
            <span className="input-icon">
              <LockIcon />
            </span>
            <input
              className="form-input"
              type={showCpw ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              className="eye-btn"
              type="button"
              onClick={() => setShowCpw((v) => !v)}
            >
              <EyeIcon off={showCpw} />
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

        {/* TERMS */}
        <p className="terms-text">
          I agree to the <span className="link">Terms of Service</span> and{" "}
          <span className="link">Privacy Policy</span>
        </p>

        {/* BUTTON */}
        <button className="btn-primary" onClick={handleRegister}>
          Create Account
        </button>

        {/* DIVIDER */}
        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">Or sign up with</span>
          <div className="divider-line" />
        </div>

        {/* SOCIAL */}
        <div className="social-btns">
          <button className="btn-social">
            <GoogleIcon /> Google
          </button>
          <button className="btn-social">
            <GithubIcon /> GitHub
          </button>
        </div>

        {/* LOGIN LINK */}
        <p className="auth-footer">
          Already have an account?{" "}
          <span className="link" onClick={onGoLogin}>
            Login here
          </span>
        </p>

      </div>
    </div>
  );
}