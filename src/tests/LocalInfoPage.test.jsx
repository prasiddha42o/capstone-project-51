import { render, screen, fireEvent } from '@testing-library/react';
import LocalInfoPage from '../pages/LocalInfoPage';

describe('LocalInfoPage', () => {

  // ✅ TC-LI01: Page heading renders
  test('renders Regional Info & Resources heading', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText('Regional Info & Resources')).toBeInTheDocument();
  });

  // ✅ TC-LI02: District dropdown is rendered with all 6 districts
  test('renders district dropdown with all districts', () => {
    render(<LocalInfoPage />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Butwal'].forEach((d) => {
      expect(screen.getByRole('option', { name: d })).toBeInTheDocument();
    });
  });

  // ✅ TC-LI03: Default district is Kathmandu
  test('defaults to Kathmandu district', () => {
    render(<LocalInfoPage />);
    expect(screen.getByRole('combobox').value).toBe('Kathmandu');
  });

  // ✅ TC-LI04: Kathmandu collection centers shown by default
  test('shows Kathmandu collection centers by default', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText('Municipal Waste Collection')).toBeInTheDocument();
    expect(screen.getByText('Teku Recycling Center')).toBeInTheDocument();
  });

  // ✅ TC-LI05: Switching to Lalitpur shows Lalitpur data
  test('shows Lalitpur data when Lalitpur is selected', () => {
    render(<LocalInfoPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Lalitpur' } });
    expect(screen.getByText('Lalitpur Metro Waste')).toBeInTheDocument();
    expect(screen.getByText('Patan Scrap Collectors')).toBeInTheDocument();
  });

  // ✅ TC-LI06: Switching to Bhaktapur shows Bhaktapur data
  test('shows Bhaktapur data when Bhaktapur is selected', () => {
    render(<LocalInfoPage />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Bhaktapur' } });
    expect(screen.getByText('Bhaktapur Municipality Waste')).toBeInTheDocument();
  });

  // ✅ TC-LI07: Waste disposal rules render for Kathmandu
  test('shows disposal rules for Kathmandu', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/separate organic and inorganic/i)).toBeInTheDocument();
    expect(screen.getByText(/no littering/i)).toBeInTheDocument();
  });

  // ✅ TC-LI08: Rules section shows selected district name
  test('rules title shows selected district name', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/Waste Disposal Rules for Kathmandu/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Lalitpur' } });
    expect(screen.getByText(/Waste Disposal Rules for Lalitpur/i)).toBeInTheDocument();
  });

  // ✅ TC-LI09: Phone numbers visible for Kathmandu centers
  test('shows phone numbers for collection centers', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText('+977-1-4123456')).toBeInTheDocument();
  });

  // ✅ TC-LI10: Note about ward-specific rules is shown
  test('renders note about contacting local municipal office', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/contact your local municipal office/i)).toBeInTheDocument();
  });
});