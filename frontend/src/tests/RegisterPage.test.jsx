import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../pages/RegisterPage';
import { vi } from 'vitest';

vi.mock('../utils/auth', () => ({
  registerUser: vi.fn(() =>
    Promise.resolve({
      success: true,
      user: { email: 'sita@gmail.com' }
    })
  )
}));

describe('RegisterPage', () => {

  // TC-R01: Page renders all fields
  test('renders name, email, password, confirm password fields', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    // Two password fields exist
    const pwFields = screen.getAllByPlaceholderText('••••••••');
    expect(pwFields).toHaveLength(2);
  });

  //  TC-R02: Create Account button is present
  test('renders Create Account button', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  // TC-R03: Clicking Create Account with valid details shows a success message
  // instead of auto-logging the user in -- they must go log in separately.
  test.only('shows success message when Create Account is clicked with valid details', async () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Sita Rai' }
    });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'sita@gmail.com' }
    });

    fireEvent.change(screen.getByPlaceholderText('Min 8 characters, 1 uppercase, 1 number'), {
      target: { value: 'Password123' }
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Password123' }
    });

    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    expect(await screen.findByText(/account created/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
  });

  // TC-R09: Create Account button is disabled until the terms checkbox is checked
  test('disables Create Account until terms checkbox is checked', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    expect(submitBtn).toBeDisabled();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(submitBtn).not.toBeDisabled();
  });

  // TC-R04: "Login here" navigates back to login
  test('calls onGoLogin when Login here is clicked', () => {
    const mockGoLogin = vi.fn();
    render(<RegisterPage onGoLogin={mockGoLogin} />);
    fireEvent.click(screen.getByText('Login here'));
    expect(mockGoLogin).toHaveBeenCalledTimes(1);
  });

  // TC-R05: Toggle password visibility
  test('toggles password field visibility', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    const pwFields = screen.getAllByPlaceholderText('••••••••');
    const eyeBtns = screen.getAllByRole('button', { name: '' });
    // First eye button toggles the first password field
    expect(pwFields[0]).toHaveAttribute('type', 'password');
    fireEvent.click(eyeBtns[0]);
    expect(pwFields[0]).toHaveAttribute('type', 'text');
  });

  // TC-R06: Terms of Service text visible
  test('renders Terms of Service link', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  //TC-R07: User can type name
  test('allows typing in Full Name field', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    const nameInput = screen.getByPlaceholderText('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Sita Rai' } });
    expect(nameInput.value).toBe('Sita Rai');
  });

  // TC-R08: Social signup buttons are not present
  test('does not render Google and GitHub signup buttons', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /github/i })).not.toBeInTheDocument();
  });

  // TC-R10: Clicking "Terms of Service" opens the terms modal without toggling the checkbox
  test('opens Terms of Service modal and does not toggle the agreement checkbox', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(screen.getByText('Terms of Service'));

    expect(screen.getByRole('dialog', { name: /terms of service/i })).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  // TC-R11: Clicking "Privacy Policy" opens the privacy modal
  test('opens Privacy Policy modal', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    fireEvent.click(screen.getByText('Privacy Policy'));
    expect(screen.getByRole('dialog', { name: /privacy policy/i })).toBeInTheDocument();
  });

  // TC-R12: Legal modal can be closed
  test('closes the legal modal when Close is clicked', () => {
    render(<RegisterPage onGoLogin={() => {}} />);
    fireEvent.click(screen.getByText('Terms of Service'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});