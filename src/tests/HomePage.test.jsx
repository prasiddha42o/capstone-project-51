import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  test('renders main heading and hero content', () => {
    render(<HomePage setPage={() => {}} />);
    expect(screen.getByText('Waste Management')).toBeInTheDocument();
    expect(screen.getByText(/Join the movement to tackle Nepal's waste crisis/i)).toBeInTheDocument();
  });

  test('mission cards render with expected titles', () => {
    render(<HomePage setPage={() => {}} />);
    expect(screen.getByText('Smart Identification')).toBeInTheDocument();
    expect(screen.getByText('SDG Impact')).toBeInTheDocument();
    expect(screen.getByText('Community Driven')).toBeInTheDocument();
  });

  test('stats banner shows key numbers', () => {
    render(<HomePage setPage={() => {}} />);
    expect(screen.getByText(/12,450\+/)).toBeInTheDocument();
    expect(screen.getByText(/3,280\+/)).toBeInTheDocument();
    expect(screen.getByText(/8,750\+/)).toBeInTheDocument();
  });

  test('calls setPage("Identify") when Get Started button clicked', () => {
    const mockSetPage = vi.fn();
    render(<HomePage setPage={mockSetPage} />);
    const btn = screen.getAllByRole('button').find(b => /get started now/i.test(b.textContent) || /start identifying/i.test(b.textContent));
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(mockSetPage).toHaveBeenCalledWith('Identify');
  });
});
