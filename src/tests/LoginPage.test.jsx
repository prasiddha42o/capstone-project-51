import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {

  // ✅ TC-L01: Page renders correctly
  test('renders login form with email, password inputs and login button', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // ✅ TC-L02: Logo and branding visible
  test('renders Waste Assistant branding', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByText('Waste Assistant')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // ✅ TC-L03: Clicking Login calls onLogin
  test('calls onLogin when Login button is clicked', () => {
    const mockLogin = vi.fn();
    render(<LoginPage onLogin={mockLogin} onGoRegister={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  // ✅ TC-L04: Clicking "Sign up for free" calls onGoRegister
  test('calls onGoRegister when sign up link is clicked', () => {
    const mockRegister = vi.fn();
    render(<LoginPage onLogin={() => {}} onGoRegister={mockRegister} />);
    fireEvent.click(screen.getByText('Sign up for free'));
    expect(mockRegister).toHaveBeenCalledTimes(1);
  });

  // ✅ TC-L05: Password toggle shows/hides password
  test('toggles password visibility when eye button is clicked', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');
    // The eye button is the only button besides Login and social buttons
    const eyeBtn = screen.getByRole('button', { name: '' }); // eye icon button has no text
    fireEvent.click(eyeBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(eyeBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // ✅ TC-L06: User can type into email field
  test('allows user to type into email input', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  // ✅ TC-L07: User can type into password field
  test('allows user to type into password input', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'mypassword123' } });
    expect(passwordInput.value).toBe('mypassword123');
  });

  // ✅ TC-L08: Social login buttons are present
  test('renders Google and GitHub social login buttons', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
  });

  // ✅ TC-L09: Remember me checkbox is present
  test('renders Remember me checkbox', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  // ✅ TC-L10: Forgot password link is visible
  test('renders Forgot password link', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });
});