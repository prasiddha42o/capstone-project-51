import { useState } from "react";

import {
  validateEmail,
  validateLogin
} from "../utils/validation";

import {
  LeafIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  GoogleIcon,
  GithubIcon
} from "../components/Icons";

export default function LoginPage({ onLogin, onGoRegister }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e?.preventDefault();

    // empty check
    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter email and password");
      return;
    }

    // email format check
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    // credential check (mock DB)
    const user = validateLogin(email, password);

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    setError("");

    // pass user back to parent
    onLogin?.(user);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <LeafIcon size={22} />
          <span className="auth-logo-text">Waste Assistant</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">
          Login to continue your sustainability journey
        </p>

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
              type="button"
              className="eye-btn"
              onClick={() => setShowPw((v) => !v)}
            >
              <EyeIcon off={showPw} />
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
            {error}
          </p>
        )}

        {/* OPTIONS */}
        <div className="row-between">
          <label className="checkbox-label">
            <input type="checkbox" /> Remember me
          </label>
          <span className="link">Forgot password?</span>
        </div>

        {/* LOGIN BUTTON */}
        <button className="btn-primary" onClick={handleLogin}>
          Login
        </button>

        {/* DIVIDER */}
        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">Or continue with</span>
          <div className="divider-line" />
        </div>

        {/* SOCIAL LOGIN */}
        <div className="social-btns">
          <button className="btn-social">
            <GoogleIcon /> Google
          </button>
          <button className="btn-social">
            <GithubIcon /> GitHub
          </button>
        </div>

        {/* REGISTER LINK */}
        <p className="auth-footer">
          Don't have an account?{" "}
          <span className="link" onClick={onGoRegister}>
            Sign up for free
          </span>
        </p>

      </div>
    </div>
  );
}