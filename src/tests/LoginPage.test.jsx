import { render, screen, fireEvent ,waitFor } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';
import { vi } from 'vitest';

vi.mock('../utils/auth', () => ({
  loginUser: vi.fn(() =>
    Promise.resolve({
      success: true,
      user: { email: 'test@example.com' }
    })
  )
}));

describe('LoginPage', () => {

  // TC-L01: LoginPage should render correctly and display the required UI elements such as 
  // email input field,password input field and Login button.
  test('renders login form with email, password inputs and login button', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // TC-L02: The LoginPage should display “Waste Assistant” text and “Welcome back” text
  test('renders Waste Assistant branding', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByText('Waste Assistant')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // TC-L03: Clicking the Login button with valid credentials should call the onLogin function with the user data.
test.only('calls onLogin when valid credentials are entered and Login is clicked', async () => {
  const mockLogin = vi.fn();

  render(
    <LoginPage
      onLogin={mockLogin}
      onGoRegister={() => {}}
    />
  );

  fireEvent.change(
    screen.getByPlaceholderText('you@example.com'),
    {
      target: { value: 'test@example.com' }
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText('••••••••'),
    {
      target: { value: 'password123' }
    }
  );

  fireEvent.click(
    screen.getByRole('button', { name: /login/i })
  );

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalled();
  });
});
  // TC-L04: Clicking "Sign up for free" calls onGoRegister function
  test('calls onGoRegister when sign up link is clicked', () => {
    const mockRegister = vi.fn();
    render(<LoginPage onLogin={() => {}} onGoRegister={mockRegister} />);
    fireEvent.click(screen.getByText('Sign up for free'));
    expect(mockRegister).toHaveBeenCalledTimes(1);
  });

  // TC-L05: Password toggle shows or hides password
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

  //  TC-L06: User should be able to type into email field.
  test('allows user to type into email input', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'bi@gmail.com' } });
    expect(emailInput.value).toBe('bi@gmail.com');
  });

  //  TC-L07: User should be able to check the password field.
  test('allows user to type into password input', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'mypassword123' } });
    expect(passwordInput.value).toBe('mypassword123');
  });

  // TC-L08: Social login buttons are present
  test('renders Google and GitHub social login buttons', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
  });

  // TC-L09: Remember me checkbox is present
  test('renders Remember me checkbox', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  // TC-L10: Forgot password link is visible
  test('renders Forgot password link', () => {
    render(<LoginPage onLogin={() => {}} onGoRegister={() => {}} />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });
});