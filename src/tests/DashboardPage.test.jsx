import { render, screen, within } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';

// Recharts fix (jsdom doesn't support ResizeObserver)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DashboardPage', () => {

  test('renders Personal Impact Dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Personal Impact Dashboard')).toBeInTheDocument();
  });

  test('shows Total Points stat card', () => {
    render(<DashboardPage />);

    const totalPointsCard =
      screen.getByText('Total Points').closest('.stat-card');

    expect(within(totalPointsCard).getByText('380')).toBeInTheDocument();
  });

  test('shows Items Identified stat card', () => {
    render(<DashboardPage />);

    const itemsCard =
      screen.getByText('Items Identified').closest('.stat-card');

    expect(within(itemsCard).getByText('38')).toBeInTheDocument();
  });

  test('renders Waste History Breakdown section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Waste History Breakdown')).toBeInTheDocument();
  });

  test('renders Gamification Progress section', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Gamification Progress')).toBeInTheDocument();

    const gamificationCard =
      screen.getByText('Gamification Progress').closest('.dash-card');

    expect(within(gamificationCard).getByText('380')).toBeInTheDocument();
  });

  test('shows items diverted progress (38/50)', () => {
    render(<DashboardPage />);

    expect(screen.getByText('38 / 50')).toBeInTheDocument();
    expect(screen.getByText(/12 more items/i)).toBeInTheDocument();
  });

  test('renders History Log section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('History Log')).toBeInTheDocument();
  });

  test('shows motivational message in gamification section', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/great job/i)).toBeInTheDocument();
  });
});