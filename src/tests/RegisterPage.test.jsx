import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../pages/RegisterPage';

describe('RegisterPage', () => {

  // TC-R01: Page renders all fields
  test('renders name, email, password, confirm password fields', () => {
    render(<RegisterPage onLogin={() => {}} onGoLogin={() => {}} />);
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    // Two password fields exist
    const pwFields = screen.getAllByPlaceholderText('••••••••');
    expect(pwFields).toHaveLength(2);
  });

  //  TC-R02: Create Account button is present
  test('renders Create Account button', () => {
    render(<RegisterPage onLogin={() => {}} onGoLogin={() => {}} />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  // TC-R03: Clicking Create Account calls onLogin (navigates to app)
test.only('calls onLogin when Create Account is clicked', () => {
  const mockLogin = vi.fn();

  render(
    <RegisterPage
      onLogin={mockLogin}
      onGoLogin={() => {}}
    />
  );

  fireEvent.change(screen.getByPlaceholderText('John Doe'), {
    target: { value: 'Sita Rai' }
  });

  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: 'sita@gmail.com' }
  });

  const pwFields = screen.getAllByPlaceholderText('••••••••');

  fireEvent.change(pwFields[0], {
    target: { value: '123456' }
  });

  fireEvent.change(pwFields[1], {
    target: { value: '123456' }
  });

  fireEvent.click(
    screen.getByRole('button', { name: /create account/i })
  );

  expect(mockLogin).toHaveBeenCalledTimes(1);
});

  // TC-R04: "Login here" navigates back to login
  test('calls onGoLogin when Login here is clicked', () => {
    const mockGoLogin = vi.fn();
    render(<RegisterPage onLogin={() => {}} onGoLogin={mockGoLogin} />);
    fireEvent.click(screen.getByText('Login here'));
    expect(mockGoLogin).toHaveBeenCalledTimes(1);
  });

  // TC-R05: Toggle password visibility
  test('toggles password field visibility', () => {
    render(<RegisterPage onLogin={() => {}} onGoLogin={() => {}} />);
    const pwFields = screen.getAllByPlaceholderText('••••••••');
    const eyeBtns = screen.getAllByRole('button', { name: '' });
    // First eye button toggles the first password field
    expect(pwFields[0]).toHaveAttribute('type', 'password');
    fireEvent.click(eyeBtns[0]);
    expect(pwFields[0]).toHaveAttribute('type', 'text');
  });

  // TC-R06: Terms of Service text visible
  test('renders Terms of Service link', () => {
    render(<RegisterPage onLogin={() => {}} onGoLogin={() => {}} />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  //TC-R07: User can type name
  test('allows typing in Full Name field', () => {
    render(<RegisterPage onLogin={() => {}} onGoLogin={() => {}} />);
    const nameInput = screen.getByPlaceholderText('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Sita Rai' } });
    expect(nameInput.value).toBe('Sita Rai');
  });

  // TC-R08: Social signup buttons present
  test('renders Google and GitHub signup buttons', () => {
    render(<RegisterPage onLogin={() => {}} onGoLogin={() => {}} />);
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
  });
});