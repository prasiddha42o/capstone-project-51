// src/pages/LoginPage.jsx
import { useState } from "react";
import { validateEmail } from "../utils/validation";
import { loginUser } from "../utils/auth";
import {
  LeafIcon, MailIcon, LockIcon, EyeIcon, GoogleIcon, GithubIcon,
} from "../components/Icons";

export default function LoginPage({ onLogin, onGoRegister }) {
  const [showPw, setShowPw]     = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

 const handleLogin = async (e) => {
  e?.preventDefault();

  const trimmedEmail = email.trim();

  if (!trimmedEmail || !password.trim()) {
    setError("Please enter email and password");
    return;
  }

  if (!validateEmail(trimmedEmail)) {
    setError("Invalid email format");
    return;
  }

  setLoading(true);


    setError("");
    const result = await loginUser(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message); return;
    }
    onLogin?.(result.user);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <LeafIcon size={22} />
          <span className="auth-logo-text">Waste Assistant</span>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Login to continue your sustainability journey</p>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrap">
            <span className="input-icon"><MailIcon /></span>
            <input
              className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrap">
            <span className="input-icon"><LockIcon /></span>
            <input
              className="form-input"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPw((v) => !v)}>
              <EyeIcon off={showPw} />
            </button>
          </div>
        </div>

        {error && <p style={{ color: "red", fontSize: 12, marginTop: 5 }}>{error}</p>}

        <div className="row-between">
          <label className="checkbox-label"><input type="checkbox" /> Remember me</label>
          <span className="link">Forgot password?</span>
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">Or continue with</span>
          <div className="divider-line" />
        </div>

        <div className="social-btns">
          <button className="btn-social"><GoogleIcon /> Google</button>
          <button className="btn-social"><GithubIcon /> GitHub</button>
        </div>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span className="link" onClick={onGoRegister}>Sign up for free</span>
        </p>
      </div>
    </div>
  );
}