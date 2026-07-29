import { useState } from "react";
import {
  LeafIcon, MailIcon, LockIcon, UserIcon, EyeIcon,
} from "../components/Icons";
import LegalModal from "../components/LegalModal";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "../content/legalContent";
import { validateEmail } from "../utils/validation";
import { registerUser } from "../utils/auth";

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterPage({ onGoLogin }) {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null); // "terms" | "privacy" | null

  const openLegalDoc = (doc) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLegalDoc(doc);
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      setError("Password must be at least 8 characters and include an uppercase letter and a number");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    setError("");

    const result = await registerUser(trimmedName, trimmedEmail, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">
            <LeafIcon size={22} />
            <span className="auth-logo-text">Waste Assistant</span>
          </div>

          <h1 className="auth-title">Account Created</h1>
          <p className="auth-sub">
            Your account was created successfully. Please login to continue.
          </p>

          <button type="button" className="btn-primary" onClick={onGoLogin}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <LeafIcon size={22} />
          <span className="auth-logo-text">Waste Assistant</span>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Start your sustainability journey today</p>

        {error && <p style={{ color: "red", fontSize: 12, marginTop: 4 }}>{error}</p>}

        {/* NAME */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div className="input-wrap">
            <span className="input-icon"><UserIcon /></span>
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
            <span className="input-icon"><MailIcon /></span>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrap">
            <span className="input-icon"><LockIcon /></span>
            <input
              className="form-input"
              type={showPw ? "text" : "password"}
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="eye-btn" type="button" onClick={() => setShowPw((v) => !v)}>
              <EyeIcon off={showPw} />
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="input-wrap">
            <span className="input-icon"><LockIcon /></span>
            <input
              className="form-input"
              type={showCpw ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="eye-btn" type="button" onClick={() => setShowCpw((v) => !v)}>
              <EyeIcon off={showCpw} />
            </button>
          </div>
        </div>

        <label className="checkbox-label terms-text">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (error) setError("");
            }}
          />{" "}
          I agree to the{" "}
          <span className="link" onClick={openLegalDoc("terms")}>Terms of Service</span> and{" "}
          <span className="link" onClick={openLegalDoc("privacy")}>Privacy Policy</span>
        </label>

        <button className="btn-primary" onClick={handleRegister} disabled={loading || !agreedToTerms}>
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span className="link" onClick={onGoLogin}>Login here</span>
        </p>
      </div>

      {legalDoc === "terms" && (
        <LegalModal
          title="Terms of Service"
          sections={TERMS_OF_SERVICE}
          onClose={() => setLegalDoc(null)}
        />
      )}
      {legalDoc === "privacy" && (
        <LegalModal
          title="Privacy Policy"
          sections={PRIVACY_POLICY}
          onClose={() => setLegalDoc(null)}
        />
      )}
    </div>
  );
}