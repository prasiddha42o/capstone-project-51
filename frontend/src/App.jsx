import { useState } from 'react'
import './App.css'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  remember: false,
}

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setErrors({})
    setMessage('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (mode === 'signup') {
      if (!form.name.trim()) {
        nextErrors.name = 'Full name is required.'
      }
      if (!form.confirmPassword) {
        nextErrors.confirmPassword = 'Please confirm your password.'
      } else if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = 'Passwords do not match.'
      }
    }

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrors({})
    setMessage('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    window.setTimeout(() => {
      setIsLoading(false)
      setMessage(
        mode === 'login'
          ? 'Login successful. Welcome back to the platform.'
          : 'Account created successfully. You can now sign in.'
      )
      setForm(initialForm)
    }, 1200)
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <path d="M18 14c0-5 4-8 9-8 10 0 18 8 18 19 0 10-7 17-15 17-8 0-12-5-12-11 0-8 6-13 10-15 0 2-2 4-2 6 0 6 7 8 7 8s-1-3-1-5c0-4 3-7 7-7 4 0 7 3 7 8 0 8-6 13-12 13-4 0-6-2-6-6 0-4 3-7 6-8l-2-3c-4 2-6 5-6 10Z" />
              <path d="M28 48c7 0 12-5 12-12 0-6-4-11-10-11-5 0-9 3-9 9 0 7 5 14 7 14Z" />
            </svg>
          </div>
          <div>
            <p className="brand-title">AI-Based Waste Classification System</p>
            <span className="brand-subtitle">Clean data for cleaner cities</span>
          </div>
        </div>

        <nav className="top-links" aria-label="Quick links">
          <a href="#">About</a>
          <a href="#">Features</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <main className="auth-shell">
        <section className="hero-panel" aria-label="Platform overview">
          <p className="hero-eyebrow">Eco-friendly AI platform</p>
          <h1>Smarter sorting for a more sustainable future.</h1>
          <p className="hero-copy">
            Classify waste responsibly with intelligent insights designed for environmental protection and better resource recovery.
          </p>

          <ul className="feature-list">
            <li>Smart recycling guidance</li>
            <li>Real-time environmental insights</li>
            <li>Secure and accessible experience</li>
          </ul>
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="card-badge">Secure access</div>
          <h2 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="subtext">
            {mode === 'login'
              ? 'Sign in to continue monitoring waste insights.'
              : 'Join the platform to start smarter waste management.'}
          </p>

          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => switchMode('signup')}
            >
              Signup
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <label>
                <span>Full name</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Asha Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <small className="error-text">{errors.name}</small>}
              </label>
            )}

            <label>
              <span>Email address</span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <small className="error-text">{errors.email}</small>}
            </label>

            <label>
              <span>Password</span>
              <div className="input-with-action">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <small className="error-text">{errors.password}</small>}
            </label>

            {mode === 'signup' && (
              <label>
                <span>Confirm password</span>
                <div className="input-with-action">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
              </label>
            )}

            {mode === 'login' && (
              <div className="inline-row">
                <label className="checkbox-row">
                  <input
                    name="remember"
                    type="checkbox"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-button">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
              {isLoading ? 'Processing...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          {message ? (
            <p className="success-message" role="status" aria-live="polite">
              {message}
            </p>
          ) : null}

          <p className="footer-text">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className="link-btn"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
