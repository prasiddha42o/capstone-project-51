import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

describe('App navigation flow', () => {

  // ✅ TC-A01: App starts on Login screen
  test('renders Login page on initial load', () => {
    render(<App />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // ✅ TC-A02: Login navigates to main app
  test('clicking Login button takes user to app (shows Navbar)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  // ✅ TC-A03: Can navigate to Register from Login
  test('clicking Sign up for free shows Register page', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign up for free'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  // ✅ TC-A04: Register page's Login here goes back to Login
  test('clicking Login here on Register page goes back to Login', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign up for free'));
    fireEvent.click(screen.getByText('Login here'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // ✅ TC-A05: Register Create Account navigates to app
  test('clicking Create Account on Register page enters the app', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign up for free'));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
  });

  // ✅ TC-A06: Logout from app goes back to Login
  test('clicking Logout returns to Login page', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // Find and click Logout in Navbar
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });
});