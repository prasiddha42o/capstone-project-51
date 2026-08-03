import { render, screen } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';

// Recharts uses ResizeObserver which isn't in jsdom — mock it
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

describe('DashboardPage', () => {

  //  TC-D01: Page heading renders
  test('renders Personal Impact Dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Personal Impact Dashboard')).toBeInTheDocument();
  });

  // TC-D02: Total Points stat card visible
test('shows Total Points stat card', () => {
  render(<DashboardPage />);

  expect(screen.getByText('Total Points')).toBeInTheDocument();

  const all380s = screen.getAllByText('380');
  expect(all380s.length).toBeGreaterThan(0);
});

  //  TC-D03: Items Identified stat card visible
  test('shows 38 Items Identified stat card', () => {
    render(<DashboardPage />);
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('Items Identified')).toBeInTheDocument();
  });

  //  TC-D04: Waste History Breakdown section visible
  test('renders Waste History Breakdown section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Waste History Breakdown')).toBeInTheDocument();
  });

  // TC-D05: Gamification progress section visible
test('renders Gamification Progress section', () => {
  render(<DashboardPage />);

  expect(screen.getByText('Gamification Progress')).toBeInTheDocument();
});

  //  TC-D06: Progress toward milestone shown
  test('shows items diverted progress (38/50)', () => {
    render(<DashboardPage />);
    expect(screen.getByText('38 / 50')).toBeInTheDocument();
    expect(screen.getByText(/12 more items/i)).toBeInTheDocument();
  });

  // TC-D07: History log section renders
  test('renders History Log section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('History Log')).toBeInTheDocument();
  });

  // TC-D08: Motivational message visible
  test('shows motivational message in gamification section', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/great job/i)).toBeInTheDocument();
  });
});