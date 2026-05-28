import { useState } from "react";
import { LeafIcon, MailIcon, LockIcon, UserIcon, EyeIcon, GoogleIcon, GithubIcon } from "../components/Icons";

export default function RegisterPage({ onLogin, onGoLogin }) {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <LeafIcon size={22} />
          <span className="auth-logo-text">Waste Assistant</span>
        </div>
        <h1 className="auth-title">Create Account</h1>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div className="input-wrap">
            <span className="input-icon"><UserIcon /></span>
            <input className="form-input" type="text" placeholder="John Doe" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrap">
            <span className="input-icon"><MailIcon /></span>
            <input className="form-input" type="email" placeholder="you@example.com" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrap">
            <span className="input-icon"><LockIcon /></span>
            <input className="form-input" type={showPw ? "text" : "password"} placeholder="••••••••" />
            <button className="eye-btn" onClick={() => setShowPw((v) => !v)} type="button">
              <EyeIcon off={showPw} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="input-wrap">
            <span className="input-icon"><LockIcon /></span>
            <input className="form-input" type={showCpw ? "text" : "password"} placeholder="••••••••" />
            <button className="eye-btn" onClick={() => setShowCpw((v) => !v)} type="button">
              <EyeIcon off={showCpw} />
            </button>
          </div>
        </div>

        <p className="terms-text">
          I agree to the <span className="link">Terms of Service</span> and{" "}
          <span className="link">Privacy Policy</span>
        </p>

        <button className="btn-primary" onClick={onLogin}>Create Account</button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">Or sign up with</span>
          <div className="divider-line" />
        </div>

        <div className="social-btns">
          <button className="btn-social"><GoogleIcon /> Google</button>
          <button className="btn-social"><GithubIcon /> GitHub</button>
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <span className="link" onClick={onGoLogin}>Login here</span>
        </p>
      </div>
    </div>
  );
}