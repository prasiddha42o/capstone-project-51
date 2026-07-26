import { render, screen, fireEvent } from '@testing-library/react';

// Mock auth utilities to avoid network calls and control login/register flows
vi.mock('../utils/auth', () => ({
  loginUser: vi.fn(async () => ({ success: true, user: { id: 'u1', name: 'Test User' } })),
  registerUser: vi.fn(async () => ({ success: true, user: { id: 'u1', name: 'New User' } })),
  getCurrentUser: vi.fn(() => null),
  logoutUser: vi.fn(),
}));

import App from '../App';

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

describe('App navigation flow', () => {

  // ✅ TC-A01: App starts on Login screen
  test('renders Login page on initial load', () => {
    render(<App />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // ✅ TC-A02: Login navigates to main app
  test('clicking Login button takes user to app (shows Navbar)', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/•/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await screen.findByRole('button', { name: /logout/i });
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  // ✅ TC-A03: Can navigate to Register from Login
  test('clicking Sign up for free shows Register page', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign up for free'));
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  // ✅ TC-A04: Register page's Login here goes back to Login
  test('clicking Login here on Register page goes back to Login', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign up for free'));
    fireEvent.click(screen.getByText('Login here'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // ✅ TC-A05: Register Create Account navigates to app
  test('clicking Create Account on Register page enters the app', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Sign up for free'));
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@example.com' } });
    const pwInputs = screen.getAllByPlaceholderText(/•/);
    fireEvent.change(pwInputs[0], { target: { value: 'passw0rd' } });
    fireEvent.change(pwInputs[1], { target: { value: 'passw0rd' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await screen.findByRole('button', { name: /logout/i });
    expect(screen.queryByRole('heading', { name: /create account/i })).not.toBeInTheDocument();
  });

  // ✅ TC-A06: Logout from app goes back to Login
  test('clicking Logout returns to Login page', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/•/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await screen.findByRole('button', { name: /logout/i });
    // Find and click Logout in Navbar
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    await screen.findByText('Welcome Back');
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });
});