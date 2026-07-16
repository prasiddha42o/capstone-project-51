import { render, screen, fireEvent } from '@testing-library/react';
import LocalInfoPage from '../pages/LocalInfoPage';

describe('LocalInfoPage', () => {

  //  TC-LI01: Page heading renders
  test('renders Regional Info & Resources heading', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText('Regional Info & Resources')).toBeInTheDocument();
  });

  //  TC-LI02: District dropdown is rendered with the three supported districts
  test('renders district dropdown with the correct districts', () => {
    render(<LocalInfoPage />);
    const select = screen.getByRole('combobox', { name: /select district/i });
    expect(select).toBeInTheDocument();
    ['Kathmandu', 'Lalitpur', 'Bhaktapur'].forEach((d) => {
      expect(screen.getByRole('option', { name: d })).toBeInTheDocument();
    });
    expect(screen.queryByRole('option', { name: 'Pokhara' })).not.toBeInTheDocument();
  });

  // TC-LI03: Default district is Kathmandu
  test('defaults to Kathmandu district', () => {
    render(<LocalInfoPage />);
    expect(screen.getByRole('combobox', { name: /select district/i }).value).toBe('Kathmandu');
  });

  //  TC-LI04: Kathmandu collection centers shown by default
  test('shows Kathmandu collection centers by default', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText('Municipal Waste Collection')).toBeInTheDocument();
    expect(screen.getByText('Teku Recycling Center')).toBeInTheDocument();
  });

  

  // TC-LI05: Waste disposal rules render for Kathmandu
  test('shows disposal rules for Kathmandu', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/separate organic and inorganic/i)).toBeInTheDocument();
    expect(screen.getByText(/no littering/i)).toBeInTheDocument();
  });

  //  TC-LI06: Rules section shows selected district name
  test('rules title shows selected district name', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/Waste Disposal Rules for Kathmandu/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: /select district/i }), { target: { value: 'Lalitpur' } });
    expect(screen.getByText(/Waste Disposal Rules for Lalitpur/i)).toBeInTheDocument();
  });

  // TC-LI07: Phone numbers visible for Kathmandu centers
  test('shows phone numbers for collection centers', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText('+977-1-4123456')).toBeInTheDocument();
  });

  // TC-LI08: Note about ward-specific rules is shown
  test('renders note about contacting local municipal office', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/contact your local municipal office/i)).toBeInTheDocument();
  });

  // TC-LI09: Live location map controls are available
  test('shows live location map controls for finding the nearest collector', () => {
    render(<LocalInfoPage />);
    expect(screen.getByText(/live location map/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /select municipality/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use my location/i })).toBeInTheDocument();
  });

  test('renders the correct Kathmandu municipalities', () => {
    render(<LocalInfoPage />);
    const municipalitySelect = screen.getByRole('combobox', { name: /select municipality/i });
    ['Kathmandu Metropolitan City', 'Budhanilkantha Municipality', 'Chandragiri Municipality', 'Dakshinkali Municipality', 'Gokarneshwor Municipality', 'Kageshwari Manohara Municipality', 'Kirtipur Municipality', 'Nagarjun Municipality', 'Shankharapur Municipality', 'Tarakeshwar Municipality', 'Tokha Municipality'].forEach((name) => {
      expect(screen.getByRole('option', { name })).toBeInTheDocument();
    });
    expect(municipalitySelect.value).toBe('Kathmandu Metropolitan City');
  });
});