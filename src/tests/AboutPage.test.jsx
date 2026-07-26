import { render, screen } from '@testing-library/react';
import AboutPage from '../pages/AboutPage';

describe('AboutPage', () => {
  test('renders About & SDG Knowledge title and subtitle', () => {
    render(<AboutPage />);
    expect(screen.getByText('About & SDG Knowledge')).toBeInTheDocument();
    expect(screen.getByText(/Understanding the crisis and our solution/i)).toBeInTheDocument();
  });

  test('shows The "Why" and critical fact content', () => {
    render(<AboutPage />);
    expect(screen.getByText(/The "Why"/i)).toBeInTheDocument();
    expect(screen.getByText(/1,300 metric tons of waste daily/i)).toBeInTheDocument();
    expect(screen.getByText(/Only about 15% of Kathmandu's waste is recycled or composted/i)).toBeInTheDocument();
  });

  test('shows The "How" section and SDG support boxes', () => {
    render(<AboutPage />);
    expect(screen.getByText(/The "How"/i)).toBeInTheDocument();
    expect(screen.getByText(/Supporting SDG 12/i)).toBeInTheDocument();
    expect(screen.getByText(/Supporting SDG 11/i)).toBeInTheDocument();
  });

  test('team contact emails are present as links', () => {
    render(<AboutPage />);
    expect(screen.getByText('support@wasteassistant.np').closest('a')).toHaveAttribute('href', 'mailto:support@wasteassistant.np');
    expect(screen.getByText('feedback@wasteassistant.np').closest('a')).toHaveAttribute('href', 'mailto:feedback@wasteassistant.np');
  });
});
