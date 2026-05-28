import { useState } from "react";
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

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <LeafIcon size={22} />
          <span className="auth-logo-text">Waste Assistant</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">
          Login to continue your sustainability journey
        </p>

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
            />
          </div>
        </div>

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
            />
            <button
              className="eye-btn"
              onClick={() => setShowPw((v) => !v)}
              type="button"
            >
              <EyeIcon off={showPw} />
            </button>
          </div>
        </div>

        <div className="row-between">
          <label className="checkbox-label">
            <input type="checkbox" /> Remember me
          </label>
          <span className="link">Forgot password?</span>
        </div>

        <button className="btn-primary" onClick={onLogin}>
          Login
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">Or continue with</span>
          <div className="divider-line" />
        </div>

        <div className="social-btns">
          <button className="btn-social">
            <GoogleIcon /> Google
          </button>
          <button className="btn-social">
            <GithubIcon /> GitHub
          </button>
        </div>

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